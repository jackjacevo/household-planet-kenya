#!/bin/bash
# Server hardening script for Household Planet Kenya

# System updates
apt update && apt upgrade -y

# Remove unnecessary packages
apt autoremove -y

# SSH hardening
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Install fail2ban
apt install fail2ban -y
systemctl enable fail2ban

# Set up automatic security updates
apt install unattended-upgrades -y
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# File permissions
chmod 600 /etc/ssh/sshd_config
chmod 644 /etc/passwd
chmod 600 /etc/shadow

# Disable unused services
systemctl disable bluetooth
systemctl disable cups

echo "Server hardening completed"