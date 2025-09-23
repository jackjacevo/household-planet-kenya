#!/bin/bash

# Setup automated database backups with cron
# Run this script once to configure automatic backups

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-system.sh"

echo "🔧 Setting up automated database backups..."

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-system.sh"; then
    echo "⚠️  Backup cron job already exists"
    crontab -l 2>/dev/null | grep "backup-system.sh"
else
    # Add cron job for daily backups at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT >> /var/log/backup.log 2>&1") | crontab -
    echo "✅ Added daily backup cron job (2 AM)"
fi

# Create backup directory
mkdir -p /app/backups

echo "🎉 Backup system setup complete!"
echo "📅 Daily backups will run at 2:00 AM"
echo "📂 Backups stored in: /app/backups"
echo "📋 Backup logs in: /var/log/backup.log"
echo ""
echo "To run manual backup: $BACKUP_SCRIPT"
echo "To view cron jobs: crontab -l"
echo "To view backup logs: tail -f /var/log/backup.log"