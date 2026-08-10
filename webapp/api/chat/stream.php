<?php
/**
 * Chat Streaming API
 * POST /api/chat/stream.php
 * Streams AI responses via Server-Sent Events
 */

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/stream.php';
require_once __DIR__ . '/../../includes/sandbox.php';
require_once __DIR__ . '/../../config/providers.php';
require_once __DIR__ . '/../../config/app.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse::error('Method not allowed', 405);
}

// Auth check (optional - allow anonymous for MVP)
$user = Auth::isLoggedIn() ? Auth::getUser() : null;

// Parse request
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['message'])) {
    jsonResponse::error('Message is required');
}

$message = $input['message'];
$sessionId = $input['session_id'] ?? null;
$providerId = $input['provider'] ?? 'gitlawb-opengateway';
$model = $input['model'] ?? null;
$tools = $input['tools'] ?? [];

// Get or create session
if ($sessionId) {
    $session = Database::fetch("SELECT * FROM sessions WHERE id = ?", [$sessionId]);
    if (!$session) {
        jsonResponse::error('Session not found', 404);
    }
    $providerId = $session['provider'];
    $model = $session['model'];
} else {
    $sessionId = Database::insert('sessions', [
        'user_id' => $user['id'] ?? null,
        'title' => substr($message, 0, 100),
        'provider' => $providerId,
        'model' => $model ?? 'mimo-v2.5-pro',
    ]);
}

// Get provider config
$provider = getProvider($providerId);
if (!$provider) {
    jsonResponse::error("Unknown provider: {$providerId}");
}

$apiKey = resolveApiKey($providerId);
if (empty($apiKey)) {
    jsonResponse::error("API key not configured for provider: {$providerId}");
}

// Save user message
Database::insert('messages', [
    'session_id' => $sessionId,
    'role' => 'user',
    'content' => $message,
]);

// Build message history for API
$history = Database::fetchAll(
    "SELECT role, content, tool_calls, tool_call_id, tool_name FROM messages WHERE session_id = ? ORDER BY id ASC",
    [$sessionId]
);

// Get system prompt
$settings = $user ? Database::fetch("SELECT system_prompt FROM settings WHERE user_id = ?", [$user['id']]) : null;
$systemPrompt = $settings['system_prompt'] ?? 'You are a helpful coding assistant.';

// Build API messages
$apiMessages = array_merge(
    [['role' => 'system', 'content' => $systemPrompt]],
    array_map(function($msg) {
        $apiMsg = ['role' => $msg['role'], 'content' => $msg['content']];

        if ($msg['tool_calls'] && $msg['role'] === 'assistant') {
            $apiMsg['tool_calls'] = json_decode($msg['tool_calls'], true);
        }

        if ($msg['tool_call_id']) {
            $apiMsg['tool_call_id'] = $msg['tool_call_id'];
            $apiMsg['name'] = $msg['tool_name'];
        }

        return $apiMsg;
    }, $history)
);

// Add current message
$apiMessages[] = ['role' => 'user', 'content' => $message];

// Build request body
$body = buildApiBody($providerId, $apiMessages, [
    'model' => $model,
    'stream' => true,
    'max_tokens' => 4096,
    'tools' => !empty($tools) ? $tools : null,
]);

// Start SSE stream
$stream = new SSEStream();
$sandbox = new Sandbox();

// Send session ID for client
$stream->send('session', ['id' => $sessionId]);

// Stream response from API
$baseUrl = rtrim($provider['base_url'], '/');
$url = "{$baseUrl}/chat/completions";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($body),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        "{$provider['auth_header']}: {$provider['auth_prefix']}{$apiKey}",
        'Accept-Encoding: identity',
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
]);

$responseBuffer = '';
$fullContent = '';
$toolCalls = [];
$currentToolCall = null;

// Use a callback to process streaming response
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) use ($stream, &$responseBuffer, &$fullContent, &$toolCalls, &$currentToolCall, $sandbox, $sessionId) {
    $responseBuffer .= $chunk;

    // Process complete lines
    while (($pos = strpos($responseBuffer, "\n")) !== false) {
        $line = substr($responseBuffer, 0, $pos);
        $responseBuffer = substr($responseBuffer, $pos + 1);
        $line = trim($line);

        if (empty($line) || $line === 'data: [DONE]') {
            continue;
        }

        if (strpos($line, 'data: ') !== 0) {
            continue;
        }

        $jsonStr = substr($line, 6);
        $data = json_decode($jsonStr, true);

        if (!$data || !isset($data['choices'][0])) {
            continue;
        }

        $delta = $data['choices'][0]['delta'] ?? null;
        $finishReason = $data['choices'][0]['finish_reason'] ?? null;

        if ($delta) {
            // Handle text content
            if (isset($delta['content']) && $delta['content'] !== null) {
                $stream->sendChunk($delta['content']);
                $fullContent .= $delta['content'];
            }

            // Handle tool calls
            if (isset($delta['tool_calls'])) {
                foreach ($delta['tool_calls'] as $tc) {
                    $index = $tc['index'] ?? 0;

                    if (!isset($toolCalls[$index])) {
                        $toolCalls[$index] = [
                            'id' => $tc['id'] ?? '',
                            'type' => 'function',
                            'function' => [
                                'name' => $tc['function']['name'] ?? '',
                                'arguments' => '',
                            ],
                        ];
                    }

                    if (isset($tc['id'])) {
                        $toolCalls[$index]['id'] = $tc['id'];
                    }
                    if (isset($tc['function']['name'])) {
                        $toolCalls[$index]['function']['name'] = $tc['function']['name'];
                    }
                    if (isset($tc['function']['arguments'])) {
                        $toolCalls[$index]['function']['arguments'] .= $tc['function']['arguments'];
                    }
                }
            }

            // Handle thinking/reasoning (if provider supports it)
            if (isset($delta['reasoning_content']) && $delta['reasoning_content'] !== null) {
                $stream->sendThinking($delta['reasoning_content']);
            }
        }

        // Handle finish
        if ($finishReason === 'tool_calls' && !empty($toolCalls)) {
            // Save assistant message with tool calls
            Database::insert('messages', [
                'session_id' => $sessionId,
                'role' => 'assistant',
                'content' => $fullContent,
                'tool_calls' => json_encode($toolCalls),
            ]);

            // Execute each tool call
            foreach ($toolCalls as $tc) {
                $toolName = $tc['function']['name'];
                $toolArgs = json_decode($tc['function']['arguments'], true) ?: [];

                $stream->sendToolCall($tc['id'], $toolName, $toolArgs);

                // Execute tool in sandbox
                $result = $sandbox->execute($toolName, $toolArgs);

                // Log tool execution
                Database::insert('tool_logs', [
                    'session_id' => $sessionId,
                    'tool_name' => $toolName,
                    'input' => json_encode($toolArgs),
                    'output' => json_encode($result),
                    'duration_ms' => $result['duration_ms'] ?? 0,
                    'success' => $result['success'] ?? false,
                ]);

                $stream->sendToolResult($tc['id'], $result);

                // Save tool result as message
                Database::insert('messages', [
                    'session_id' => $sessionId,
                    'role' => 'tool',
                    'content' => json_encode($result['output']),
                    'tool_call_id' => $tc['id'],
                    'tool_name' => $toolName,
                ]);

                // Add tool result to messages for continuation
                $apiMessages[] = [
                    'role' => 'assistant',
                    'content' => $fullContent,
                    'tool_calls' => $toolCalls,
                ];
                $apiMessages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result['output']),
                    'tool_call_id' => $tc['id'],
                    'name' => $toolName,
                ];
            }

            // Continue conversation with tool results
            // (In a real implementation, you'd loop back to call the API again)
        } elseif ($finishReason === 'stop' || $finishReason === 'length') {
            // Save final assistant message
            if (!empty($fullContent)) {
                Database::insert('messages', [
                    'session_id' => $sessionId,
                    'role' => 'assistant',
                    'content' => $fullContent,
                ]);
            }
        }
    }

    return strlen($chunk);
});

curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode !== 200 && $httpCode !== 0) {
    $stream->sendError("API returned HTTP {$httpCode}", 'API_ERROR');
}

if ($curlError) {
    $stream->sendError("cURL error: {$curlError}", 'CURL_ERROR');
}

// Update session title if first message
$msgCount = Database::fetch("SELECT COUNT(*) as count FROM messages WHERE session_id = ?", [$sessionId]);
if ($msgCount && $msgCount['count'] <= 2) {
    $shortTitle = substr($message, 0, 80);
    Database::update('sessions', ['title' => $shortTitle], 'id = ?', [$sessionId]);
}

$stream->sendDone(['session_id' => $sessionId]);
