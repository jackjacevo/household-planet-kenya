#!/bin/bash
# Security Monitoring Setup

# Install monitoring tools
apt install -y auditd aide tripwire logwatch

# Configure auditd for security monitoring
cat > /etc/audit/rules.d/audit.rules << 'EOF'
# Delete all existing rules
-D

# Buffer size
-b 8192

# Failure mode (0=silent, 1=printk, 2=panic)
-f 1

# Monitor authentication events
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k identity

# Monitor login/logout events
-w /var/log/lastlog -p wa -k logins
-w /var/run/faillock -p wa -k logins

# Monitor network configuration
-w /etc/network/ -p wa -k network
-w /etc/hosts -p wa -k network
-w /etc/hostname -p wa -k network

# Monitor system calls
-a always,exit -F arch=b64 -S adjtimex -S settimeofday -k time-change
-a always,exit -F arch=b32 -S adjtimex -S settimeofday -S stime -k time-change
-a always,exit -F arch=b64 -S clock_settime -k time-change
-a always,exit -F arch=b32 -S clock_settime -k time-change

# Monitor file access
-a always,exit -F arch=b64 -S chmod -S fchmod -S fchmodat -F auid>=1000 -F auid!=4294967295 -k perm_mod
-a always,exit -F arch=b32 -S chmod -S fchmod -S fchmodat -F auid>=1000 -F auid!=4294967295 -k perm_mod

# Enable audit
-e 1
EOF

# Start auditd
systemctl enable auditd
systemctl start auditd

# Configure AIDE (Advanced Intrusion Detection Environment)
aide --init
mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Create monitoring script
cat > /usr/local/bin/security-monitor.sh << 'EOF'
#!/bin/bash
# Security monitoring script

LOG_FILE="/var/log/security-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check for failed login attempts
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | tail -10 | wc -l)
if [ $FAILED_LOGINS -gt 5 ]; then
    echo "[$DATE] WARNING: $FAILED_LOGINS failed login attempts detected" >> $LOG_FILE
fi

# Check for root login attempts
ROOT_LOGINS=$(grep "root" /var/log/auth.log | grep "$(date '+%b %d')" | wc -l)
if [ $ROOT_LOGINS -gt 0 ]; then
    echo "[$DATE] ALERT: Root login attempts detected" >> $LOG_FILE
fi

# Check disk usage
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Disk usage is $DISK_USAGE%" >> $LOG_FILE
fi

# Check for suspicious processes
ps aux | grep -E "(nc|netcat|nmap|tcpdump)" | grep -v grep > /tmp/suspicious_processes
if [ -s /tmp/suspicious_processes ]; then
    echo "[$DATE] WARNING: Suspicious processes detected" >> $LOG_FILE
    cat /tmp/suspicious_processes >> $LOG_FILE
fi

# Check network connections
netstat -tuln | grep LISTEN | grep -v "127.0.0.1\|::1" > /tmp/open_ports
OPEN_PORTS=$(wc -l < /tmp/open_ports)
if [ $OPEN_PORTS -gt 10 ]; then
    echo "[$DATE] INFO: $OPEN_PORTS ports are listening" >> $LOG_FILE
fi
EOF

chmod +x /usr/local/bin/security-monitor.sh

# Add to crontab for regular monitoring
(crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/security-monitor.sh") | crontab -

echo "Security monitoring setup completed"