<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#090b0d">
    <title>OpenClaude Web</title>

    <!-- Inter font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="/assets/css/app.css">
    <link rel="stylesheet" href="/assets/css/chat.css">
    <link rel="stylesheet" href="/assets/css/preview.css">
    <link rel="stylesheet" href="/assets/css/menu.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.0/marked.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

    <!-- Theme flash prevention -->
    <script>
        (function() {
            var t = localStorage.getItem('theme');
            if (t === 'light') document.documentElement.classList.add('light');
            else if (t === 'dark') document.documentElement.classList.add('dark');
            else if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('light');
            }
        })();
    </script>
</head>
<body>
    <div id="app">
        <!-- Top Bar -->
        <header class="top-bar">
            <button class="menu-toggle" id="menuToggle" aria-label="Toggle sidebar" aria-expanded="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
            </button>
            <h1 class="app-title">OpenClaude</h1>
            <div class="top-bar-right">
                <span class="provider-badge" id="providerBadge">Gitlawb Opengateway</span>
                <span class="model-badge" id="modelBadge">mimo-v2.5-pro</span>
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                    <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                    <svg class="icon-moon hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </button>
            </div>
        </header>

        <!-- Mobile sidebar overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <!-- Main Layout -->
        <div class="main-layout">
            <!-- Sidebar (History) -->
            <aside class="sidebar" id="sidebar" aria-label="Chat history">
                <div class="sidebar-header">
                    <button class="btn btn-primary btn-new-chat" id="newChatBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        New Chat
                    </button>
                </div>
                <div class="session-list" id="sessionList">
                    <!-- Sessions loaded dynamically -->
                </div>
            </aside>

            <!-- Chat Panel -->
            <main class="chat-panel" id="chatPanel">
                <div class="chat-messages" id="chatMessages">
                    <!-- Welcome message -->
                    <div class="message assistant-message welcome">
                        <div class="message-content">
                            <h2>Welcome to OpenClaude Web</h2>
                            <p>Start a conversation. I can help you with coding, file operations, and more.</p>
                            <div class="quick-actions">
                                <button class="quick-action" data-prompt="Help me write a Python script">Write Python script</button>
                                <button class="quick-action" data-prompt="Explain how this code works">Explain code</button>
                                <button class="quick-action" data-prompt="Fix a bug in my code">Fix a bug</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="chat-input-area">
                    <div class="input-wrapper">
                        <textarea
                            id="messageInput"
                            placeholder="Type a message... (Shift+Enter for new line)"
                            rows="1"
                            aria-label="Message input"
                            autofocus
                        ></textarea>
                        <button class="send-btn" id="sendBtn" title="Send (Enter)" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                        <button class="stop-btn hidden" id="stopBtn" title="Stop generating" aria-label="Stop generating">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="6" width="12" height="12" rx="2"/>
                            </svg>
                        </button>
                    </div>
                    <div class="input-footer">
                        <span class="char-count" id="charCount">0</span>
                        <span class="shortcut-hint">Enter to send, Shift+Enter for new line</span>
                    </div>
                </div>
            </main>

            <!-- Preview Panel -->
            <aside class="preview-panel hidden" id="previewPanel" aria-label="Live preview">
                <div class="preview-header">
                    <h3>Live Preview</h3>
                    <div class="preview-controls">
                        <button class="preview-tab active" data-tab="files">Files</button>
                        <button class="preview-tab" data-tab="output">Output</button>
                        <button class="preview-tab" data-tab="browser">Browser</button>
                        <button class="preview-close" id="previewClose" title="Close preview" aria-label="Close preview">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="preview-content">
                    <div class="preview-tab-content active" id="filesTab">
                        <div class="file-tree" id="fileTree">
                            <p class="empty-state">No files yet</p>
                        </div>
                    </div>
                    <div class="preview-tab-content" id="outputTab">
                        <pre class="terminal-output" id="terminalOutput"></pre>
                    </div>
                    <div class="preview-tab-content" id="browserTab">
                        <iframe id="browserPreview" class="browser-frame" sandbox="allow-scripts allow-same-origin"></iframe>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Settings Menu -->
        <div class="settings-overlay hidden" id="settingsOverlay" role="dialog" aria-modal="true" aria-label="Settings">
            <div class="settings-panel" id="settingsPanel">
                <div class="settings-header">
                    <h2>Settings</h2>
                    <button class="settings-close" id="settingsClose" aria-label="Close settings">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="settings-content">
                    <!-- Provider Section -->
                    <section class="settings-section">
                        <h3>Provider</h3>
                        <div class="form-group">
                            <label for="providerSelect">Provider</label>
                            <select id="providerSelect" class="form-control">
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="modelSelect">Model</label>
                            <select id="modelSelect" class="form-control">
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="apiKeyInput">API Key</label>
                            <input type="password" id="apiKeyInput" class="form-control" placeholder="ogw_live_...">
                            <small class="form-help">Get your key at <a href="https://gitlawb.com/opengateway/keys" target="_blank" rel="noopener">gitlawb.com/opengateway/keys</a></small>
                        </div>
                    </section>

                    <!-- Parameters Section -->
                    <section class="settings-section">
                        <h3>Parameters</h3>
                        <div class="form-group">
                            <label for="temperatureSlider">Temperature: <span id="tempValue">0.7</span></label>
                            <input type="range" id="temperatureSlider" class="form-control" min="0" max="2" step="0.1" value="0.7">
                        </div>
                        <div class="form-group">
                            <label for="maxTokensInput">Max Tokens</label>
                            <input type="number" id="maxTokensInput" class="form-control" value="4096" min="1" max="128000">
                        </div>
                    </section>

                    <!-- System Prompt Section -->
                    <section class="settings-section">
                        <h3>System Prompt</h3>
                        <div class="form-group">
                            <textarea id="systemPromptInput" class="form-control" rows="4" placeholder="You are a helpful coding assistant.">You are a helpful coding assistant.</textarea>
                        </div>
                    </section>

                    <!-- Account Section -->
                    <section class="settings-section">
                        <h3>Account</h3>
                        <div id="authSection">
                            <button class="btn btn-primary" id="githubLoginBtn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                Login with GitHub
                            </button>
                        </div>
                        <div id="userSection" class="hidden">
                            <div class="user-info">
                                <img id="userAvatar" class="user-avatar" src="" alt="">
                                <span id="username"></span>
                            </div>
                            <button class="btn btn-secondary" id="logoutBtn">Logout</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>

    <script src="/assets/js/utils.js"></script>
    <script src="/assets/js/chat.js"></script>
    <script src="/assets/js/preview.js"></script>
    <script src="/assets/js/settings.js"></script>
    <script src="/assets/js/app.js"></script>
</body>
</html>
