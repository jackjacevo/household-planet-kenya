-- Compliance and Security Enhancement Tables

-- Age Verification Table
CREATE TABLE IF NOT EXISTS age_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date_of_birth DATE NOT NULL,
    age INTEGER NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    document_type TEXT,
    document_number_hash TEXT,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Geographic Access Log
CREATE TABLE IF NOT EXISTS geographic_access_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER NOT NULL,
    county TEXT NOT NULL,
    allowed BOOLEAN NOT NULL,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tax Records
CREATE TABLE IF NOT EXISTS tax_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    vat_rate DECIMAL(5,4) NOT NULL,
    is_exempt BOOLEAN DEFAULT FALSE,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Consumer Complaints
CREATE TABLE IF NOT EXISTS consumer_complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_id INTEGER,
    product_id INTEGER,
    complaint_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'SUBMITTED',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_resolution_date DATETIME,
    resolved_at DATETIME,
    resolution TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_id INTEGER,
    product_id INTEGER,
    dispute_type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2),
    status TEXT DEFAULT 'INITIATED',
    priority TEXT DEFAULT 'MEDIUM',
    assigned_department TEXT,
    initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_resolution_date DATETIME,
    resolved_at DATETIME,
    resolution TEXT,
    escalation_reason TEXT,
    escalated_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Security Incidents
CREATE TABLE IF NOT EXISTS security_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_systems TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'DETECTED',
    reported_by TEXT,
    response_notes TEXT,
    resolved_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security Scans
CREATE TABLE IF NOT EXISTS security_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_type TEXT NOT NULL,
    vulnerabilities_found INTEGER DEFAULT 0,
    results TEXT,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security Training
CREATE TABLE IF NOT EXISTS security_training (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    score INTEGER,
    passed BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Update Products table for compliance features
ALTER TABLE products ADD COLUMN age_restricted BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN minimum_age INTEGER DEFAULT 18;
ALTER TABLE products ADD COLUMN vat_exempt BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN restricted_regions TEXT;
ALTER TABLE products ADD COLUMN warranty_period TEXT DEFAULT '1 year';
ALTER TABLE products ADD COLUMN warranty_type TEXT DEFAULT 'Manufacturer warranty';
ALTER TABLE products ADD COLUMN warranty_terms TEXT;

-- Update Categories table for VAT exemption
ALTER TABLE categories ADD COLUMN vat_exempt BOOLEAN DEFAULT FALSE;

-- Update Users table for security training compliance
ALTER TABLE users ADD COLUMN security_training_compliant BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_training_update DATETIME;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_age_verification_user_id ON age_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_geographic_access_log_product_id ON geographic_access_log(product_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_order_id ON tax_records(order_id);
CREATE INDEX IF NOT EXISTS idx_consumer_complaints_user_id ON consumer_complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_type ON security_incidents(type);
CREATE INDEX IF NOT EXISTS idx_security_scans_scan_type ON security_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_security_training_user_id ON security_training(user_id);