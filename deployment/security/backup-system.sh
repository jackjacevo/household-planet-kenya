#!/bin/bash

# Automated Backup System
set -e

BACKUP_DIR="/var/backups/household-planet"
DB_NAME="household_planet"
RETENTION_DAYS=30

echo "📦 Starting automated backup..."

# Create backup directory
mkdir -p $BACKUP_DIR/{database,files,config}

# Database backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump $DB_NAME | gzip > $BACKUP_DIR/database/db_backup_$TIMESTAMP.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files/files_backup_$TIMESTAMP.tar.gz /app/uploads

# Configuration backup
cp -r /app/config $BACKUP_DIR/config/config_backup_$TIMESTAMP

# Upload to cloud storage (AWS S3)
aws s3 sync $BACKUP_DIR s3://household-planet-backups/$(date +%Y/%m/%d)/

# Cleanup old backups
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed successfully"