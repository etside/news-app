<?php
/**
 * Settings API
 * GET /api/settings.php - Get user settings
 * PUT /api/settings.php - Update user settings
 */

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/stream.php';
require_once __DIR__ . '/../config/providers.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$user = Auth::isLoggedIn() ? Auth::getUser() : null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Return providers list and user settings
        $providers = getProviders();

        // Add api_key status (masked) to providers
        foreach ($providers as &$provider) {
            $provider['has_api_key'] = !empty(resolveApiKey());
        }

        $response = [
            'providers' => $providers,
            'models' => [],
        ];

        if ($user) {
            $settings = Database::fetch("SELECT * FROM settings WHERE user_id = ?", [$user['id']]);
            if ($settings) {
                $response['settings'] = [
                    'provider' => $settings['provider'],
                    'model' => $settings['model'],
                    'temperature' => $settings['temperature'],
                    'max_tokens' => $settings['max_tokens'],
                    'system_prompt' => $settings['system_prompt'],
                ];
            }
        } else {
            $response['settings'] = [
                'provider' => 'gitlawb-opengateway',
                'model' => 'mimo-v2.5-pro',
                'temperature' => 0.7,
                'max_tokens' => 4096,
                'system_prompt' => 'You are a helpful coding assistant.',
            ];
        }

        // Get models for current provider
        $currentProvider = $response['settings']['provider'] ?? 'gitlawb-opengateway';
        $response['models'] = getProviderModels($currentProvider);

        jsonResponse::send($response);
        break;

    case 'PUT':
        if (!$user) {
            jsonResponse::error('Authentication required', 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            jsonResponse::error('Invalid request body');
        }

        $allowed = ['provider', 'model', 'temperature', 'max_tokens', 'system_prompt'];
        $updateData = array_intersect_key($input, array_flip($allowed));

        if (empty($updateData)) {
            jsonResponse::error('No valid fields to update');
        }

        // Validate provider
        if (isset($updateData['provider']) && !getProvider($updateData['provider'])) {
            jsonResponse::error("Invalid provider: {$updateData['provider']}");
        }

        // Validate model
        if (isset($updateData['model']) && isset($updateData['provider'])) {
            $models = getProviderModels($updateData['provider']);
            if (!isset($models[$updateData['model']])) {
                jsonResponse::error("Invalid model: {$updateData['model']}");
            }
        }

        // Check if settings exist
        $existing = Database::fetch("SELECT id FROM settings WHERE user_id = ?", [$user['id']]);

        if ($existing) {
            Database::update('settings', $updateData, 'user_id = ?', [$user['id']]);
        } else {
            $updateData['user_id'] = $user['id'];
            Database::insert('settings', $updateData);
        }

        jsonResponse::success($updateData);
        break;

    default:
        jsonResponse::error('Method not allowed', 405);
}
