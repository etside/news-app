<?php
/**
 * Application Constants
 */

// Version
define('APP_VERSION', '0.1.0');

// Max message length
define('MAX_MESSAGE_LENGTH', 100000);

// Streaming chunk size
define('STREAM_CHUNK_SIZE', 1024);

// Rate limiting
define('RATE_LIMIT_MESSAGES', 60); // per minute
define('RATE_LIMIT_WINDOW', 60);   // seconds

// File size limits for preview
define('MAX_FILE_SIZE', 10485760); // 10MB
define('ALLOWED_FILE_TYPES', ['php', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'md', 'txt', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'sql', 'sh', 'yaml', 'yml', 'toml', 'xml']);
