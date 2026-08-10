<?php
/**
 * File Read API
 * GET /api/files/read.php?path=/path/to/file
 */

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/stream.php';
require_once __DIR__ . '/../../config/app.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$path = $_GET['path'] ?? '';

if (empty($path)) {
    jsonResponse::error('Path is required');
}

$basePath = SANDBOX_WORK_DIR;
$fullPath = realpath($basePath . '/' . $path);

// Security: ensure path is within base
if (!$fullPath || strpos($fullPath, $basePath) !== 0) {
    jsonResponse::error('Access denied');
}

if (!file_exists($fullPath)) {
    jsonResponse::error('File not found');
}

if (!is_file($fullPath)) {
    jsonResponse::error('Not a file');
}

$size = filesize($fullPath);
if ($size > MAX_FILE_SIZE) {
    jsonResponse::error('File too large');
}

$content = file_get_contents($fullPath);
if ($content === false) {
    jsonResponse::error('Failed to read file');
}

jsonResponse::send([
    'path' => $path,
    'content' => $content,
    'size' => $size,
    'modified' => date('Y-m-d H:i:s', filemtime($fullPath)),
]);
