# OpenClaude Web

A web-based interface for Gitlawb Opengateway, providing chat with AI, file operations, and live preview.

## Setup

### 1. Database

Import the schema into MySQL:

```bash
mysql -u your_username -p openclaude_web < sql/schema.sql
```

Or use phpMyAdmin to import `sql/schema.sql`.

### 2. Configuration

Edit `config/database.php` and set:

- `DB_USER` - Your MySQL username
- `DB_PASS` - Your MySQL password
- API keys via environment variables (recommended) or directly in config

### 3. Environment Variables

Set these in your hosting panel or `.env` file:

```bash
OPENGATEWAY_API_KEY=ogw_live_your_key_here
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

Get an API key at https://gitlawb.com/opengateway/keys

### 4. GitHub OAuth

1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set callback URL to `https://yourdomain.com/api/auth.php`
4. Copy Client ID and Client Secret to config

### 5. Deploy

Upload the `webapp/` directory to your hosting.

For cPanel/file manager:
1. Build: `cd webapp && zip -r ../deploy.zip .`
2. Upload `deploy.zip` to file manager
3. Extract in `public_html/` or your domain root

## Features

- Chat with AI via Gitlawb Opengateway
- Streaming responses
- Tool execution (file read/write, commands)
- Live preview panel
- GitHub OAuth login
- Chat history
- Multiple provider support

## Keyboard Shortcuts

- `Enter` - Send message
- `Shift+Enter` - New line
- `Ctrl/Cmd+K` - Focus input
- `Ctrl/Cmd+N` - New chat
- `Ctrl/Cmd+,` - Settings
- `Ctrl/Cmd+B` - Toggle preview
- `Ctrl/Cmd+/` - Toggle sidebar
