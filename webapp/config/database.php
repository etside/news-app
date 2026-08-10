<?php
/**
 * Database Configuration
 * API keys follow the same env var pattern as the CLI:
 *   OPENGATEWAY_API_KEY, OPENAI_API_KEYS, OPENAI_API_KEY
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'torquest_devlover');
define('DB_USER', 'torquest_devlover');
define('DB_PASS', 'Kptjms991');
define('DB_CHARSET', 'utf8mb4');

// Gitlawb Opengateway Configuration
// Follows CLI pattern: reads from env vars, falls back to config
// Set these in your environment or .env file
define('OPENGATEWAY_BASE_URL', getenv('OPENGATEWAY_BASE_URL') ?: 'https://opengateway.gitlawb.com/v1');
define('OPENGATEWAY_API_KEY', getenv('OPENGATEWAY_API_KEY') ?: '');
define('OPENAI_API_KEYS', getenv('OPENAI_API_KEYS') ?: '');
define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: '');

// GitHub OAuth Configuration
define('GITHUB_CLIENT_ID', getenv('GITHUB_CLIENT_ID') ?: '');
define('GITHUB_CLIENT_SECRET', getenv('GITHUB_CLIENT_SECRET') ?: '');
define('GITHUB_REDIRECT_URI', 'https://devlover.torquesticker.com/api/auth.php');

// App Configuration
define('APP_NAME', 'OpenClaude Web');
define('APP_URL', getenv('APP_URL') ?: 'https://devlover.torquesticker.com');
define('SESSION_LIFETIME', 86400 * 7); // 7 days

// Tool Execution Sandbox
define('SANDBOX_ENABLED', true);
define('SANDBOX_WORK_DIR', '/tmp/openclaude_sandbox');
define('SANDBOX_ALLOWED_COMMANDS', ['ls', 'cat', 'head', 'tail', 'grep', 'find', 'wc', 'echo', 'pwd']);
define('SANDBOX_TIMEOUT', 30); // seconds

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'https://devlover.torquesticker.com',
    'http://localhost:8080',
]);

/**
 * Resolve API key for a provider (mirrors src/services/api/providerConfig.ts)
 * Priority: OPENGATEWAY_API_KEY > OPENAI_API_KEYS > OPENAI_API_KEY
 */
function resolveApiKey(string $provider = 'gitlawb-opengateway'): string {
    return OPENGATEWAY_API_KEY ?: OPENAI_API_KEYS ?: OPENAI_API_KEY;
}

/**
 * Get base URL for a provider
 */
function resolveBaseUrl(string $provider = 'gitlawb-opengateway'): string {
    $envUrl = getenv('OPENGATEWAY_BASE_URL') ?: getenv('OPENAI_BASE_URL');
    if ($envUrl) return $envUrl;

    $urls = [
        'gitlawb-opengateway' => 'https://opengateway.gitlawb.com/v1',
        'openai' => 'https://api.openai.com/v1',
        'anthropic' => 'https://api.anthropic.com/v1',
        'custom' => getenv('OPENAI_BASE_URL') ?: '',
    ];

    return $urls[$provider] ?? $urls['custom'];
}
