-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at);

-- Update user roles enum to include staff roles
-- Note: In SQLite, we can't modify enum directly, but we can add constraints
-- The application will handle role validation

-- Insert sample admin activity logs
INSERT OR IGNORE INTO admin_activity_log (id, user_id, action, details, created_at) VALUES 
('log_1', (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), 'SYSTEM_SETUP', '{"message":"Admin panel initialized"}', datetime('now')),
('log_2', (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), 'DATABASE_MIGRATION', '{"message":"Admin tables created"}', datetime('now'));