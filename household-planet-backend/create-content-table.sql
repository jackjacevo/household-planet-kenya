-- Create content management table
CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_updated_at ON content(updated_at);

-- Insert default homepage content
INSERT OR IGNORE INTO content (id, type, data, created_at, updated_at) VALUES 
('hp_banner_1', 'homepage_banner', '{"title":"Welcome to Household Planet Kenya","subtitle":"Your one-stop shop for quality household items","image":"/images/banner1.jpg","link":"/products","isActive":true,"sortOrder":1}', datetime('now'), datetime('now')),
('hp_section_1', 'homepage_section', '{"title":"Featured Products","content":"Discover our best-selling household items","type":"featured_products","isActive":true,"sortOrder":1}', datetime('now'), datetime('now')),
('hp_section_2', 'homepage_section', '{"title":"Why Choose Us","content":"Quality products, fast delivery, excellent service","type":"value_props","isActive":true,"sortOrder":2}', datetime('now'), datetime('now'));

-- Insert default static pages
INSERT OR IGNORE INTO content (id, type, data, created_at, updated_at) VALUES 
('page_about', 'static_page', '{"name":"About Us","slug":"about","title":"About Household Planet Kenya","content":"<h1>About Household Planet Kenya</h1><p>We are Kenya''s leading online marketplace for household items, committed to providing quality products at affordable prices.</p>","metaTitle":"About Us - Household Planet Kenya","metaDescription":"Learn about Household Planet Kenya, your trusted partner for household items and home essentials.","isActive":true}', datetime('now'), datetime('now')),
('page_terms', 'static_page', '{"name":"Terms of Service","slug":"terms","title":"Terms of Service","content":"<h1>Terms of Service</h1><p>Please read these terms carefully before using our services.</p>","metaTitle":"Terms of Service - Household Planet Kenya","metaDescription":"Terms and conditions for using Household Planet Kenya services.","isActive":true}', datetime('now'), datetime('now')),
('page_privacy', 'static_page', '{"name":"Privacy Policy","slug":"privacy","title":"Privacy Policy","content":"<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your information.</p>","metaTitle":"Privacy Policy - Household Planet Kenya","metaDescription":"Privacy policy and data protection information for Household Planet Kenya.","isActive":true}', datetime('now'), datetime('now'));

-- Insert default email templates
INSERT OR IGNORE INTO content (id, type, data, created_at, updated_at) VALUES 
('email_welcome', 'email_template', '{"name":"Welcome Email","subject":"Welcome to Household Planet Kenya!","content":"<h1>Welcome {{customerName}}!</h1><p>Thank you for joining Household Planet Kenya. We''re excited to have you as part of our community.</p>","variables":["customerName","email"],"isActive":true}', datetime('now'), datetime('now')),
('email_order_confirm', 'email_template', '{"name":"Order Confirmation","subject":"Order Confirmation - {{orderNumber}}","content":"<h1>Order Confirmed</h1><p>Dear {{customerName}},</p><p>Your order {{orderNumber}} has been confirmed and is being processed.</p><p>Total: KSh {{orderTotal}}</p>","variables":["customerName","orderNumber","orderTotal"],"isActive":true}', datetime('now'), datetime('now')),
('email_order_shipped', 'email_template', '{"name":"Order Shipped","subject":"Your order has been shipped - {{orderNumber}}","content":"<h1>Order Shipped</h1><p>Great news! Your order {{orderNumber}} has been shipped and is on its way.</p><p>Tracking: {{trackingNumber}}</p>","variables":["customerName","orderNumber","trackingNumber"],"isActive":true}', datetime('now'), datetime('now'));

-- Insert default FAQs
INSERT OR IGNORE INTO content (id, type, data, created_at, updated_at) VALUES 
('faq_1', 'faq', '{"question":"How do I place an order?","answer":"You can place an order by browsing our products, adding items to your cart, and proceeding to checkout.","category":"Orders","sortOrder":1,"isActive":true}', datetime('now'), datetime('now')),
('faq_2', 'faq', '{"question":"What payment methods do you accept?","answer":"We accept M-Pesa, credit cards, and bank transfers.","category":"Payment","sortOrder":2,"isActive":true}', datetime('now'), datetime('now')),
('faq_3', 'faq', '{"question":"How long does delivery take?","answer":"Delivery typically takes 1-3 business days within Nairobi and 3-7 days for other locations.","category":"Delivery","sortOrder":3,"isActive":true}', datetime('now'), datetime('now'));

-- Insert sample blog post
INSERT OR IGNORE INTO content (id, type, data, created_at, updated_at) VALUES 
('blog_1', 'blog_post', '{"title":"Welcome to Our New Website","slug":"welcome-to-our-new-website","excerpt":"We''re excited to launch our new and improved website with better features and user experience.","content":"<h1>Welcome to Our New Website</h1><p>We''re thrilled to announce the launch of our redesigned website, featuring improved navigation, better product search, and enhanced checkout experience.</p>","image":"/images/blog/welcome.jpg","author":"Household Planet Team","tags":["announcement","website","launch"],"metaTitle":"Welcome to Our New Website - Household Planet Kenya","metaDescription":"Discover the new features and improvements in our redesigned website.","publishedAt":"' || datetime('now') || '","isActive":true}', datetime('now'), datetime('now'));