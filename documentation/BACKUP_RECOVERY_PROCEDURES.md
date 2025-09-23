# Backup and Recovery Procedures - Household Planet Kenya

## Overview

This document outlines comprehensive backup and recovery procedures to ensure business continuity and data protection for Household Planet Kenya's e-commerce platform.

### Recovery Objectives
- **RTO (Recovery Time Objective)**: 4 hours maximum downtime
- **RPO (Recovery Point Objective)**: 1 hour maximum data loss
- **Availability Target**: 99.9% uptime
- **Data Integrity**: 100% data consistency

---

## Backup Strategy

### Backup Types

**Full Backup**
- Complete system and data backup
- Frequency: Weekly (Sunday 2:00 AM EAT)
- Retention: 4 weeks
- Storage: Primary and secondary locations

**Incremental Backup**
- Changes since last backup
- Frequency: Daily (2:00 AM EAT)
- Retention: 30 days
- Storage: Primary location with cloud sync

**Transaction Log Backup**
- Database transaction logs
- Frequency: Every 15 minutes
- Retention: 7 days
- Storage: High-speed storage

### Backup Components

**Database Backups**
- PostgreSQL database
- User data, orders, products, transactions
- Configuration and schema
- Stored procedures and functions

**Application Backups**
- Source code repositories
- Configuration files
- Environment variables (encrypted)
- SSL certificates

**File System Backups**
- Uploaded images and documents
- Log files
- System configurations
- Application data

**Infrastructure Backups**
- Server configurations
- Network settings
- Security configurations
- Monitoring configurations

---

## Backup Implementation

### Database Backup Scripts

**Full Database Backup:**
```bash
#!/bin/bash
# full-db-backup.sh

# Configuration
DB_NAME="household_planet"
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/full_backup_$DATE.sql.gz

# Verify backup
if [ $? -eq 0 ]; then
    echo "✅ Database backup completed: full_backup_$DATE.sql.gz"
    
    # Upload to cloud storage
    aws s3 cp $BACKUP_DIR/full_backup_$DATE.sql.gz s3://household-planet-backups/database/
    
    # Clean old backups
    find $BACKUP_DIR -name "full_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Log success
    echo "$(date): Full backup completed successfully" >> /var/log/backup.log
else
    echo "❌ Database backup failed"
    echo "$(date): Full backup failed" >> /var/log/backup.log
    
    # Send alert
    curl -X POST $SLACK_WEBHOOK_URL -H 'Content-type: application/json' \
         --data '{"text":"🚨 Database backup failed on $(hostname)"}'
fi
```

**Incremental Backup:**
```bash
#!/bin/bash
# incremental-backup.sh

BACKUP_DIR="/backups/incremental"
DATE=$(date +%Y%m%d_%H%M%S)
LAST_BACKUP_FILE="/var/log/last_backup_timestamp"

# Get last backup timestamp
if [ -f $LAST_BACKUP_FILE ]; then
    LAST_BACKUP=$(cat $LAST_BACKUP_FILE)
else
    LAST_BACKUP="1970-01-01 00:00:00"
fi

# Create incremental backup
pg_dump $DATABASE_URL \
    --where="updated_at > '$LAST_BACKUP'" \
    --data-only | gzip > $BACKUP_DIR/incremental_$DATE.sql.gz

# Update timestamp
echo "$(date '+%Y-%m-%d %H:%M:%S')" > $LAST_BACKUP_FILE

# Upload to cloud
aws s3 cp $BACKUP_DIR/incremental_$DATE.sql.gz s3://household-planet-backups/incremental/
```

### File System Backup

**Application Files Backup:**
```bash
#!/bin/bash
# file-backup.sh

BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DIRS=("/app/uploads" "/app/config" "/var/log/app")

mkdir -p $BACKUP_DIR

# Create tar archive
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz "${SOURCE_DIRS[@]}"

# Verify archive
if tar -tzf $BACKUP_DIR/files_backup_$DATE.tar.gz > /dev/null; then
    echo "✅ File backup completed: files_backup_$DATE.tar.gz"
    
    # Upload to cloud
    aws s3 cp $BACKUP_DIR/files_backup_$DATE.tar.gz s3://household-planet-backups/files/
    
    # Clean old backups
    find $BACKUP_DIR -name "files_backup_*.tar.gz" -mtime +7 -delete
else
    echo "❌ File backup verification failed"
    exit 1
fi
```

### Configuration Backup

**System Configuration:**
```bash
#!/bin/bash
# config-backup.sh

CONFIG_DIR="/backups/config"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $CONFIG_DIR

# Backup configurations
cp -r /etc/nginx $CONFIG_DIR/nginx_$DATE
cp -r /app/.env* $CONFIG_DIR/env_$DATE
cp /etc/ssl/certs/* $CONFIG_DIR/ssl_$DATE/

# Create archive
tar -czf $CONFIG_DIR/config_backup_$DATE.tar.gz $CONFIG_DIR/*_$DATE

# Upload to cloud
aws s3 cp $CONFIG_DIR/config_backup_$DATE.tar.gz s3://household-planet-backups/config/

# Cleanup temporary files
rm -rf $CONFIG_DIR/*_$DATE
```

---

## Backup Scheduling

### Cron Jobs Configuration

```bash
# Edit crontab
crontab -e

# Add backup schedules
# Full database backup - Weekly Sunday 2:00 AM
0 2 * * 0 /scripts/full-db-backup.sh

# Incremental database backup - Daily 2:00 AM
0 2 * * 1-6 /scripts/incremental-backup.sh

# Transaction log backup - Every 15 minutes
*/15 * * * * /scripts/transaction-log-backup.sh

# File system backup - Daily 3:00 AM
0 3 * * * /scripts/file-backup.sh

# Configuration backup - Weekly Sunday 4:00 AM
0 4 * * 0 /scripts/config-backup.sh

# Backup verification - Daily 5:00 AM
0 5 * * * /scripts/verify-backups.sh
```

### Backup Monitoring

**Backup Verification Script:**
```bash
#!/bin/bash
# verify-backups.sh

BACKUP_DIR="/backups"
LOG_FILE="/var/log/backup-verification.log"
DATE=$(date)

echo "=== Backup Verification - $DATE ===" >> $LOG_FILE

# Verify database backup
LATEST_DB_BACKUP=$(ls -t $BACKUP_DIR/database/*.sql.gz | head -1)
if [ -f "$LATEST_DB_BACKUP" ]; then
    # Test backup integrity
    gunzip -t "$LATEST_DB_BACKUP"
    if [ $? -eq 0 ]; then
        echo "✅ Database backup verified: $LATEST_DB_BACKUP" >> $LOG_FILE
    else
        echo "❌ Database backup corrupted: $LATEST_DB_BACKUP" >> $LOG_FILE
        # Send alert
        curl -X POST $SLACK_WEBHOOK_URL -H 'Content-type: application/json' \
             --data '{"text":"🚨 Corrupted database backup detected"}'
    fi
else
    echo "❌ No database backup found" >> $LOG_FILE
fi

# Verify file backup
LATEST_FILE_BACKUP=$(ls -t $BACKUP_DIR/files/*.tar.gz | head -1)
if [ -f "$LATEST_FILE_BACKUP" ]; then
    tar -tzf "$LATEST_FILE_BACKUP" > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ File backup verified: $LATEST_FILE_BACKUP" >> $LOG_FILE
    else
        echo "❌ File backup corrupted: $LATEST_FILE_BACKUP" >> $LOG_FILE
    fi
else
    echo "❌ No file backup found" >> $LOG_FILE
fi

# Check backup age
BACKUP_AGE=$(find $BACKUP_DIR -name "*.gz" -mtime -1 | wc -l)
if [ $BACKUP_AGE -eq 0 ]; then
    echo "⚠️ No recent backups found (last 24 hours)" >> $LOG_FILE
    # Send alert
    curl -X POST $SLACK_WEBHOOK_URL -H 'Content-type: application/json' \
         --data '{"text":"⚠️ No recent backups found for Household Planet"}'
fi
```

---

## Recovery Procedures

### Database Recovery

**Complete Database Restore:**
```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1
TEMP_DB="household_planet_restore_temp"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "🔄 Starting database restore from $BACKUP_FILE"

# Create temporary database
createdb $TEMP_DB

# Restore to temporary database
gunzip -c $BACKUP_FILE | psql $TEMP_DB

if [ $? -eq 0 ]; then
    echo "✅ Backup restored to temporary database"
    
    # Verify data integrity
    RECORD_COUNT=$(psql $TEMP_DB -t -c "SELECT COUNT(*) FROM users;")
    echo "📊 Restored records: $RECORD_COUNT users"
    
    # Confirm restore
    read -p "Proceed with production restore? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" = "yes" ]; then
        # Stop application
        systemctl stop household-planet-backend
        
        # Backup current database
        pg_dump $DATABASE_URL | gzip > /backups/pre-restore-backup-$(date +%Y%m%d_%H%M%S).sql.gz
        
        # Drop and recreate production database
        dropdb household_planet
        createdb household_planet
        
        # Restore from temporary database
        pg_dump $TEMP_DB | psql household_planet
        
        # Start application
        systemctl start household-planet-backend
        
        echo "✅ Database restore completed"
    else
        echo "❌ Restore cancelled"
    fi
    
    # Cleanup temporary database
    dropdb $TEMP_DB
else
    echo "❌ Restore failed"
    dropdb $TEMP_DB
    exit 1
fi
```

**Point-in-Time Recovery:**
```bash
#!/bin/bash
# point-in-time-recovery.sh

TARGET_TIME=$1
BASE_BACKUP=$2

if [ -z "$TARGET_TIME" ] || [ -z "$BASE_BACKUP" ]; then
    echo "Usage: $0 <target_time> <base_backup>"
    echo "Example: $0 '2024-01-01 14:30:00' /backups/full_backup_20240101.sql.gz"
    exit 1
fi

echo "🔄 Starting point-in-time recovery to $TARGET_TIME"

# Stop application
systemctl stop household-planet-backend

# Restore base backup
gunzip -c $BASE_BACKUP | psql household_planet_recovery

# Apply transaction logs up to target time
for LOG_FILE in /backups/transaction-logs/*.sql; do
    LOG_TIME=$(basename $LOG_FILE | cut -d'_' -f3 | cut -d'.' -f1)
    
    if [[ "$LOG_TIME" < "$TARGET_TIME" ]]; then
        echo "Applying log: $LOG_FILE"
        psql household_planet_recovery < $LOG_FILE
    fi
done

echo "✅ Point-in-time recovery completed"
```

### File System Recovery

**Application Files Restore:**
```bash
#!/bin/bash
# restore-files.sh

BACKUP_FILE=$1
RESTORE_DIR="/app"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "🔄 Starting file restore from $BACKUP_FILE"

# Create backup of current files
tar -czf /tmp/current-files-backup-$(date +%Y%m%d_%H%M%S).tar.gz $RESTORE_DIR

# Stop application
systemctl stop household-planet-backend

# Extract backup
tar -xzf $BACKUP_FILE -C /

# Set proper permissions
chown -R app:app $RESTORE_DIR
chmod -R 755 $RESTORE_DIR

# Start application
systemctl start household-planet-backend

echo "✅ File restore completed"
```

### Configuration Recovery

**System Configuration Restore:**
```bash
#!/bin/bash
# restore-config.sh

CONFIG_BACKUP=$1

if [ -z "$CONFIG_BACKUP" ]; then
    echo "Usage: $0 <config_backup_file>"
    exit 1
fi

echo "🔄 Restoring system configuration"

# Backup current configuration
tar -czf /tmp/current-config-$(date +%Y%m%d_%H%M%S).tar.gz /etc/nginx /app/.env*

# Extract configuration backup
tar -xzf $CONFIG_BACKUP -C /tmp/

# Restore configurations
cp -r /tmp/nginx_* /etc/nginx/
cp /tmp/env_*/.env* /app/
cp /tmp/ssl_*/* /etc/ssl/certs/

# Restart services
systemctl restart nginx
systemctl restart household-planet-backend

echo "✅ Configuration restore completed"
```

---

## Disaster Recovery

### Disaster Recovery Plan

**Disaster Scenarios:**
1. **Hardware Failure**: Server or storage failure
2. **Data Center Outage**: Complete facility unavailability
3. **Cyber Attack**: Ransomware or data breach
4. **Natural Disaster**: Fire, flood, earthquake
5. **Human Error**: Accidental deletion or corruption

### Recovery Site Setup

**Primary Site (Production):**
- Location: Primary data center
- Infrastructure: Full production environment
- Data: Real-time data and transactions

**Secondary Site (DR):**
- Location: Different geographic region
- Infrastructure: Standby environment
- Data: Replicated data with minimal lag

**Recovery Site Activation:**
```bash
#!/bin/bash
# activate-dr-site.sh

echo "🚨 Activating Disaster Recovery Site"

# Update DNS to point to DR site
aws route53 change-resource-record-sets \
    --hosted-zone-id Z123456789 \
    --change-batch file://dns-failover.json

# Start DR services
docker-compose -f docker-compose.dr.yml up -d

# Verify services
curl -f https://dr.householdplanetkenya.co.ke/health

if [ $? -eq 0 ]; then
    echo "✅ DR site activated successfully"
    
    # Notify team
    curl -X POST $SLACK_WEBHOOK_URL -H 'Content-type: application/json' \
         --data '{"text":"🚨 DR site activated for Household Planet Kenya"}'
else
    echo "❌ DR site activation failed"
    exit 1
fi
```

### Data Replication

**Real-time Replication:**
```bash
#!/bin/bash
# setup-replication.sh

# Configure PostgreSQL streaming replication
echo "Setting up database replication..."

# On primary server
psql -c "CREATE USER replicator REPLICATION LOGIN CONNECTION LIMIT 1 ENCRYPTED PASSWORD 'replication_password';"

# Configure pg_hba.conf
echo "host replication replicator DR_SERVER_IP/32 md5" >> /etc/postgresql/13/main/pg_hba.conf

# Configure postgresql.conf
echo "wal_level = replica" >> /etc/postgresql/13/main/postgresql.conf
echo "max_wal_senders = 3" >> /etc/postgresql/13/main/postgresql.conf
echo "wal_keep_segments = 64" >> /etc/postgresql/13/main/postgresql.conf

# Restart PostgreSQL
systemctl restart postgresql

# On DR server
pg_basebackup -h PRIMARY_SERVER_IP -D /var/lib/postgresql/13/main -U replicator -v -P -W

echo "✅ Database replication configured"
```

### Recovery Testing

**Monthly DR Test:**
```bash
#!/bin/bash
# dr-test.sh

echo "🧪 Starting DR test - $(date)"

# Test database restore
TEST_DB="household_planet_test"
LATEST_BACKUP=$(ls -t /backups/database/*.sql.gz | head -1)

createdb $TEST_DB
gunzip -c $LATEST_BACKUP | psql $TEST_DB

# Verify data integrity
USER_COUNT=$(psql $TEST_DB -t -c "SELECT COUNT(*) FROM users;")
ORDER_COUNT=$(psql $TEST_DB -t -c "SELECT COUNT(*) FROM orders;")

echo "Test Results:"
echo "- Users: $USER_COUNT"
echo "- Orders: $ORDER_COUNT"

# Test file restore
mkdir -p /tmp/dr-test
tar -xzf $(ls -t /backups/files/*.tar.gz | head -1) -C /tmp/dr-test

# Test application startup
cd /tmp/dr-test/app
npm install --production
npm run build

if [ $? -eq 0 ]; then
    echo "✅ DR test passed"
else
    echo "❌ DR test failed"
fi

# Cleanup
dropdb $TEST_DB
rm -rf /tmp/dr-test

echo "🧪 DR test completed - $(date)"
```

---

## Backup Storage Management

### Storage Locations

**Primary Storage:**
- Location: Local server storage
- Type: High-speed SSD
- Capacity: 1TB
- Retention: 7 days

**Secondary Storage:**
- Location: AWS S3
- Type: Standard storage
- Capacity: Unlimited
- Retention: 90 days

**Archive Storage:**
- Location: AWS Glacier
- Type: Long-term archive
- Capacity: Unlimited
- Retention: 7 years

### Storage Lifecycle Management

**Automated Lifecycle:**
```json
{
  "Rules": [
    {
      "ID": "BackupLifecycle",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 2555,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

### Backup Encryption

**Encryption at Rest:**
```bash
#!/bin/bash
# encrypt-backup.sh

BACKUP_FILE=$1
ENCRYPTION_KEY="/etc/backup-encryption.key"

# Encrypt backup file
gpg --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
    --s2k-digest-algo SHA512 --s2k-count 65536 --force-mdc \
    --quiet --no-greeting --batch --yes \
    --passphrase-file $ENCRYPTION_KEY \
    --output $BACKUP_FILE.gpg \
    --symmetric $BACKUP_FILE

# Verify encryption
if [ -f "$BACKUP_FILE.gpg" ]; then
    echo "✅ Backup encrypted: $BACKUP_FILE.gpg"
    rm $BACKUP_FILE  # Remove unencrypted file
else
    echo "❌ Backup encryption failed"
    exit 1
fi
```

---

## Monitoring and Alerting

### Backup Monitoring Dashboard

**Key Metrics:**
- Backup success/failure rates
- Backup completion times
- Storage utilization
- Recovery test results
- RTO/RPO compliance

### Alert Configuration

**Backup Failure Alerts:**
```bash
# Slack notification function
send_alert() {
    local MESSAGE=$1
    local SEVERITY=$2
    
    case $SEVERITY in
        "critical")
            EMOJI="🚨"
            COLOR="danger"
            ;;
        "warning")
            EMOJI="⚠️"
            COLOR="warning"
            ;;
        *)
            EMOJI="ℹ️"
            COLOR="good"
            ;;
    esac
    
    curl -X POST $SLACK_WEBHOOK_URL \
         -H 'Content-type: application/json' \
         --data "{
             \"text\": \"$EMOJI $MESSAGE\",
             \"attachments\": [{
                 \"color\": \"$COLOR\",
                 \"fields\": [{
                     \"title\": \"Server\",
                     \"value\": \"$(hostname)\",
                     \"short\": true
                 }, {
                     \"title\": \"Time\",
                     \"value\": \"$(date)\",
                     \"short\": true
                 }]
             }]
         }"
}
```

### Backup Reports

**Weekly Backup Report:**
```bash
#!/bin/bash
# backup-report.sh

REPORT_FILE="/tmp/backup-report-$(date +%Y%m%d).txt"

echo "=== Weekly Backup Report ===" > $REPORT_FILE
echo "Report Date: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Backup statistics
echo "Backup Statistics:" >> $REPORT_FILE
echo "- Database backups: $(ls /backups/database/*.gz | wc -l)" >> $REPORT_FILE
echo "- File backups: $(ls /backups/files/*.gz | wc -l)" >> $REPORT_FILE
echo "- Config backups: $(ls /backups/config/*.gz | wc -l)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Storage usage
echo "Storage Usage:" >> $REPORT_FILE
du -sh /backups/* >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Recent failures
echo "Recent Failures:" >> $REPORT_FILE
grep "backup failed" /var/log/backup.log | tail -5 >> $REPORT_FILE

# Email report
mail -s "Weekly Backup Report" admin@householdplanetkenya.co.ke < $REPORT_FILE
```

---

## Compliance and Documentation

### Backup Compliance

**Regulatory Requirements:**
- **Data Protection**: GDPR compliance for EU customers
- **Financial Records**: 7-year retention for tax purposes
- **Audit Trail**: Complete backup and recovery logs
- **Business Continuity**: Documented recovery procedures

### Documentation Maintenance

**Required Documentation:**
- Backup and recovery procedures (this document)
- Recovery test results
- Incident response reports
- Change management records
- Compliance audit reports

**Review Schedule:**
- **Monthly**: Backup success rates and storage usage
- **Quarterly**: Recovery procedures and test results
- **Annually**: Complete backup strategy review
- **As needed**: After incidents or system changes

---

## Emergency Contacts

### Backup and Recovery Team

**Primary Contact:**
- Name: System Administrator
- Email: admin@householdplanetkenya.co.ke
- Phone: +254700000001
- Role: Backup operations and recovery

**Secondary Contact:**
- Name: Technical Lead
- Email: tech@householdplanetkenya.co.ke
- Phone: +254700000002
- Role: Technical escalation

**Management Contact:**
- Name: IT Manager
- Email: manager@householdplanetkenya.co.ke
- Phone: +254700000003
- Role: Business decisions and communication

### Vendor Contacts

**Cloud Storage (AWS):**
- Support: AWS Premium Support
- Phone: +1-206-266-4064
- Portal: https://console.aws.amazon.com/support/

**Database Support:**
- PostgreSQL Community
- Documentation: https://www.postgresql.org/docs/
- Forums: https://www.postgresql.org/list/

---

*This backup and recovery procedures document should be reviewed and updated quarterly to ensure accuracy and effectiveness.*