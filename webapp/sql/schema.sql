-- OpenClaude Web App Database Schema
-- Run this in phpMyAdmin on your existing 'torquest_devlover' database

-- Users (GitHub OAuth)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    github_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) DEFAULT 'New Chat',
    provider VARCHAR(50) DEFAULT 'gitlawb-opengateway',
    model VARCHAR(100) DEFAULT 'mimo-v2.5',
    system_prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    role ENUM('user', 'assistant', 'system', 'tool') NOT NULL,
    content LONGTEXT,
    tool_calls JSON,
    tool_call_id VARCHAR(100),
    tool_name VARCHAR(100),
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Provider settings per user
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    provider VARCHAR(50) DEFAULT 'gitlawb-opengateway',
    api_key VARCHAR(255),
    model VARCHAR(100) DEFAULT 'mimo-v2.5',
    temperature FLOAT DEFAULT 0.7,
    max_tokens INT DEFAULT 4096,
    system_prompt TEXT DEFAULT 'You are a helpful coding assistant.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tool execution logs
CREATE TABLE IF NOT EXISTS tool_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    message_id INT,
    tool_name VARCHAR(100) NOT NULL,
    input LONGTEXT,
    output LONGTEXT,
    duration_ms INT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_tool_logs_session ON tool_logs(session_id);
