#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 8: Entry Host Provisioning Script (Ubuntu VM)
# Provisions the SSRF-vulnerable entry point web service.
# ==============================================================================

set -euo pipefail

echo "[*] Provisioning Stage 8 Entry Host on Ubuntu..."

# 1. Install prerequisites
apt-get update -y
apt-get install -y python3 python3-pip python3-flask python3-requests curl jq

# 2. Deploy app files
APP_DIR="/opt/shadownet/stage8/entry-host"
mkdir -p "${APP_DIR}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cp -r "${SCRIPT_DIR}/app.py" "${APP_DIR}/"
cp -r "${SCRIPT_DIR}/templates" "${APP_DIR}/"
if [ -f "${SCRIPT_DIR}/requirements.txt" ]; then
    cp "${SCRIPT_DIR}/requirements.txt" "${APP_DIR}/"
fi

# 3. Create systemd service
cat << 'EOF' > /etc/systemd/system/stage8-entry.service
[Unit]
Description=ShadowNet Stage 8 Entry Host Web Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/shadownet/stage8/entry-host
ExecStart=/usr/bin/python3 /opt/shadownet/stage8/entry-host/app.py
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable stage8-entry.service
systemctl restart stage8-entry.service

echo "[+] Stage 8 Entry Host service running on port 3000!"
curl -s http://127.0.0.1:3000/ | grep -q "NexaCorp" && echo "[+] Verified: Entry Host responding correctly."

