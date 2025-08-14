#!/bin/bash
# Encrypted Backup Script

BACKUP_DIR="/var/backups/household-planet"
DB_NAME="household_planet"
ENCRYPTION_KEY_FILE="/etc/backup-encryption.key"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate encryption key if it doesn't exist
if [ ! -f $ENCRYPTION_KEY_FILE ]; then
    openssl rand -base64 32 > $ENCRYPTION_KEY_FILE
    chmod 600 $ENCRYPTION_KEY_FILE
    echo "Encryption key generated at $ENCRYPTION_KEY_FILE"
fi

# Database backup function
backup_database() {
    echo "Creating database backup..."
    
    # SQLite backup (adjust for your database)
    if [ -f "./prisma/dev.db" ]; then
        sqlite3 ./prisma/dev.db ".backup /tmp/db_backup_$DATE.db"
        
        # Encrypt database backup
        openssl enc -aes-256-cbc -salt -in /tmp/db_backup_$DATE.db \
            -out $BACKUP_DIR/db_backup_$DATE.db.enc \
            -pass file:$ENCRYPTION_KEY_FILE
        
        # Remove unencrypted backup
        rm /tmp/db_backup_$DATE.db
        
        echo "Database backup encrypted and saved to $BACKUP_DIR/db_backup_$DATE.db.enc"
    fi
}

# Application files backup function
backup_application() {
    echo "Creating application backup..."
    
    # Create tar archive of application
    tar -czf /tmp/app_backup_$DATE.tar.gz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='uploads' \
        --exclude='.env' \
        ./
    
    # Encrypt application backup
    openssl enc -aes-256-cbc -salt -in /tmp/app_backup_$DATE.tar.gz \
        -out $BACKUP_DIR/app_backup_$DATE.tar.gz.enc \
        -pass file:$ENCRYPTION_KEY_FILE
    
    # Remove unencrypted backup
    rm /tmp/app_backup_$DATE.tar.gz
    
    echo "Application backup encrypted and saved to $BACKUP_DIR/app_backup_$DATE.tar.gz.enc"
}

# Configuration backup function
backup_configs() {
    echo "Creating configuration backup..."
    
    # Backup important configuration files
    tar -czf /tmp/config_backup_$DATE.tar.gz \
        /etc/nginx/ \
        /etc/ssl/ \
        /etc/fail2ban/ \
        /etc/ufw/ \
        2>/dev/null
    
    # Encrypt configuration backup
    openssl enc -aes-256-cbc -salt -in /tmp/config_backup_$DATE.tar.gz \
        -out $BACKUP_DIR/config_backup_$DATE.tar.gz.enc \
        -pass file:$ENCRYPTION_KEY_FILE
    
    # Remove unencrypted backup
    rm /tmp/config_backup_$DATE.tar.gz
    
    echo "Configuration backup encrypted and saved to $BACKUP_DIR/config_backup_$DATE.tar.gz.enc"
}

# Cleanup old backups (keep last 7 days)
cleanup_old_backups() {
    echo "Cleaning up old backups..."
    find $BACKUP_DIR -name "*.enc" -mtime +7 -delete
    echo "Old backups cleaned up"
}

# Verify backup integrity
verify_backup() {
    echo "Verifying backup integrity..."
    
    # Test decryption of latest database backup
    LATEST_DB_BACKUP=$(ls -t $BACKUP_DIR/db_backup_*.enc 2>/dev/null | head -1)
    if [ -n "$LATEST_DB_BACKUP" ]; then
        openssl enc -aes-256-cbc -d -in "$LATEST_DB_BACKUP" \
            -pass file:$ENCRYPTION_KEY_FILE > /tmp/test_decrypt 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "Backup verification successful"
            rm /tmp/test_decrypt
        else
            echo "ERROR: Backup verification failed!"
            exit 1
        fi
    fi
}

# Main execution
echo "Starting encrypted backup process..."

backup_database
backup_application
backup_configs
cleanup_old_backups
verify_backup

echo "Encrypted backup process completed successfully"

# Log backup completion
echo "$(date): Encrypted backup completed" >> /var/log/backup.log