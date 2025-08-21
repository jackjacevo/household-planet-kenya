#!/bin/bash

# SSL Certificate Setup Script for Production
# This script sets up Let's Encrypt SSL certificates using Certbot

set -e

DOMAIN="householdplanet.co.ke"
EMAIL="admin@householdplanet.co.ke"

echo "Setting up SSL certificates for $DOMAIN"

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Stop Nginx temporarily
sudo systemctl stop nginx

# Obtain SSL certificate
echo "Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN

# Create SSL directory for Docker
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/

# Set proper permissions
sudo chmod 644 /etc/nginx/ssl/fullchain.pem
sudo chmod 600 /etc/nginx/ssl/privkey.pem

# Setup auto-renewal
echo "Setting up auto-renewal..."
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx"; } | sudo crontab -

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "SSL setup completed successfully!"
echo "Certificates are valid for 90 days and will auto-renew."