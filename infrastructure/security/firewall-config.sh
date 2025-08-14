#!/bin/bash
# Firewall Configuration Script

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" >&2
   exit 1
fi

# Log all actions
exec > >(tee -a /var/log/firewall-config.log)
exec 2>&1

echo "Starting firewall configuration at $(date)"

# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    echo "UFW is not installed. Installing..." >&2
    if ! apt update && apt install -y ufw; then
        echo "Failed to install UFW" >&2
        exit 1
    fi
fi

# Reset UFW to defaults
echo "Resetting UFW to defaults..."
if ! ufw --force reset; then
    echo "Failed to reset UFW" >&2
    exit 1
fi

# Set default policies
echo "Setting default policies..."
if ! ufw default deny incoming; then
    echo "Failed to set default deny incoming" >&2
    exit 1
fi
if ! ufw default allow outgoing; then
    echo "Failed to set default allow outgoing" >&2
    exit 1
fi

# Allow SSH (custom port)
echo "Configuring SSH access..."
if ! ufw allow 2222/tcp; then
    echo "Failed to allow SSH port" >&2
    exit 1
fi

# Allow HTTP and HTTPS
echo "Configuring web server access..."
if ! ufw allow 80/tcp || ! ufw allow 443/tcp; then
    echo "Failed to allow web server ports" >&2
    exit 1
fi

# Allow Node.js application ports (only in development)
if [[ "${NODE_ENV:-development}" == "development" ]]; then
    echo "Configuring development ports..."
    ufw allow 3000/tcp
    ufw allow 3001/tcp
fi

# Allow database connections (restrict to localhost)
echo "Configuring database access..."
if ! ufw allow from 127.0.0.1 to any port 5432 || ! ufw allow from 127.0.0.1 to any port 3306; then
    echo "Failed to configure database access" >&2
    exit 1
fi

# Rate limiting for SSH
echo "Configuring rate limiting..."
if ! ufw limit 2222/tcp; then
    echo "Failed to configure SSH rate limiting" >&2
    exit 1
fi

# Enable logging
echo "Enabling firewall logging..."
if ! ufw logging on; then
    echo "Failed to enable logging" >&2
    exit 1
fi

# Enable firewall
echo "Enabling firewall..."
if ! ufw --force enable; then
    echo "Failed to enable firewall" >&2
    exit 1
fi

# Verify firewall status
echo "Verifying firewall status..."
if ! ufw status verbose; then
    echo "Failed to get firewall status" >&2
    exit 1
fi

echo "Firewall configured successfully at $(date)"
echo "Log file: /var/log/firewall-config.log"