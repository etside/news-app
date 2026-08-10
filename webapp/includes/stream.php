<?php
/**
 * Server-Sent Events (SSE) Helper
 * For streaming AI responses to the browser
 */

class SSEStream {
    private bool $closed = false;

    public function __construct() {
        // Set headers for SSE
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        // Disable output buffering
        if (function_exists('apache_setenv')) {
            apache_setenv('no-gzip', '1');
        }
        @ini_set('zlib.output_compression', '0');
        while (ob_get_level() > 0) {
            ob_end_flush();
        }
        if (function_exists('ob_implicit_flush')) {
            ob_implicit_flush(true);
        }
    }

    /**
     * Send an SSE event
     */
    public function send(string $event, mixed $data): void {
        if ($this->closed) return;

        $payload = "event: {$event}\n";
        $payload .= "data: " . json_encode($data) . "\n\n";

        echo $payload;
        flush();
    }

    /**
     * Send a message chunk (for streaming text)
     */
    public function sendChunk(string $chunk): void {
        $this->send('chunk', ['content' => $chunk]);
    }

    /**
     * Send a tool call event
     */
    public function sendToolCall(string $id, string $name, array $args): void {
        $this->send('tool_call', [
            'id' => $id,
            'name' => $name,
            'arguments' => $args,
        ]);
    }

    /**
     * Send a tool result event
     */
    public function sendToolResult(string $toolCallId, array $result): void {
        $this->send('tool_result', [
            'tool_call_id' => $toolCallId,
            'result' => $result,
        ]);
    }

    /**
     * Send a thinking/reasoning event
     */
    public function sendThinking(string $content): void {
        $this->send('thinking', ['content' => $content]);
    }

    /**
     * Send an error event
     */
    public function sendError(string $message, ?string $code = null): void {
        $this->send('error', [
            'message' => $message,
            'code' => $code,
        ]);
    }

    /**
     * Send a done event
     */
    public function sendDone(array $meta = []): void {
        $this->send('done', $meta);
        $this->close();
    }

    /**
     * Close the stream
     */
    public function close(): void {
        if (!$this->closed) {
            $this->closed = true;
            echo "event: close\ndata: {}\n\n";
            flush();
        }
    }

    /**
     * Check if stream is still open
     */
    public function isOpen(): bool {
        return !$this->closed;
    }

    /**
     * Send a keepalive ping
     */
    public function ping(): void {
        $this->send('ping', ['time' => time()]);
    }
}

/**
 * Non-streaming response helper
 */
class jsonResponse {
    public static function send(mixed $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function error(string $message, int $statusCode = 400): void {
        self::send(['error' => $message], $statusCode);
    }

    public static function success(mixed $data = null): void {
        self::send(['success' => true, 'data' => $data]);
    }
}
