/**
 * Main Application
 * Initializes all modules and handles global state
 */

const App = {
    init() {
        console.log('OpenClaude Web v0.1.0');

        // Initialize modules
        Settings.init();
        Chat.init();
        Preview.init();

        // Check auth state
        Settings.checkAuth();

        // Handle URL params (for OAuth callback)
        this.handleUrlParams();

        // Keyboard shortcuts
        this.initKeyboardShortcuts();

        // Focus input
        document.getElementById('messageInput').focus();
    },

    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);

        if (params.get('login') === 'success') {
            Utils.showToast('Successfully logged in!', 'success');
            Settings.checkAuth();
            window.history.replaceState({}, '', '/');
        } else if (params.get('login') === 'error') {
            Utils.showToast('Login failed. Please try again.', 'error');
            window.history.replaceState({}, '', '/');
        }
    },

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus search/input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('messageInput').focus();
            }

            // Ctrl/Cmd + N: New chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                Chat.newChat();
            }

            // Ctrl/Cmd + ,: Toggle settings
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                Settings.toggle();
            }

            // Ctrl/Cmd + B: Toggle preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                Preview.toggle();
            }

            // Ctrl/Cmd + /: Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                document.getElementById('sidebar').classList.toggle('hidden');
            }
        });
    }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
