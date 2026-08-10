/**
 * Settings Module
 * Handles provider configuration and user preferences
 */

const Settings = {
    currentProvider: 'gitlawb-opengateway',
    currentModel: 'mimo-v2.5-pro',
    providers: {},

    init() {
        this.overlay = document.getElementById('settingsOverlay');
        this.panel = document.getElementById('settingsPanel');

        this.bindEvents();
        this.loadSettings();
    },

    bindEvents() {
        // Toggle menu
        document.getElementById('menuToggle').addEventListener('click', () => this.toggle());

        // Close settings
        document.getElementById('settingsClose').addEventListener('click', () => this.close());

        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Provider change
        document.getElementById('providerSelect').addEventListener('change', (e) => {
            this.onProviderChange(e.target.value);
        });

        // Model change
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            this.onModelChange(e.target.value);
        });

        // Temperature slider
        document.getElementById('temperatureSlider').addEventListener('input', (e) => {
            document.getElementById('tempValue').textContent = e.target.value;
        });

        // Save settings on change
        document.getElementById('maxTokensInput').addEventListener('change', () => this.saveSettings());
        document.getElementById('temperatureSlider').addEventListener('change', () => this.saveSettings());
        document.getElementById('systemPromptInput').addEventListener('change', () => this.saveSettings());

        // GitHub login
        document.getElementById('githubLoginBtn').addEventListener('click', () => this.githubLogin());

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
                this.close();
            }
        });
    },

    toggle() {
        if (this.overlay.classList.contains('hidden')) {
            this.open();
        } else {
            this.close();
        }
    },

    open() {
        this.overlay.classList.remove('hidden');
    },

    close() {
        this.overlay.classList.add('hidden');
    },

    async loadSettings() {
        try {
            const response = await fetch('/api/settings.php');
            const data = await response.json();

            if (data.providers) {
                this.providers = data.providers;
                this.populateProviders();
            }

            if (data.settings) {
                this.applySettings(data.settings);
            }

            if (data.models) {
                this.populateModels(data.models);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    },

    populateProviders() {
        const select = document.getElementById('providerSelect');
        select.innerHTML = Object.entries(this.providers).map(([id, provider]) => `
            <option value="${id}" ${id === this.currentProvider ? 'selected' : ''}>
                ${provider.name}
            </option>
        `).join('');
    },

    populateModels(models) {
        const select = document.getElementById('modelSelect');
        select.innerHTML = Object.entries(models).map(([id, model]) => `
            <option value="${id}" ${id === this.currentModel ? 'selected' : ''}>
                ${model.name}
            </option>
        `).join('');
    },

    applySettings(settings) {
        this.currentProvider = settings.provider;
        this.currentModel = settings.model;

        document.getElementById('providerSelect').value = settings.provider;
        document.getElementById('modelSelect').value = settings.model;
        document.getElementById('temperatureSlider').value = settings.temperature;
        document.getElementById('tempValue').textContent = settings.temperature;
        document.getElementById('maxTokensInput').value = settings.max_tokens;
        document.getElementById('systemPromptInput').value = settings.system_prompt || '';

        this.updateBadges();
    },

    updateBadges() {
        const provider = this.providers[this.currentProvider];
        document.getElementById('providerBadge').textContent = provider?.name || this.currentProvider;
        document.getElementById('modelBadge').textContent = this.currentModel;
    },

    async onProviderChange(providerId) {
        this.currentProvider = providerId;
        const provider = this.providers[providerId];

        if (provider?.models) {
            this.populateModels(provider.models);

            // Set default model
            const defaultModel = Object.keys(provider.models)[0];
            if (defaultModel) {
                this.currentModel = defaultModel;
                document.getElementById('modelSelect').value = defaultModel;
            }
        }

        this.updateBadges();
        await this.saveSettings();
    },

    async onModelChange(modelId) {
        this.currentModel = modelId;
        this.updateBadges();
        await this.saveSettings();
    },

    async saveSettings() {
        const settings = {
            provider: this.currentProvider,
            model: this.currentModel,
            temperature: parseFloat(document.getElementById('temperatureSlider').value),
            max_tokens: parseInt(document.getElementById('maxTokensInput').value),
            system_prompt: document.getElementById('systemPromptInput').value,
        };

        try {
            const response = await fetch('/api/settings.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (data.error) {
                Utils.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    },

    githubLogin() {
        window.location.href = '/api/auth.php';
    },

    async logout() {
        try {
            await fetch('/api/auth.php', { method: 'DELETE' });
            document.getElementById('authSection').classList.remove('hidden');
            document.getElementById('userSection').classList.add('hidden');
            Utils.showToast('Logged out', 'info');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    },

    async checkAuth() {
        try {
            const response = await fetch('/api/auth.php');
            const data = await response.json();

            if (data.authenticated && data.user) {
                document.getElementById('authSection').classList.add('hidden');
                document.getElementById('userSection').classList.remove('hidden');
                document.getElementById('userAvatar').src = data.user.avatar_url || '';
                document.getElementById('username').textContent = data.user.username;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
};
