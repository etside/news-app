<?php
/**
 * GitHub OAuth Authentication
 * GET /api/auth.php - Initiate OAuth flow or handle callback
 * POST /api/auth.php - Login with token (for API access)
 * DELETE /api/auth.php - Logout
 */

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/stream.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Check if this is a callback
        if (isset($_GET['code'])) {
            // GitHub OAuth callback
            $code = $_GET['code'];
            $user = Auth::handleGitHubCallback($code);

            if ($user) {
                // Redirect to app with success
                header('Location: ' . APP_URL . '?login=success');
                exit;
            } else {
                header('Location: ' . APP_URL . '?login=error');
                exit;
            }
        }

        // Check if already logged in
        if (Auth::isLoggedIn()) {
            jsonResponse::send([
                'authenticated' => true,
                'user' => Auth::getUser(),
            ]);
        } else {
            // Return GitHub auth URL
            jsonResponse::send([
                'authenticated' => false,
                'auth_url' => Auth::getGitHubAuthUrl(),
            ]);
        }
        break;

    case 'POST':
        // API login (for programmatic access)
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['token'])) {
            jsonResponse::error('Token is required');
        }

        // TODO: Validate token against GitHub API
        // For now, just check if user exists
        jsonResponse::error('API token login not yet implemented');
        break;

    case 'DELETE':
        // Logout
        Auth::logout();
        jsonResponse::success(['message' => 'Logged out']);
        break;

    default:
        jsonResponse::error('Method not allowed', 405);
}
