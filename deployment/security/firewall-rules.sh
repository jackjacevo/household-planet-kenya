#!/bin/bash

# Production Firewall Configuration
set -e

echo "🔒 Configuring production firewall rules..."

# Reset firewall
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH access (change port for security)
sudo ufw allow 2222/tcp comment 'SSH'

# HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Database (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 5432 comment 'PostgreSQL internal'
sudo ufw allow from 172.16.0.0/12 to any port 5432 comment 'PostgreSQL internal'
sudo ufw allow from 192.168.0.0/16 to any port 5432 comment 'PostgreSQL internal'

# Redis (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 6379 comment 'Redis internal'
sudo ufw allow from 172.16.0.0/12 to any port 6379 comment 'Redis internal'
sudo ufw allow from 192.168.0.0/16 to any port 6379 comment 'Redis internal'

# Monitoring
sudo ufw allow from 10.0.0.0/8 to any port 9090 comment 'Prometheus internal'
sudo ufw allow from 10.0.0.0/8 to any port 3000 comment 'Grafana internal'

# Rate limiting
sudo ufw limit ssh comment 'Rate limit SSH'

# Enable firewall
sudo ufw --force enable

echo "✅ Firewall configured successfully"