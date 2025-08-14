#!/bin/bash
# SSL Certificate Setup Script
# Enhanced with comprehensive error handling and security

set -euo pipefail
IFS=$'\n\t'

# Configuration
readonly DOMAIN="householdplanet.co.ke"
readonly EMAIL="admin@householdplanet.co.ke"
readonly LOG_FILE="/var/log/ssl-setup.log"
readonly BACKUP_DIR="/var/backups/ssl-setup"

# Error handling
error_exit() {
    local error_message="$1"
    echo "ERROR: ${error_message}" >&2
    echo "ERROR: SSL setup failed at $(date)" >&2
    
    # Attempt to restore nginx if it was stopped
    if systemctl is-enabled nginx >/dev/null 2>&1; then
        echo "Attempting to restart nginx..." >&2
        systemctl start nginx || echo "Failed to restart nginx" >&2
    fi
    
    exit 1
}

trap 'error_exit "Unexpected error occurred"' ERR

# Setup logging
setup_logging() {
    mkdir -p "$(dirname "$LOG_FILE")" || error_exit "Failed to create log directory"
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
}

# Validate environment
validate_environment() {
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error_exit "This script must be run as root"
    fi
    
    # Check if domain is reachable
    if ! ping -c 1 "$DOMAIN" >/dev/null 2>&1; then
        echo "WARNING: Domain $DOMAIN is not reachable. SSL setup may fail."
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"
}

# Install Certbot with error handling
install_certbot() {
    echo "Installing Certbot..."
    
    if ! timeout 300 apt update; then
        error_exit "Failed to update package lists"
    fi
    
    if ! timeout 600 apt install -y certbot python3-certbot-nginx; then
        error_exit "Failed to install Certbot"
    fi
    
    echo "Certbot installed successfully"
}

# Setup SSL certificate
setup_ssl_certificate() {
    echo "Setting up SSL certificate for $DOMAIN..."
    
    # Check if nginx is running and stop it
    local nginx_was_running=false
    if systemctl is-active --quiet nginx; then
        nginx_was_running=true
        echo "Stopping nginx temporarily..."
        systemctl stop nginx || error_exit "Failed to stop nginx"
    fi
    
    # Obtain SSL certificate
    if ! certbot certonly --standalone \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --expand; then
        
        # Restart nginx if it was running
        if [[ "$nginx_was_running" == true ]]; then
            systemctl start nginx || echo "Failed to restart nginx" >&2
        fi
        
        error_exit "Failed to obtain SSL certificate"
    fi
    
    echo "SSL certificate obtained successfully"
}

# Create DH parameters with progress
create_dh_params() {
    echo "Creating strong DH parameters (this may take several minutes)..."
    
    local dh_file="/etc/ssl/certs/dhparam.pem"
    
    # Check if DH params already exist
    if [[ -f "$dh_file" ]]; then
        echo "DH parameters already exist, backing up..."
        cp "$dh_file" "$BACKUP_DIR/dhparam.pem.backup.$(date +%Y%m%d_%H%M%S)" || \
            error_exit "Failed to backup existing DH parameters"
    fi
    
    # Generate new DH parameters
    if ! timeout 1800 openssl dhparam -out "$dh_file" 2048; then
        error_exit "Failed to create DH parameters (timeout or error)"
    fi
    
    # Verify DH parameters
    if ! openssl dhparam -in "$dh_file" -check -noout; then
        error_exit "Generated DH parameters are invalid"
    fi
    
    echo "DH parameters created successfully"
}

setup_logging
validate_environment
install_certbot
setup_ssl_certificate
create_dh_params

# Create SSL configuration for Nginx with backup
create_ssl_config() {
    echo "Creating SSL configuration for Nginx..."
    
    local ssl_config="/etc/nginx/snippets/ssl-params.conf"
    
    # Backup existing config if it exists
    if [[ -f "$ssl_config" ]]; then
        cp "$ssl_config" "$BACKUP_DIR/ssl-params.conf.backup.$(date +%Y%m%d_%H%M%S)" || \
            error_exit "Failed to backup existing SSL config"
    fi
    
    # Create SSL configuration
    cat > "$ssl_config" << 'EOF'
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_dhparam /etc/ssl/certs/dhparam.pem;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
ssl_ecdh_curve secp384r1;
ssl_session_timeout 10m;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';";
EOF
    
    if [[ ! -f "$ssl_config" ]]; then
        error_exit "Failed to create SSL configuration file"
    fi
    
    echo "SSL configuration created successfully"
}

# Create Nginx server configuration with validation
create_nginx_config() {
    echo "Creating Nginx server configuration..."
    
    local nginx_config="/etc/nginx/sites-available/household-planet"
    
    # Backup existing config if it exists
    if [[ -f "$nginx_config" ]]; then
        cp "$nginx_config" "$BACKUP_DIR/household-planet.backup.$(date +%Y%m%d_%H%M%S)" || \
            error_exit "Failed to backup existing Nginx config"
    fi
    
    # Create server configuration
    cat > "$nginx_config" << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server configuration
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/nginx/snippets/ssl-params.conf;

    # Security headers and DDoS protection
    include /etc/nginx/conf.d/ddos-protection.conf;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Security headers
        proxy_set_header X-Frame-Options DENY;
        proxy_set_header X-Content-Type-Options nosniff;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting for API
        limit_req zone=api burst=10 nodelay;
        limit_req_status 429;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(env|config|sql|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF
    
    if [[ ! -f "$nginx_config" ]]; then
        error_exit "Failed to create Nginx configuration file"
    fi
    
    echo "Nginx configuration created successfully"
}

# Configure and start Nginx
configure_nginx() {
    echo "Configuring Nginx..."
    
    # Enable the site
    if ! ln -sf /etc/nginx/sites-available/household-planet /etc/nginx/sites-enabled/; then
        error_exit "Failed to enable Nginx site"
    fi
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if ! nginx -t; then
        error_exit "Nginx configuration test failed"
    fi
    
    echo "Nginx configuration is valid"
    
    # Start and enable Nginx
    if ! systemctl start nginx; then
        error_exit "Failed to start Nginx"
    fi
    
    if ! systemctl enable nginx; then
        error_exit "Failed to enable Nginx service"
    fi
    
    # Verify Nginx is running
    if ! systemctl is-active --quiet nginx; then
        error_exit "Nginx is not running after start"
    fi
    
    echo "Nginx started and enabled successfully"
}

# Setup automatic certificate renewal
setup_auto_renewal() {
    echo "Setting up automatic certificate renewal..."
    
    # Create renewal script
    local renewal_script="/usr/local/bin/certbot-renewal.sh"
    
    cat > "$renewal_script" << 'EOF'
#!/bin/bash
# Certbot renewal script with logging

LOG_FILE="/var/log/certbot-renewal.log"

echo "$(date): Starting certificate renewal check" >> "$LOG_FILE"

if /usr/bin/certbot renew --quiet; then
    echo "$(date): Certificate renewal check completed successfully" >> "$LOG_FILE"
    # Reload nginx if certificates were renewed
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        echo "$(date): Nginx reloaded after certificate renewal" >> "$LOG_FILE"
    fi
else
    echo "$(date): Certificate renewal check failed" >> "$LOG_FILE"
fi
EOF
    
    chmod +x "$renewal_script" || error_exit "Failed to make renewal script executable"
    
    # Add to crontab
    local cron_entry="0 12 * * * $renewal_script"
    
    # Check if cron entry already exists
    if ! crontab -l 2>/dev/null | grep -q "$renewal_script"; then
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab - || \
            error_exit "Failed to add certificate renewal to crontab"
        echo "Certificate auto-renewal configured successfully"
    else
        echo "Certificate auto-renewal already configured"
    fi
}

# Final verification
final_verification() {
    echo "Performing final verification..."
    
    # Test SSL certificate
    if ! echo | timeout 10 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" >/dev/null 2>&1; then
        echo "WARNING: SSL certificate test failed. Manual verification recommended." >&2
    else
        echo "✓ SSL certificate is working"
    fi
    
    # Check Nginx status
    if systemctl is-active --quiet nginx; then
        echo "✓ Nginx is running"
    else
        echo "✗ Nginx is not running" >&2
    fi
    
    # Check certificate expiry
    local cert_file="/etc/letsencrypt/live/$DOMAIN/cert.pem"
    if [[ -f "$cert_file" ]]; then
        local expiry_date
        expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        echo "Certificate expires: $expiry_date"
    fi
}

create_ssl_config
create_nginx_config
configure_nginx
setup_auto_renewal
final_verification

echo "==========================================="
echo "SSL setup completed successfully!"
echo "Domain: $DOMAIN"
echo "Certificate location: /etc/letsencrypt/live/$DOMAIN/"
echo "Log file: $LOG_FILE"
echo "Backup directory: $BACKUP_DIR"
echo "Auto-renewal: Daily at 12:00 PM"
echo "==========================================="