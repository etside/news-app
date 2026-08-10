/**
 * Chat Module
 * Handles chat UI, message streaming, and tool calls
 */

const Chat = {
    messages: [],
    currentSessionId: null,
    isStreaming: false,
    abortController: null,

    init() {
        this.messagesEl = document.getElementById('chatMessages');
        this.inputEl = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.charCountEl = document.getElementById('charCount');

        this.bindEvents();
        this.loadSessions();
    },

    bindEvents() {
        // Send button
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Stop button
        this.stopBtn.addEventListener('click', () => this.stopStreaming());

        // Input handling
        this.inputEl.addEventListener('input', () => {
            this.autoResize();
            this.updateCharCount();
        });

        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => this.newChat());

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                this.inputEl.value = btn.dataset.prompt;
                this.sendMessage();
            });
        });
    },

    autoResize() {
        this.inputEl.style.height = 'auto';
        this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 200) + 'px';
    },

    updateCharCount() {
        const count = this.inputEl.value.length;
        this.charCountEl.textContent = count.toLocaleString();
    },

    async sendMessage() {
        const message = this.inputEl.value.trim();
        if (!message || this.isStreaming) return;

        // Add user message to UI
        this.addMessage('user', message);

        // Clear input
        this.inputEl.value = '';
        this.autoResize();
        this.updateCharCount();

        // Start streaming response
        await this.streamResponse(message);
    },

    addMessage(role, content, extra = {}) {
        const msg = {
            id: Utils.generateId(),
            role,
            content,
            ...extra,
            timestamp: new Date().toISOString(),
        };

        this.messages.push(msg);
        this.renderMessage(msg);
        this.scrollToBottom();

        return msg;
    },

    renderMessage(msg) {
        const el = document.createElement('div');
        el.className = `message ${msg.role}-message`;
        el.id = `msg-${msg.id}`;

        const avatar = msg.role === 'user' ? 'U' : 'AI';
        const roleLabel = msg.role === 'user' ? 'You' : 'Assistant';

        let contentHtml = '';

        if (msg.role === 'assistant') {
            contentHtml = this.renderMarkdown(msg.content);
        } else {
            contentHtml = `<p>${Utils.escapeHtml(msg.content)}</p>`;
        }

        // Handle tool calls
        if (msg.tool_calls) {
            contentHtml += this.renderToolCalls(msg.tool_calls);
        }

        el.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">${avatar}</div>
                <span class="message-role">${roleLabel}</span>
            </div>
            <div class="message-content">${contentHtml}</div>
        `;

        // Remove welcome message if present
        const welcome = this.messagesEl.querySelector('.welcome');
        if (welcome) welcome.remove();

        this.messagesEl.appendChild(el);
    },

    renderMarkdown(content) {
        if (!content) return '';

        // Configure marked
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true,
        });

        let html = marked.parse(content);

        // Add copy buttons to code blocks
        html = html.replace(/<pre><code class="language-(\w+)">/g, (match, lang) => {
            return `<div class="code-block-header"><span>${lang}</span><button class="copy-btn" onclick="Chat.copyCode(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy</button></div><pre><code class="language-${lang}">`;
        });

        return html;
    },

    renderToolCalls(toolCalls) {
        return toolCalls.map(tc => `
            <div class="tool-call-indicator" id="tool-${tc.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                </svg>
                <span>Executing ${tc.function?.name || 'tool'}...</span>
            </div>
        `).join('');
    },

    addToolResult(toolCallId, result) {
        const el = document.getElementById(`tool-${toolCallId}`);
        if (el) {
            el.classList.remove('tool-call-indicator');
            el.classList.add('tool-result');

            const success = result.success !== false;
            el.innerHTML = `
                <div class="tool-result-header">
                    <span>${success ? 'Success' : 'Error'}</span>
                    <span class="${success ? 'tool-result-success' : 'tool-result-error'}">${result.duration_ms || 0}ms</span>
                </div>
                <div class="tool-result-content">${Utils.escapeHtml(JSON.stringify(result.output, null, 2))}</div>
            `;

            // Update preview panel
            if (window.Preview) {
                Preview.handleToolResult(result);
            }
        }
    },

    async streamResponse(message) {
        this.setStreaming(true);
        this.abortController = new AbortController();

        // Create assistant message placeholder
        const assistantMsg = this.addMessage('assistant', '');
        const msgEl = document.getElementById(`msg-${assistantMsg.id}`);
        const contentEl = msgEl.querySelector('.message-content');
        contentEl.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

        let fullContent = '';

        try {
            const response = await fetch('/api/chat/stream.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    session_id: this.currentSessionId,
                    provider: Settings.currentProvider,
                    model: Settings.currentModel,
                    tools: this.getToolDefinitions(),
                }),
                signal: this.abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process SSE events
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        const event = line.slice(7).trim();
                        if (event === 'close') {
                            this.setStreaming(false);
                            return;
                        }
                    } else if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            this.handleStreamEvent(data, contentEl, assistantMsg, fullContent);
                        } catch (e) {
                            console.error('Failed to parse SSE data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                contentEl.innerHTML = this.renderMarkdown(fullContent || '*Generation stopped*');
            } else {
                console.error('Stream error:', error);
                contentEl.innerHTML = `<div class="error-message">Error: ${Utils.escapeHtml(error.message)}</div>`;
            }
        } finally {
            this.setStreaming(false);
            assistantMsg.content = fullContent;
            this.scrollToBottom();
        }
    },

    handleStreamEvent(data, contentEl, msg, fullContent) {
        if (data.content) {
            fullContent += data.content;
            contentEl.innerHTML = this.renderMarkdown(fullContent);
            contentEl.classList.add('streaming-cursor');
            this.scrollToBottom();
        }

        if (data.session_id && !this.currentSessionId) {
            this.currentSessionId = data.session_id;
            this.loadSessions();
        }

        if (data.type === 'tool_call') {
            this.addToolCall(data);
        }

        if (data.type === 'tool_result') {
            this.addToolResult(data.tool_call_id, data.result);
        }

        if (data.type === 'thinking') {
            this.addThinking(data.content, contentEl);
        }

        if (data.type === 'done') {
            contentEl.classList.remove('streaming-cursor');
        }
    },

    addToolCall(data) {
        const toolEl = document.createElement('div');
        toolEl.className = 'tool-call-indicator';
        toolEl.id = `tool-${data.id}`;
        toolEl.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
            <span>Executing ${data.name}...</span>
        `;

        this.messagesEl.appendChild(toolEl);
        this.scrollToBottom();
    },

    addThinking(content, contentEl) {
        const thinkingEl = document.createElement('div');
        thinkingEl.className = 'thinking-block';
        thinkingEl.innerHTML = `
            <div class="thinking-block-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Thinking
            </div>
            <div class="thinking-content">${Utils.escapeHtml(content)}</div>
        `;

        contentEl.appendChild(thinkingEl);
    },

    setStreaming(streaming) {
        this.isStreaming = streaming;
        this.sendBtn.classList.toggle('hidden', streaming);
        this.stopBtn.classList.toggle('hidden', !streaming);
        this.inputEl.disabled = streaming;
    },

    stopStreaming() {
        if (this.abortController) {
            this.abortController.abort();
        }
    },

    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    },

    newChat() {
        this.currentSessionId = null;
        this.messages = [];
        this.messagesEl.innerHTML = `
            <div class="message assistant-message welcome">
                <div class="message-content">
                    <h2>Welcome to OpenClaude</h2>
                    <p>Start a conversation. I can help you with coding, file operations, and more.</p>
                    <div class="quick-actions">
                        <button class="quick-action" data-prompt="Help me write a Python script">Write Python script</button>
                        <button class="quick-action" data-prompt="Explain how this code works">Explain code</button>
                        <button class="quick-action" data-prompt="Fix a bug in my code">Fix a bug</button>
                    </div>
                </div>
            </div>
        `;

        // Rebind quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                this.inputEl.value = btn.dataset.prompt;
                this.sendMessage();
            });
        });

        // Clear active session
        document.querySelectorAll('.session-item').forEach(el => el.classList.remove('active'));
    },

    async loadSessions() {
        try {
            const response = await fetch('/api/history.php');
            const data = await response.json();

            if (data.sessions) {
                this.renderSessions(data.sessions);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    },

    renderSessions(sessions) {
        const listEl = document.getElementById('sessionList');
        listEl.innerHTML = sessions.map(s => `
            <div class="session-item ${s.id === this.currentSessionId ? 'active' : ''}"
                 data-id="${s.id}" onclick="Chat.loadSession(${s.id})">
                <div class="session-item-title">${Utils.escapeHtml(s.title)}</div>
                <div class="session-item-meta">${Utils.timeAgo(s.updated_at)}</div>
            </div>
        `).join('');
    },

    async loadSession(sessionId) {
        try {
            const response = await fetch(`/api/history.php?id=${sessionId}`);
            const data = await response.json();

            if (data.session && data.messages) {
                this.currentSessionId = sessionId;
                this.messages = data.messages;
                this.messagesEl.innerHTML = '';

                data.messages.forEach(msg => {
                    if (msg.role !== 'system') {
                        this.renderMessage(msg);
                    }
                });

                this.scrollToBottom();
                this.loadSessions();
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    },

    copyCode(btn) {
        const code = btn.closest('.code-block-header').nextElementSibling.querySelector('code');
        if (code) {
            Utils.copyToClipboard(code.textContent).then(success => {
                if (success) {
                    btn.classList.add('copied');
                    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy';
                    }, 2000);
                }
            });
        }
    },

    getToolDefinitions() {
        return [
            {
                type: 'function',
                function: {
                    name: 'read_file',
                    description: 'Read the contents of a file',
                    parameters: {
                        type: 'object',
                        properties: {
                            path: { type: 'string', description: 'File path to read' }
                        },
                        required: ['path']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'write_file',
                    description: 'Write content to a file',
                    parameters: {
                        type: 'object',
                        properties: {
                            path: { type: 'string', description: 'File path to write' },
                            content: { type: 'string', description: 'Content to write' }
                        },
                        required: ['path', 'content']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'list_files',
                    description: 'List files in a directory',
                    parameters: {
                        type: 'object',
                        properties: {
                            path: { type: 'string', description: 'Directory path' },
                            recursive: { type: 'boolean', description: 'List recursively' }
                        }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'search_files',
                    description: 'Search for files containing a pattern',
                    parameters: {
                        type: 'object',
                        properties: {
                            pattern: { type: 'string', description: 'Search pattern' },
                            path: { type: 'string', description: 'Directory to search in' }
                        },
                        required: ['pattern']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'execute_command',
                    description: 'Execute a shell command',
                    parameters: {
                        type: 'object',
                        properties: {
                            command: { type: 'string', description: 'Command to execute' }
                        },
                        required: ['command']
                    }
                }
            }
        ];
    }
};
