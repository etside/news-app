/**
 * Main Application
 * Initializes all modules and handles global state
 */

const App = {
    init() {
        console.log('OpenClaude Web v0.2.0');

        // Initialize modules
        Settings.init();
        Chat.init();
        Preview.init();

        // Theme toggle
        this.initThemeToggle();

        // Sidebar toggle (mobile)
        this.initSidebarToggle();

        // Check auth state
        Settings.checkAuth();

        // Handle URL params (for OAuth callback)
        this.handleUrlParams();

        // Keyboard shortcuts
        this.initKeyboardShortcuts();

        // Focus input
        document.getElementById('messageInput').focus();
    },

    initThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        const sunIcon = toggle.querySelector('.icon-sun');
        const moonIcon = toggle.querySelector('.icon-moon');

        const updateIcon = () => {
            const isLight = document.documentElement.classList.contains('light');
            sunIcon.classList.toggle('hidden', isLight);
            moonIcon.classList.toggle('hidden', !isLight);
        };

        updateIcon();

        toggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('light');
            const isLight = document.documentElement.classList.contains('light');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateIcon();
        });
    },

    initSidebarToggle() {
        const toggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        };

        const openSidebar = () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
        };

        toggle.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else if (window.innerWidth <= 768) {
                openSidebar();
            } else {
                sidebar.classList.toggle('hidden');
            }
        });

        overlay.addEventListener('click', closeSidebar);
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
