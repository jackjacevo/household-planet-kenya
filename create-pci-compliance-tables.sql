-- PCI DSS Compliance Database Tables

-- Payment tokens (never store actual card data)
CREATE TABLE IF NOT EXISTS payment_token (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token VARCHAR(255) UNIQUE NOT NULL,
    payment_method_id VARCHAR(255) NOT NULL, -- Stripe/provider token
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment audit log for PCI compliance
CREATE TABLE IF NOT EXISTS payment_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event VARCHAR(100) NOT NULL,
    details TEXT,
    user_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- PCI compliance monitoring
CREATE TABLE IF NOT EXISTS pci_compliance_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- PASS, FAIL, WARNING
    details TEXT,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Secure payment sessions
CREATE TABLE IF NOT EXISTS payment_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Update payments table to remove any card data fields
-- Ensure no sensitive card data is stored
ALTER TABLE payments ADD COLUMN masked_card_number VARCHAR(20); -- Only last 4 digits
ALTER TABLE payments ADD COLUMN card_brand VARCHAR(20); -- Visa, Mastercard, etc.
ALTER TABLE payments ADD COLUMN payment_token_id INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_token_user_id ON payment_token(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_token_expires ON payment_token(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_audit_timestamp ON payment_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_audit_user_id ON payment_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_session_user_id ON payment_session(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_session_expires ON payment_session(expires_at);

-- Add constraints to prevent card data storage
-- These would be implemented in application logic to reject any attempts to store:
-- - Full card numbers
-- - CVV/CVC codes
-- - Expiry dates in plain text
-- - Cardholder names with card numbers

COMMENT ON TABLE payment_token IS 'Stores only payment tokens, never actual card data (PCI DSS compliant)';
COMMENT ON TABLE payment_audit_log IS 'Audit trail for all payment-related activities';
COMMENT ON TABLE pci_compliance_log IS 'PCI DSS compliance monitoring and checks';
COMMENT ON TABLE payment_session IS 'Secure payment session management';