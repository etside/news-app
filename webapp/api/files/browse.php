<?php
/**
 * File Browser API
 * GET /api/files/browse.php?path=/path/to/dir
 */

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/stream.php';
require_once __DIR__ . '/../../config/app.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$path = $_GET['path'] ?? '';

// Default to sandbox work directory
$basePath = SANDBOX_WORK_DIR;
if (!is_dir($basePath)) {
    mkdir($basePath, 0755, true);
}

$fullPath = $basePath;
if ($path) {
    $fullPath = realpath($basePath . '/' . $path) ?: $basePath . '/' . $path;
}

// Security: ensure path is within base
if (strpos($fullPath, $basePath) !== 0) {
    jsonResponse::error('Access denied');
}

if (!is_dir($fullPath)) {
    jsonResponse::error('Directory not found');
}

$items = [];
$iterator = new DirectoryIterator($fullPath);

foreach ($iterator as $item) {
    if ($item->isDot()) continue;

    $items[] = [
        'name' => $item->getFilename(),
        'path' => $path ? $path . '/' . $item->getFilename() : $item->getFilename(),
        'type' => $item->isDir() ? 'directory' : 'file',
        'size' => $item->isFile() ? $item->getSize() : null,
        'modified' => date('Y-m-d H:i:s', $item->getMTime()),
    ];
}

// Sort: directories first, then by name
usort($items, function($a, $b) {
    if ($a['type'] !== $b['type']) {
        return $a['type'] === 'directory' ? -1 : 1;
    }
    return strcasecmp($a['name'], $b['name']);
});

jsonResponse::send([
    'path' => $path,
    'items' => $items,
]);
