<?php
/**
 * Authentication Helper
 * GitHub OAuth + Session Management
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../config/database.php';

class Auth {
    public static function start(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function login(int $userId): void {
        self::start();
        $_SESSION['user_id'] = $userId;
        $_SESSION['login_time'] = time();
    }

    public static function logout(): void {
        self::start();
        session_destroy();
    }

    public static function isLoggedIn(): bool {
        self::start();
        return isset($_SESSION['user_id']);
    }

    public static function getUserId(): ?int {
        self::start();
        return $_SESSION['user_id'] ?? null;
    }

    public static function getUser(): ?array {
        $userId = self::getUserId();
        if (!$userId) return null;
        return Database::fetch("SELECT * FROM users WHERE id = ?", [$userId]);
    }

    public static function requireAuth(): array {
        if (!self::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
        $user = self::getUser();
        if (!$user) {
            self::logout();
            http_response_code(401);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        return $user;
    }

    public static function getGitHubAuthUrl(): string {
        $params = http_build_query([
            'client_id' => GITHUB_CLIENT_ID,
            'redirect_uri' => GITHUB_REDIRECT_URI,
            'scope' => 'read:user user:email',
            'state' => bin2hex(random_bytes(16)),
        ]);
        return "https://github.com/login/oauth/authorize?{$params}";
    }

    public static function handleGitHubCallback(string $code): ?array {
        // Exchange code for access token
        $tokenResponse = self::githubApiRequest('https://github.com/login/oauth/access_token', [
            'client_id' => GITHUB_CLIENT_ID,
            'client_secret' => GITHUB_CLIENT_SECRET,
            'code' => $code,
        ]);

        if (!$tokenResponse || !isset($tokenResponse['access_token'])) {
            return null;
        }

        // Get user info
        $userResponse = self::githubApiRequest(
            'https://api.github.com/user',
            null,
            $tokenResponse['access_token']
        );

        if (!$userResponse || !isset($userResponse['id'])) {
            return null;
        }

        // Create or update user
        $existing = Database::fetch("SELECT * FROM users WHERE github_id = ?", [$userResponse['id']]);

        if ($existing) {
            Database::update('users', [
                'username' => $userResponse['login'],
                'avatar_url' => $userResponse['avatar_url'] ?? '',
            ], 'id = ?', [$existing['id']]);
            $userId = $existing['id'];
        } else {
            $userId = Database::insert('users', [
                'github_id' => $userResponse['id'],
                'username' => $userResponse['login'],
                'avatar_url' => $userResponse['avatar_url'] ?? '',
            ]);

            // Create default settings
            Database::insert('settings', [
                'user_id' => $userId,
                'provider' => 'gitlawb-opengateway',
                'model' => 'mimo-v2.5',
            ]);
        }

        self::login($userId);
        return Database::fetch("SELECT * FROM users WHERE id = ?", [$userId]);
    }

    private static function githubApiRequest(string $url, ?array $data = null, ?string $token = null): ?array {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => $data !== null,
            CURLOPT_POSTFIELDS => $data ? http_build_query($data) : null,
            CURLOPT_HTTPHEADER => array_filter([
                'Accept: application/json',
                $token ? "Authorization: token {$token}" : null,
            ]),
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return null;
        }

        return json_decode($response, true);
    }
}
