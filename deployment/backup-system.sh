#!/bin/bash

# Database Backup System for Household Planet Kenya
# This script should be run as a cron job for automated backups

set -e

# Configuration
DB_NAME="household_planet"
DB_USER="household_user"
DB_HOST="postgres"
BACKUP_DIR="/app/backups"
MAX_BACKUPS=30  # Keep 30 days of backups

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/household_planet_$TIMESTAMP.sql"

echo "🚀 Starting database backup at $(date)"

# Create database backup
if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
    echo "✅ Database backup created successfully: $BACKUP_FILE"

    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup compressed: ${BACKUP_FILE}.gz"

    # Remove old backups (keep only last MAX_BACKUPS)
    find "$BACKUP_DIR" -name "household_planet_*.sql.gz" -type f | sort -r | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
    echo "🧹 Cleaned up old backups (keeping $MAX_BACKUPS newest)"

    # Display backup info
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"

    echo "🎉 Backup completed successfully at $(date)"
else
    echo "❌ Database backup failed at $(date)" >&2
    exit 1
fi