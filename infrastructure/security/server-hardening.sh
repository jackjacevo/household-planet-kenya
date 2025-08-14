#!/bin/bash
# Server Hardening Script for Ubuntu/Debian
# Enhanced with comprehensive error handling and security checks

set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'       # Secure Internal Field Separator

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly LOG_FILE="/var/log/server-hardening.log"
readonly BACKUP_DIR="/var/backups/server-hardening"
readonly MAX_LOG_SIZE=10485760  # 10MB

# Error handling function
error_exit() {
    local error_message="$1"
    local line_number="${2:-}"
    echo "ERROR: ${error_message}" >&2
    if [[ -n "$line_number" ]]; then
        echo "ERROR: Line $line_number in $SCRIPT_NAME" >&2
    fi
    echo "ERROR: Server hardening failed at $(date)" >&2
    exit 1
}

# Set up error trap
trap 'error_exit "Unexpected error occurred" $LINENO' ERR

# Cleanup function
cleanup() {
    echo "Performing cleanup..."
    # Remove any temporary files if they exist
    rm -f /tmp/server-hardening-*
}

# Set up cleanup trap
trap cleanup EXIT

# Validation functions
validate_environment() {
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error_exit "This script must be run as root"
    fi
    
    # Check if running on supported OS
    if ! command -v apt >/dev/null 2>&1; then
        error_exit "This script requires apt package manager (Ubuntu/Debian)"
    fi
    
    # Check available disk space (minimum 1GB)
    local available_space
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 1048576 ]]; then
        error_exit "Insufficient disk space. At least 1GB required."
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"
}

# Logging setup with rotation
setup_logging() {
    # Rotate log if it's too large
    if [[ -f "$LOG_FILE" ]] && [[ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]]; then
        mv "$LOG_FILE" "${LOG_FILE}.old" || error_exit "Failed to rotate log file"
    fi
    
    # Set up logging
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
}

# Initialize script
validate_environment
setup_logging

echo "Starting server hardening at $(date)"
echo "Script: $SCRIPT_NAME"
echo "Log file: $LOG_FILE"

# Update system packages with error handling
update_system() {
    echo "Updating system packages..."
    
    # Update package lists
    if ! timeout 300 apt update; then
        error_exit "Failed to update package lists (timeout or error)"
    fi
    
    # Upgrade packages with automatic yes and error handling
    if ! timeout 1800 apt upgrade -y; then
        error_exit "Failed to upgrade system packages (timeout or error)"
    fi
    
    echo "System packages updated successfully"
}

update_system

# Install security packages with validation
install_security_packages() {
    echo "Installing security packages..."
    
    local packages=("fail2ban" "ufw" "unattended-upgrades" "logwatch" "rkhunter" "chkrootkit")
    local failed_packages=()
    
    for package in "${packages[@]}"; do
        echo "Installing $package..."
        if ! timeout 300 apt install -y "$package"; then
            failed_packages+=("$package")
            echo "WARNING: Failed to install $package" >&2
        else
            echo "Successfully installed $package"
        fi
    done
    
    if [[ ${#failed_packages[@]} -gt 0 ]]; then
        error_exit "Failed to install packages: ${failed_packages[*]}"
    fi
    
    echo "All security packages installed successfully"
}

install_security_packages

# Configure automatic security updates with backup
configure_auto_updates() {
    echo "Configuring automatic security updates..."
    
    local config_file="/etc/apt/apt.conf.d/50unattended-upgrades"
    
    # Backup original configuration
    if [[ -f "$config_file" ]]; then
        cp "$config_file" "$BACKUP_DIR/50unattended-upgrades.backup.$(date +%Y%m%d_%H%M%S)" || \
            error_exit "Failed to backup unattended-upgrades config"
    fi
    
    # Configure automatic updates
    {
        echo 'Unattended-Upgrade::Automatic-Reboot "false";'
        echo 'Unattended-Upgrade::Remove-Unused-Dependencies "true";'
        echo 'Unattended-Upgrade::AutoFixInterruptedDpkg "true";'
        echo 'Unattended-Upgrade::MinimalSteps "true";'
    } >> "$config_file" || error_exit "Failed to configure automatic updates"
    
    # Enable automatic updates
    if ! dpkg-reconfigure -plow unattended-upgrades; then
        error_exit "Failed to enable automatic updates"
    fi
    
    echo "Automatic security updates configured successfully"
}

configure_auto_updates

# Configure SSH security with comprehensive error handling
configure_ssh_security() {
    echo "Configuring SSH security..."
    
    local ssh_config="/etc/ssh/sshd_config"
    local backup_file="$BACKUP_DIR/sshd_config.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Backup SSH config
    if ! cp "$ssh_config" "$backup_file"; then
        error_exit "Failed to backup SSH configuration"
    fi
    
    echo "SSH config backed up to: $backup_file"
    
    # Create temporary config for testing
    local temp_config="/tmp/server-hardening-sshd_config"
    cp "$ssh_config" "$temp_config" || error_exit "Failed to create temporary SSH config"
    
    # Apply SSH security settings
    {
        sed -i 's/#\?PermitRootLogin.*/PermitRootLogin no/' "$temp_config"
        sed -i 's/#\?PasswordAuthentication.*/PasswordAuthentication no/' "$temp_config"
        sed -i 's/#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' "$temp_config"
        sed -i 's/#\?Port.*/Port 2222/' "$temp_config"
        sed -i 's/#\?Protocol.*/Protocol 2/' "$temp_config"
        sed -i 's/#\?MaxAuthTries.*/MaxAuthTries 3/' "$temp_config"
        sed -i 's/#\?ClientAliveInterval.*/ClientAliveInterval 300/' "$temp_config"
        sed -i 's/#\?ClientAliveCountMax.*/ClientAliveCountMax 2/' "$temp_config"
    } || error_exit "Failed to modify SSH configuration"
    
    # Validate SSH config
    if ! sshd -t -f "$temp_config"; then
        error_exit "SSH configuration validation failed. Backup preserved at: $backup_file"
    fi
    
    # Apply the configuration
    if ! cp "$temp_config" "$ssh_config"; then
        error_exit "Failed to apply SSH configuration"
    fi
    
    # Restart SSH service with validation
    echo "Restarting SSH service..."
    if ! systemctl restart ssh; then
        echo "SSH restart failed, restoring backup..." >&2
        cp "$backup_file" "$ssh_config" || error_exit "Failed to restore SSH backup"
        systemctl restart ssh || error_exit "Failed to restore SSH service"
        error_exit "SSH configuration failed and was restored"
    fi
    
    # Verify SSH is running
    if ! systemctl is-active --quiet ssh; then
        error_exit "SSH service is not running after restart"
    fi
    
    echo "SSH security configured successfully"
    echo "WARNING: SSH is now on port 2222. Update your firewall and connection settings."
}

configure_ssh_security

# Configure fail2ban
echo "Configuring fail2ban..."
if ! cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local; then
    echo "Failed to configure fail2ban" >&2
    exit 1
fi

# Enable and start fail2ban
if ! systemctl enable fail2ban && systemctl start fail2ban; then
    echo "Failed to start fail2ban" >&2
    exit 1
fi

# Set kernel parameters for security
echo 'net.ipv4.conf.default.rp_filter=1' >> /etc/sysctl.conf
echo 'net.ipv4.conf.all.rp_filter=1' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_syncookies=1' >> /etc/sysctl.conf
echo 'net.ipv4.conf.all.accept_redirects=0' >> /etc/sysctl.conf
echo 'net.ipv6.conf.all.accept_redirects=0' >> /etc/sysctl.conf
echo 'net.ipv4.conf.all.send_redirects=0' >> /etc/sysctl.conf
echo 'net.ipv4.conf.all.accept_source_route=0' >> /etc/sysctl.conf
echo 'net.ipv6.conf.all.accept_source_route=0' >> /etc/sysctl.conf

if ! sysctl -p; then
    echo "Failed to apply kernel parameters" >&2
    exit 1
fi

# Verify critical services with detailed status
verify_services() {
    echo "Verifying critical services..."
    
    local services=("ssh" "fail2ban" "ufw")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            echo "✓ $service is running"
        else
            echo "✗ $service is not running" >&2
            failed_services+=("$service")
        fi
        
        # Show service status
        systemctl status "$service" --no-pager --lines=3 || true
    done
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        echo "WARNING: The following services are not running: ${failed_services[*]}" >&2
        echo "Manual intervention may be required." >&2
    fi
}

# Final system verification
final_verification() {
    echo "Performing final system verification..."
    
    # Check if firewall is enabled
    if ufw status | grep -q "Status: active"; then
        echo "✓ UFW firewall is active"
    else
        echo "⚠ UFW firewall is not active" >&2
    fi
    
    # Check fail2ban status
    if fail2ban-client status >/dev/null 2>&1; then
        echo "✓ Fail2ban is operational"
    else
        echo "⚠ Fail2ban may not be working properly" >&2
    fi
    
    # Check SSH configuration
    if sshd -t; then
        echo "✓ SSH configuration is valid"
    else
        echo "✗ SSH configuration has issues" >&2
    fi
}

verify_services
final_verification

echo "==========================================="
echo "Server hardening completed successfully!"
echo "Completion time: $(date)"
echo "Log file: $LOG_FILE"
echo "Backup directory: $BACKUP_DIR"
echo "==========================================="
echo "IMPORTANT NOTES:"
echo "1. SSH is now on port 2222"
echo "2. Root login is disabled"
echo "3. Password authentication is disabled"
echo "4. Reboot is recommended to ensure all changes take effect"
echo "5. Update your firewall rules for the new SSH port"
echo "==========================================="