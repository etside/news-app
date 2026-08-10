<?php
/**
 * Tool Execution Sandbox
 * Executes tool calls in a restricted environment
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';

class Sandbox {
    private string $workDir;
    private bool $enabled;

    public function __construct() {
        $this->workDir = SANDBOX_WORK_DIR;
        $this->enabled = SANDBOX_ENABLED;
        $this->ensureWorkDir();
    }

    private function ensureWorkDir(): void {
        if (!is_dir($this->workDir)) {
            mkdir($this->workDir, 0755, true);
        }
    }

    /**
     * Execute a tool call from the AI
     */
    public function execute(string $toolName, array $input): array {
        $startTime = microtime(true);

        try {
            $result = match($toolName) {
                'read_file' => $this->readFile($input['path'] ?? ''),
                'write_file' => $this->writeFile($input['path'] ?? '', $input['content'] ?? ''),
                'list_files' => $this->listFiles($input['path'] ?? '.', $input['recursive'] ?? false),
                'search_files' => $this->searchFiles($input['pattern'] ?? '', $input['path'] ?? '.'),
                'execute_command' => $this->executeCommand($input['command'] ?? ''),
                'get_file_info' => $this->getFileInfo($input['path'] ?? ''),
                default => ['error' => "Unknown tool: {$toolName}"],
            ];

            $duration = (int) ((microtime(true) - $startTime) * 1000);

            return [
                'success' => !isset($result['error']),
                'output' => $result,
                'duration_ms' => $duration,
            ];
        } catch (\Exception $e) {
            $duration = (int) ((microtime(true) - $startTime) * 1000);
            return [
                'success' => false,
                'output' => ['error' => $e->getMessage()],
                'duration_ms' => $duration,
            ];
        }
    }

    private function readFile(string $path): array {
        $fullPath = $this->resolvePath($path);

        if (!file_exists($fullPath)) {
            return ['error' => "File not found: {$path}"];
        }

        if (!is_file($fullPath)) {
            return ['error' => "Not a file: {$path}"];
        }

        $size = filesize($fullPath);
        if ($size > MAX_FILE_SIZE) {
            return ['error' => "File too large: " . $this->formatSize($size)];
        }

        $content = file_get_contents($fullPath);
        if ($content === false) {
            return ['error' => "Failed to read file: {$path}"];
        }

        return [
            'content' => $content,
            'size' => $size,
            'path' => $path,
        ];
    }

    private function writeFile(string $path, string $content): array {
        $fullPath = $this->resolvePath($path);
        $dir = dirname($fullPath);

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $result = file_put_contents($fullPath, $content);
        if ($result === false) {
            return ['error' => "Failed to write file: {$path}"];
        }

        return [
            'path' => $path,
            'bytes_written' => $result,
        ];
    }

    private function listFiles(string $path, bool $recursive): array {
        $fullPath = $this->resolvePath($path);

        if (!is_dir($fullPath)) {
            return ['error' => "Directory not found: {$path}"];
        }

        $items = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($fullPath, RecursiveDirectoryIterator::SKIP_DOTS),
            $recursive ? RecursiveIteratorIterator::SELF_FIRST : RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $item) {
            $relativePath = str_replace($fullPath . '/', '', $item->getPathname());
            $items[] = [
                'name' => $item->getFilename(),
                'path' => $relativePath,
                'type' => $item->isDir() ? 'directory' : 'file',
                'size' => $item->isFile() ? $item->getSize() : null,
            ];

            if (!$recursive && count($items) >= 100) {
                break;
            }
        }

        return ['items' => $items, 'path' => $path];
    }

    private function searchFiles(string $pattern, string $path): array {
        $fullPath = $this->resolvePath($path);

        if (!is_dir($fullPath)) {
            return ['error' => "Directory not found: {$path}"];
        }

        $matches = [];
        $escapedPattern = escapeshellarg($pattern);
        $escapedPath = escapeshellarg($fullPath);

        // Use grep for efficient searching
        $command = "grep -r -l {$escapedPattern} {$escapedPath} 2>/dev/null | head -50";
        $output = shell_exec($command);

        if ($output) {
            $files = array_filter(explode("\n", trim($output)));
            foreach ($files as $file) {
                $relativePath = str_replace($fullPath . '/', '', $file);
                $matches[] = [
                    'path' => $relativePath,
                    'full_path' => $file,
                ];
            }
        }

        return ['matches' => $matches, 'pattern' => $pattern, 'path' => $path];
    }

    private function executeCommand(string $command): array {
        if (!$this->enabled) {
            return ['error' => 'Command execution is disabled'];
        }

        // Basic command validation
        $forbidden = ['rm -rf /', 'mkfs', 'dd if=', '> /dev/', ':(){', 'shutdown', 'reboot', 'halt', 'init 0'];
        foreach ($forbidden as $pattern) {
            if (stripos($command, $pattern) !== false) {
                return ['error' => "Forbidden command pattern: {$pattern}"];
            }
        }

        // Restrict to allowed commands if configured
        $cmdParts = explode(' ', trim($command));
        $baseCommand = basename($cmdParts[0]);

        if (!empty(SANDBOX_ALLOWED_COMMANDS) && !in_array($baseCommand, SANDBOX_ALLOWED_COMMANDS)) {
            return ['error' => "Command not allowed: {$baseCommand}. Allowed: " . implode(', ', SANDBOX_ALLOWED_COMMANDS)];
        }

        $output = [];
        $exitCode = 0;

        exec("{$command} 2>&1", $output, $exitCode);

        return [
            'output' => implode("\n", $output),
            'exit_code' => $exitCode,
            'command' => $command,
        ];
    }

    private function getFileInfo(string $path): array {
        $fullPath = $this->resolvePath($path);

        if (!file_exists($fullPath)) {
            return ['error' => "File not found: {$path}"];
        }

        $stat = stat($fullPath);
        $info = [
            'path' => $path,
            'type' => is_dir($fullPath) ? 'directory' : 'file',
            'size' => $stat['size'],
            'size_formatted' => $this->formatSize($stat['size']),
            'modified' => date('Y-m-d H:i:s', $stat['mtime']),
            'permissions' => substr(sprintf('%o', fileperms($fullPath)), -4),
        ];

        if (is_file($fullPath)) {
            $info['extension'] = pathinfo($fullPath, PATHINFO_EXTENSION);
            $info['mime_type'] = mime_content_type($fullPath);
        }

        return $info;
    }

    private function resolvePath(string $path): string {
        // Resolve relative to work directory
        if ($path[0] !== '/') {
            $path = $this->workDir . '/' . $path;
        }

        // Normalize path
        $path = realpath($path) ?: $path;

        // Security: ensure path is within work directory
        if (strpos($path, $this->workDir) !== 0) {
            throw new \Exception("Access denied: path outside work directory");
        }

        return $path;
    }

    private function formatSize(int $bytes): string {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
