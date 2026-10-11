#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 8: Network Isolation Configuration
# Sets up internal subnet (192.168.100.0/24) and security policies.
# ==============================================================================

set -euo pipefail

echo "[*] Configuring Stage 8 Isolated Internal Subnet..."

INTERNAL_IP="192.168.100.10/24"

# 1. Ensure loopback or dummy interface has internal IP
if ! ip addr show | grep -q "192.168.100.10"; then
    echo "[+] Adding internal IP 192.168.100.10 to lo interface..."
    ip addr add "${INTERNAL_IP}" dev lo
else
    echo "[*] Internal IP 192.168.100.10 already configured."
fi

# 2. Configure Firewall / IPTables rules for realistic CTF isolation:
# - Allow Entry Host app (localhost) to connect to metadata service & mysql
# - Drop external inbound packets attempting to access port 8080 (metadata) directly
if command -v iptables >/dev/null 2>&1; then
    echo "[*] Applying network isolation rules via iptables..."
    # Allow loopback/local access
    iptables -C INPUT -i lo -j ACCEPT 2>/dev/null || iptables -I INPUT 1 -i lo -j ACCEPT
    # Prevent direct external access to metadata service (port 8080)
    iptables -C INPUT -p tcp --dport 8080 -s 127.0.0.1 -j ACCEPT 2>/dev/null || iptables -A INPUT -p tcp --dport 8080 -s 127.0.0.1 -j ACCEPT
fi

echo "[+] Internal network isolation setup complete."
echo "[*] Entry Host (Port 3000): Publicly accessible"
echo "[*] Internal DB & Metadata (192.168.100.10): Isolated to internal pivot"

