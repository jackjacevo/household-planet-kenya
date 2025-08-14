-- Phase 9 Security and Compliance Tables

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event VARCHAR(100) NOT NULL,
    details TEXT,
    user_id INTEGER,
    ip_address VARCHAR(45),
    severity VARCHAR(20) DEFAULT 'LOW',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    user_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    session_id VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- Payment Audit Log Table
CREATE TABLE IF NOT EXISTS payment_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_id INTEGER,
    ip_address VARCHAR(45),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- Payment Tokens Table (PCI Compliance)
CREATE TABLE IF NOT EXISTS payment_token (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token VARCHAR(255) UNIQUE NOT NULL,
    payment_method_id VARCHAR(255) NOT NULL, -- Stripe payment method ID
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Data Breach Log Table
CREATE TABLE IF NOT EXISTS data_breach (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    detected_at DATETIME NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'DETECTED',
    affected_user_count INTEGER DEFAULT 0,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Consent Table (GDPR)
CREATE TABLE IF NOT EXISTS user_consent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    consent_type VARCHAR(100) NOT NULL,
    granted BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Cookie Consent Table
CREATE TABLE IF NOT EXISTS cookie_consent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(255) NOT NULL,
    necessary BOOLEAN DEFAULT TRUE,
    analytics BOOLEAN DEFAULT FALSE,
    marketing BOOLEAN DEFAULT FALSE,
    preferences BOOLEAN DEFAULT FALSE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Data Export Request Table
CREATE TABLE IF NOT EXISTS data_export_request (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    download_url VARCHAR(500),
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Data Deletion Request Table
CREATE TABLE IF NOT EXISTS data_deletion_request (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_for DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Security Configuration Table
CREATE TABLE IF NOT EXISTS security_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Failed Login Attempts Table
CREATE TABLE IF NOT EXISTS failed_login_attempt (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_ip (email, ip_address),
    INDEX idx_attempted_at (attempted_at)
);

-- Account Lockout Table
CREATE TABLE IF NOT EXISTS account_lockout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    locked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Security Headers Log Table
CREATE TABLE IF NOT EXISTS security_headers_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_path VARCHAR(500),
    headers_applied TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CSRF Token Table
CREATE TABLE IF NOT EXISTS csrf_token (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token VARCHAR(255) UNIQUE NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Rate Limit Log Table
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255),
    requests_count INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    blocked BOOLEAN DEFAULT FALSE,
    INDEX idx_ip_window (ip_address, window_start)
);

-- Insert default security configuration
INSERT OR IGNORE INTO security_config (config_key, config_value, description) VALUES
('password_min_length', '8', 'Minimum password length requirement'),
('password_require_uppercase', 'true', 'Require uppercase letters in passwords'),
('password_require_lowercase', 'true', 'Require lowercase letters in passwords'),
('password_require_numbers', 'true', 'Require numbers in passwords'),
('password_require_special', 'true', 'Require special characters in passwords'),
('account_lockout_attempts', '5', 'Number of failed attempts before lockout'),
('account_lockout_duration', '900', 'Account lockout duration in seconds (15 minutes)'),
('session_timeout', '900', 'Session timeout in seconds (15 minutes)'),
('csrf_token_expiry', '3600', 'CSRF token expiry in seconds (1 hour)'),
('rate_limit_window', '60', 'Rate limit window in seconds'),
('rate_limit_max_requests', '100', 'Maximum requests per window'),
('encryption_algorithm', 'aes-256-gcm', 'Encryption algorithm for sensitive data'),
('hash_rounds', '14', 'bcrypt hash rounds for passwords'),
('jwt_expiry', '900', 'JWT token expiry in seconds (15 minutes)'),
('data_retention_days', '2555', 'Data retention period in days (7 years)'),
('audit_log_retention_days', '90', 'Audit log retention in days'),
('security_event_retention_days', '90', 'Security event log retention in days');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_event_timestamp ON security_event(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_event_severity ON security_event(severity);
CREATE INDEX IF NOT EXISTS idx_security_event_user_id ON security_event(user_id);
CREATE INDEX IF NOT EXISTS idx_security_event_ip ON security_event(ip_address);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource, resource_id);

CREATE INDEX IF NOT EXISTS idx_payment_audit_timestamp ON payment_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_audit_user_id ON payment_audit_log(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_token_expires ON payment_token(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_token_user_id ON payment_token(user_id);

CREATE INDEX IF NOT EXISTS idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consent_type ON user_consent(consent_type);

CREATE INDEX IF NOT EXISTS idx_cookie_consent_session ON cookie_consent(session_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consent_timestamp ON cookie_consent(timestamp);

CREATE INDEX IF NOT EXISTS idx_data_export_user_id ON data_export_request(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON data_export_request(status);

CREATE INDEX IF NOT EXISTS idx_data_deletion_user_id ON data_deletion_request(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_status ON data_deletion_request(status);

CREATE INDEX IF NOT EXISTS idx_failed_login_email ON failed_login_attempt(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_ip ON failed_login_attempt(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_time ON failed_login_attempt(attempted_at);

CREATE INDEX IF NOT EXISTS idx_account_lockout_email ON account_lockout(email);
CREATE INDEX IF NOT EXISTS idx_account_lockout_expires ON account_lockout(expires_at);

CREATE INDEX IF NOT EXISTS idx_csrf_token_session ON csrf_token(session_id);
CREATE INDEX IF NOT EXISTS idx_csrf_token_expires ON csrf_token(expires_at);

-- Add privacy settings column to user table if not exists
ALTER TABLE user ADD COLUMN privacy_settings TEXT DEFAULT '{}';
ALTER TABLE user ADD COLUMN last_login_at DATETIME;
ALTER TABLE user ADD COLUMN account_locked_until DATETIME;
ALTER TABLE user ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user ADD COLUMN date_of_birth DATE;

-- Create view for security dashboard
CREATE VIEW IF NOT EXISTS security_dashboard AS
SELECT 
    'security_events' as metric,
    COUNT(*) as count,
    'last_24h' as period
FROM security_event 
WHERE timestamp >= datetime('now', '-24 hours')
UNION ALL
SELECT 
    'failed_logins' as metric,
    COUNT(*) as count,
    'last_24h' as period
FROM failed_login_attempt 
WHERE attempted_at >= datetime('now', '-24 hours')
UNION ALL
SELECT 
    'account_lockouts' as metric,
    COUNT(*) as count,
    'last_24h' as period
FROM account_lockout 
WHERE locked_at >= datetime('now', '-24 hours')
UNION ALL
SELECT 
    'data_breaches' as metric,
    COUNT(*) as count,
    'last_30d' as period
FROM data_breach 
WHERE detected_at >= datetime('now', '-30 days');

-- Create view for compliance dashboard
CREATE VIEW IF NOT EXISTS compliance_dashboard AS
SELECT 
    'gdpr_consents' as metric,
    COUNT(*) as count,
    'total' as period
FROM user_consent 
WHERE granted = TRUE
UNION ALL
SELECT 
    'data_exports' as metric,
    COUNT(*) as count,
    'last_30d' as period
FROM data_export_request 
WHERE requested_at >= datetime('now', '-30 days')
UNION ALL
SELECT 
    'data_deletions' as metric,
    COUNT(*) as count,
    'last_30d' as period
FROM data_deletion_request 
WHERE requested_at >= datetime('now', '-30 days')
UNION ALL
SELECT 
    'cookie_consents' as metric,
    COUNT(*) as count,
    'last_30d' as period
FROM cookie_consent 
WHERE timestamp >= datetime('now', '-30 days');

-- Sample security events for testing
INSERT OR IGNORE INTO security_event (event, details, severity, ip_address) VALUES
('SYSTEM_STARTUP', '{"message": "Security system initialized"}', 'LOW', '127.0.0.1'),
('SECURITY_AUDIT_COMPLETED', '{"score": 95, "status": "COMPLIANT"}', 'LOW', '127.0.0.1'),
('RATE_LIMIT_CONFIGURED', '{"maxRequests": 100, "windowMs": 60000}', 'LOW', '127.0.0.1');

-- Sample audit log entries
INSERT OR IGNORE INTO audit_log (action, resource, resource_id, details) VALUES
('SECURITY_TABLES_CREATED', 'DATABASE', 'security_schema', '{"tables": ["security_event", "audit_log", "payment_audit_log"]}'),
('SECURITY_CONFIG_INITIALIZED', 'SYSTEM', 'security_config', '{"configCount": 17}'),
('COMPLIANCE_TABLES_CREATED', 'DATABASE', 'compliance_schema', '{"tables": ["user_consent", "cookie_consent", "data_export_request"]}');

PRAGMA foreign_keys = ON;