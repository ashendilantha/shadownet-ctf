#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 7: Linux Privilege Escalation Setup
# ==============================================================================

set -euo pipefail

echo "[*] Setting up NexaCorp Bastion Host Privilege Escalation Vector..."

FLAG="SHADOWNET{linux_a8eafa5848a204be0958d232f9e83ed9}"

# 1. Create unprivileged player user
if ! id -u player >/dev/null 2>&1; then
    useradd -m -s /bin/bash player
fi
echo "player:password123" | chpasswd

# 2. Write Root Flag
mkdir -p /root
echo "${FLAG}" > /root/flag.txt
chmod 600 /root/flag.txt
chown root:root /root/flag.txt

# 3. Create Vulnerable SUID Maintenance Binary
cat > /tmp/nexa_maintenance.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    // Drop setuid protection and execute system utility with elevated privileges
    setuid(0);
    setgid(0);
    printf("=== NexaCorp Core Infrastructure System Maintenance Utility ===\n");
    printf("[*] Synchronizing system disk metrics...\n");
    // INTENTIONAL VULNERABILITY: Relative PATH call without absolute path
    system("df -h");
    return 0;
}
EOF

gcc -o /usr/local/bin/nexa-backup /tmp/nexa_maintenance.c 2>/dev/null || true
if [ -f /usr/local/bin/nexa-backup ]; then
    chmod 4755 /usr/local/bin/nexa-backup
    chown root:root /usr/local/bin/nexa-backup
    rm -f /tmp/nexa_maintenance.c
fi

echo "[+] Stage 7 vectors configured."
echo "    • Player SSH User: player"
echo "    • Player Password: password123"
echo "    • SUID Binary:     /usr/local/bin/nexa-backup"
echo "    • Root Flag:       /root/flag.txt"

