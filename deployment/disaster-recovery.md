# Disaster Recovery Procedures

## Recovery Time Objectives (RTO)
- **Critical Services**: 15 minutes
- **Database**: 30 minutes
- **Full System**: 1 hour

## Recovery Point Objectives (RPO)
- **Database**: 1 hour (hourly backups)
- **Files**: 24 hours (daily backups)
- **Configuration**: 24 hours

## Backup Locations
- **Primary**: AWS S3 (us-east-1)
- **Secondary**: AWS S3 (eu-west-1)
- **Local**: Server local storage (24h retention)

## Recovery Procedures

### Database Recovery
```bash
# Stop application
docker-compose down

# Restore from backup
gunzip -c /backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | psql household_planet

# Restart services
docker-compose up -d
```

### Full System Recovery
```bash
# Deploy infrastructure
terraform apply

# Restore database
./restore-database.sh

# Restore files
tar -xzf files_backup_YYYYMMDD_HHMMSS.tar.gz -C /app/

# Deploy application
./deploy.sh
```

### DNS Failover
```bash
# Update DNS to backup server
curl -X PUT "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records/RECORD_ID" \
  -H "Authorization: Bearer API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"content":"BACKUP_SERVER_IP"}'
```

## Emergency Contacts
- **Primary Admin**: +254700000000
- **Secondary Admin**: +254700000001
- **Hosting Provider**: support@provider.com
- **DNS Provider**: support@cloudflare.com