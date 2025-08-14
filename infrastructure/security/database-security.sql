-- Database Security Configuration
-- For PostgreSQL (adjust for your database system)

-- Create audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- Create database access log table
CREATE TABLE IF NOT EXISTS database_access_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100),
    database_name VARCHAR(100),
    query_type VARCHAR(50),
    query_text TEXT,
    execution_time INTEGER,
    rows_affected INTEGER,
    success BOOLEAN,
    error_message TEXT,
    ip_address INET
);

-- Create function to log database operations
CREATE OR REPLACE FUNCTION log_database_operation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        COALESCE(current_setting('app.current_user_id', true)::INTEGER, 0),
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)
            ELSE NULL
        END,
        CASE 
            WHEN TG_OP = 'INSERT' THEN row_to_json(NEW)
            WHEN TG_OP = 'UPDATE' THEN row_to_json(NEW)
            ELSE NULL
        END,
        COALESCE(current_setting('app.client_ip', true)::INET, '127.0.0.1'::INET)
    );
    
    RETURN CASE 
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for sensitive tables (adjust table names as needed)
-- Users table
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_database_operation();

-- Orders table
DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_database_operation();

-- Payments table
DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION log_database_operation();

-- Products table
DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION log_database_operation();

-- Create restricted database user for application
-- Replace 'your_password' with a strong password
CREATE USER app_user WITH PASSWORD 'your_secure_password_here';

-- Grant minimal required permissions
GRANT CONNECT ON DATABASE household_planet TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant table permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO app_user;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM app_user;
REVOKE ALL ON security_audit_log FROM app_user;
REVOKE ALL ON database_access_log FROM app_user;

-- Create read-only user for reporting
CREATE USER report_user WITH PASSWORD 'your_report_password_here';
GRANT CONNECT ON DATABASE household_planet TO report_user;
GRANT USAGE ON SCHEMA public TO report_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO report_user;

-- Create function to clean old audit logs
CREATE OR REPLACE FUNCTION cleanup_audit_logs()
RETURNS void AS $$
BEGIN
    -- Delete audit logs older than 90 days
    DELETE FROM security_audit_log 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    -- Delete access logs older than 30 days
    DELETE FROM database_access_log 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON security_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON security_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_access_log_timestamp ON database_access_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_log_username ON database_access_log(username);

-- Enable row level security (if supported)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own data
-- CREATE POLICY user_isolation_policy ON users
--     FOR ALL TO app_user
--     USING (id = current_setting('app.current_user_id')::INTEGER);

COMMENT ON TABLE security_audit_log IS 'Logs all database operations for security auditing';
COMMENT ON TABLE database_access_log IS 'Logs database access attempts and queries';
COMMENT ON FUNCTION log_database_operation() IS 'Trigger function to log database operations';
COMMENT ON FUNCTION cleanup_audit_logs() IS 'Function to clean up old audit logs';