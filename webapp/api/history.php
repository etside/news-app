<?php
/**
 * Chat History API
 * GET /api/history.php - List sessions
 * GET /api/history.php?id=X - Get session with messages
 * DELETE /api/history.php?id=X - Delete session
 */

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/stream.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$user = Auth::isLoggedIn() ? Auth::getUser() : null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $sessionId = $_GET['id'] ?? null;

        if ($sessionId) {
            // Get single session with messages
            $session = Database::fetch("SELECT * FROM sessions WHERE id = ?", [$sessionId]);
            if (!$session) {
                jsonResponse::error('Session not found', 404);
            }

            $messages = Database::fetchAll(
                "SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC",
                [$sessionId]
            );

            // Parse JSON fields
            foreach ($messages as &$msg) {
                if ($msg['tool_calls']) {
                    $msg['tool_calls'] = json_decode($msg['tool_calls'], true);
                }
            }

            jsonResponse::send([
                'session' => $session,
                'messages' => $messages,
            ]);
        } else {
            // List all sessions
            $where = $user ? "WHERE user_id = ?" : "";
            $params = $user ? [$user['id']] : [];

            $sessions = Database::fetchAll(
                "SELECT s.*,
                    (SELECT COUNT(*) FROM messages WHERE session_id = s.id) as message_count,
                    (SELECT content FROM messages WHERE session_id = s.id AND role = 'user' ORDER BY id ASC LIMIT 1) as first_message
                FROM sessions s
                {$where}
                ORDER BY s.updated_at DESC
                LIMIT 50",
                $params
            );

            jsonResponse::send(['sessions' => $sessions]);
        }
        break;

    case 'DELETE':
        $sessionId = $_GET['id'] ?? null;

        if (!$sessionId) {
            jsonResponse::error('Session ID is required');
        }

        $session = Database::fetch("SELECT * FROM sessions WHERE id = ?", [$sessionId]);
        if (!$session) {
            jsonResponse::error('Session not found', 404);
        }

        // Delete messages first (foreign key cascade should handle this, but be safe)
        Database::delete('messages', 'session_id = ?', [$sessionId]);
        Database::delete('tool_logs', 'session_id = ?', [$sessionId]);
        Database::delete('sessions', 'id = ?', [$sessionId]);

        jsonResponse::success(['deleted' => $sessionId]);
        break;

    default:
        jsonResponse::error('Method not allowed', 405);
}
