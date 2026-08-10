/**
 * Preview Panel Module
 * Handles live preview of files, terminal output, and browser preview
 */

const Preview = {
    isOpen: false,
    currentTab: 'files',
    files: [],

    init() {
        this.panel = document.getElementById('previewPanel');
        this.fileTree = document.getElementById('fileTree');
        this.terminalOutput = document.getElementById('terminalOutput');
        this.browserPreview = document.getElementById('browserPreview');

        this.bindEvents();
    },

    bindEvents() {
        // Close button
        document.getElementById('previewClose').addEventListener('click', () => this.close());

        // Tab buttons
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },

    open() {
        this.panel.classList.remove('hidden');
        this.isOpen = true;
        this.loadFiles();
    },

    close() {
        this.panel.classList.add('hidden');
        this.isOpen = false;
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    switchTab(tab) {
        this.currentTab = tab;

        document.querySelectorAll('.preview-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        document.querySelectorAll('.preview-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.getElementById(`${tab}Tab`).classList.add('active');
    },

    async loadFiles() {
        try {
            const response = await fetch('/api/files/browse.php?path=');
            const data = await response.json();

            if (data.items) {
                this.files = data.items;
                this.renderFileTree();
            }
        } catch (error) {
            console.error('Failed to load files:', error);
            this.fileTree.innerHTML = '<p class="empty-state">Failed to load files</p>';
        }
    },

    renderFileTree() {
        if (this.files.length === 0) {
            this.fileTree.innerHTML = '<p class="empty-state">No files yet</p>';
            return;
        }

        this.fileTree.innerHTML = this.files.map(file => `
            <div class="file-tree-item ${file.type}" data-path="${file.path}" onclick="Preview.openFile('${file.path}')">
                <span class="file-tree-icon ${file.type}">
                    ${Utils.getFileIcon(file.name, file.type === 'directory')}
                </span>
                <span class="file-tree-name">${Utils.escapeHtml(file.name)}</span>
                ${file.size ? `<span class="file-tree-size">${Utils.formatSize(file.size)}</span>` : ''}
            </div>
        `).join('');
    },

    async openFile(path) {
        try {
            const response = await fetch(`/api/files/read.php?path=${encodeURIComponent(path)}`);
            const data = await response.json();

            if (data.content !== undefined) {
                this.showFileContent(path, data.content);
            }
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    },

    showFileContent(path, content) {
        const lang = Utils.getLanguage(path);
        let highlighted;

        try {
            highlighted = hljs.highlight(content, { language: lang }).value;
        } catch {
            highlighted = Utils.escapeHtml(content);
        }

        this.fileTree.innerHTML = `
            <div class="file-viewer">
                <div class="file-viewer-header">
                    <span class="file-viewer-path">${Utils.escapeHtml(path)}</span>
                    <div class="file-viewer-actions">
                        <button class="copy-btn" onclick="Preview.copyFileContent()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                            Copy
                        </button>
                        <button class="btn-back" onclick="Preview.loadFiles()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            Back
                        </button>
                    </div>
                </div>
                <div class="file-viewer-content">
                    <pre><code class="hljs language-${lang}">${highlighted}</code></pre>
                </div>
            </div>
        `;

        this.currentFilePath = path;
        this.currentFileContent = content;
    },

    copyFileContent() {
        if (this.currentFileContent) {
            Utils.copyToClipboard(this.currentFileContent).then(success => {
                if (success) {
                    Utils.showToast('File content copied', 'success');
                }
            });
        }
    },

    appendTerminalOutput(text, type = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = text;
        this.terminalOutput.appendChild(line);
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    },

    clearTerminal() {
        this.terminalOutput.innerHTML = '';
    },

    handleToolResult(result) {
        if (result.output) {
            if (result.output.output) {
                this.appendTerminalOutput(result.output.output, result.success ? '' : 'error');
            }

            if (result.output.path && result.output.content) {
                // File was written - refresh file list
                this.loadFiles();
                this.appendTerminalOutput(`File written: ${result.output.path}`, 'success');
            }
        }
    },

    updateBrowserPreview(url) {
        this.switchTab('browser');
        this.browserPreview.src = url;
    }
};
