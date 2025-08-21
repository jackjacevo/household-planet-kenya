#!/bin/bash
# Encrypted backup script for Household Planet Kenya

BACKUP_DIR="/var/backups/household-planet"
ENCRYPTION_KEY="/etc/backup-keys/backup.key"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup with encryption
pg_dump household_planet | gpg --cipher-algo AES256 --compress-algo 1 --symmetric --output $BACKUP_DIR/db_$DATE.sql.gpg

# Application files backup
tar -czf - /opt/household-planet | gpg --cipher-algo AES256 --compress-algo 1 --symmetric --output $BACKUP_DIR/app_$DATE.tar.gz.gpg

# Upload to secure storage (AWS S3 with encryption)
aws s3 cp $BACKUP_DIR/ s3://household-planet-backups/ --recursive --sse AES256

# Cleanup old local backups (keep 7 days)
find $BACKUP_DIR -name "*.gpg" -mtime +7 -delete

echo "Encrypted backup completed: $DATE"