#!/bin/bash

# Database Restore Script for Household Planet Kenya
# Usage: ./restore-backup.sh <backup_file>

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup_file>"
    echo "Example: $0 /app/backups/household_planet_20241201_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="household_planet"
DB_USER="household_user"
DB_HOST="postgres"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will completely replace the current database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "🚀 Starting database restore at $(date)"

# Create a temporary file for decompression if needed
TEMP_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
    TEMP_FILE=$(mktemp)
    echo "📦 Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Drop and recreate database
echo "🗑️  Dropping existing database..."
dropdb -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" || true

echo "🏗️  Creating new database..."
createdb -h "$DB_HOST" -U "$DB_USER" "$DB_NAME"

# Restore backup
echo "📥 Restoring database from backup..."
if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"; then
    echo "✅ Database restored successfully"
else
    echo "❌ Database restore failed" >&2
    exit 1
fi

# Cleanup temporary file
if [ -n "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

echo "🎉 Database restore completed successfully at $(date)"
echo "🔄 Remember to restart your application services"