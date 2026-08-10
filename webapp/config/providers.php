<?php
/**
 * Provider Registry (mirrors src/integrations/gateways/)
 * Models follow the same naming as gitlawb-opengateway.ts
 */

require_once __DIR__ . '/database.php';

$providers = [
    'gitlawb-opengateway' => [
        'name' => 'Gitlawb Opengateway',
        'base_url' => resolveBaseUrl('gitlawb-opengateway'),
        'auth_header' => 'Authorization',
        'auth_prefix' => 'Bearer ',
        'models' => [
            'auto' => ['name' => 'Auto - Smart Routing', 'max_tokens' => 32768],
            'mimo-v2.5-pro' => ['name' => 'MiMo V2.5 Pro', 'max_tokens' => 32768],
            'mimo-v2.5' => ['name' => 'MiMo V2.5', 'max_tokens' => 32768],
            'mimo-v2-flash' => ['name' => 'MiMo V2 Flash', 'max_tokens' => 32768],
            'google/gemini-3.1-flash-lite' => ['name' => 'Gemini 3.1 Flash Lite', 'max_tokens' => 8192],
            'minimax/minimax-m3' => ['name' => 'MiniMax M3', 'max_tokens' => 32768],
            'qwen/qwen3.7-max' => ['name' => 'Qwen 3.7 Max', 'max_tokens' => 32768],
            'z-ai/glm-5.2' => ['name' => 'GLM 5.2', 'max_tokens' => 32768],
            'nvidia/nemotron-3-ultra-550b-a55b:free' => ['name' => 'Nemotron 3 Ultra Free', 'max_tokens' => 32768, 'notes' => 'Free'],
            'inclusionai/ling-3.0-flash:free' => ['name' => 'Ling 3.0 Flash Free', 'max_tokens' => 8192, 'notes' => 'Free'],
            'tencent/hy3' => ['name' => 'Tencent HY3 Free', 'max_tokens' => 32768, 'notes' => 'Free'],
        ],
        'default_model' => 'mimo-v2.5-pro',
        'supports_streaming' => true,
        'supports_tools' => true,
        'maxTokensField' => 'max_completion_tokens',
        'removeBodyFields' => ['store', 'stream_options'],
    ],
    'openai' => [
        'name' => 'OpenAI',
        'base_url' => resolveBaseUrl('openai'),
        'auth_header' => 'Authorization',
        'auth_prefix' => 'Bearer ',
        'models' => [
            'gpt-4o' => ['name' => 'GPT-4o', 'max_tokens' => 128000],
            'gpt-4o-mini' => ['name' => 'GPT-4o Mini', 'max_tokens' => 128000],
            'gpt-4-turbo' => ['name' => 'GPT-4 Turbo', 'max_tokens' => 128000],
        ],
        'default_model' => 'gpt-4o-mini',
        'supports_streaming' => true,
        'supports_tools' => true,
        'maxTokensField' => 'max_tokens',
        'removeBodyFields' => [],
    ],
    'anthropic' => [
        'name' => 'Anthropic',
        'base_url' => resolveBaseUrl('anthropic'),
        'auth_header' => 'x-api-key',
        'auth_prefix' => '',
        'models' => [
            'claude-sonnet-4-20250514' => ['name' => 'Claude Sonnet 4', 'max_tokens' => 200000],
            'claude-3-5-sonnet-20241022' => ['name' => 'Claude 3.5 Sonnet', 'max_tokens' => 200000],
        ],
        'default_model' => 'claude-sonnet-4-20250514',
        'supports_streaming' => true,
        'supports_tools' => true,
        'maxTokensField' => 'max_tokens',
        'removeBodyFields' => [],
    ],
    'custom' => [
        'name' => 'Custom Provider',
        'base_url' => resolveBaseUrl('custom'),
        'auth_header' => 'Authorization',
        'auth_prefix' => 'Bearer ',
        'models' => [],
        'default_model' => '',
        'supports_streaming' => true,
        'supports_tools' => false,
        'maxTokensField' => 'max_tokens',
        'removeBodyFields' => [],
    ],
];

function getProviders(): array {
    global $providers;
    return $providers;
}

function getProvider(string $id): ?array {
    global $providers;
    return $providers[$id] ?? null;
}

function getProviderModels(string $provider_id): array {
    $provider = getProvider($provider_id);
    return $provider['models'] ?? [];
}

/**
 * Build the API request body (mirrors openaiShim transport config)
 */
function buildApiBody(string $provider_id, array $messages, array $options = []): array {
    $provider = getProvider($provider_id);
    if (!$provider) {
        throw new \InvalidArgumentException("Unknown provider: {$provider_id}");
    }

    $model = $options['model'] ?? $provider['default_model'];
    $maxTokensField = $provider['maxTokensField'] ?? 'max_tokens';

    $body = [
        'model' => $model,
        'messages' => $messages,
        'stream' => $options['stream'] ?? true,
        $maxTokensField => $options['max_tokens'] ?? 4096,
    ];

    if (isset($options['temperature'])) {
        $body['temperature'] = $options['temperature'];
    }

    if (isset($options['tools'])) {
        $body['tools'] = $options['tools'];
    }

    // Remove fields that provider doesn't support
    foreach ($provider['removeBodyFields'] as $field) {
        unset($body[$field]);
    }

    return $body;
}
