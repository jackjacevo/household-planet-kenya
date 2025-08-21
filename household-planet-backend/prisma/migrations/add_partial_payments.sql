-- Add partial payment support
ALTER TABLE payment_transactions ADD COLUMN is_partial BOOLEAN DEFAULT FALSE;
ALTER TABLE payment_transactions ADD COLUMN parent_transaction_id INTEGER;
ALTER TABLE payment_transactions ADD COLUMN remaining_amount DECIMAL;

-- Add refund tracking
CREATE TABLE IF NOT EXISTS payment_refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL,
  refund_amount DECIMAL NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'PENDING',
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id)
);

-- Add invoice tracking
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'GENERATED',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);