#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 8: Database Host Provisioning Script (Ubuntu VM)
# Provisions internal MySQL database and cloud metadata service.
# ==============================================================================

set -euo pipefail

echo "[*] Provisioning Stage 8 DB Host & Metadata Service on Ubuntu..."

# 1. Install prerequisites (MySQL/MariaDB & Python)
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y mariadb-server python3 python3-flask curl jq

# 2. Configure MySQL to listen across network
sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf 2>/dev/null || true
sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null || true

systemctl enable mariadb || systemctl enable mysql
systemctl restart mariadb || systemctl restart mysql

# 3. Initialize MySQL Database and Flag Table
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/init_mysql.sql"

if [ -f "${SQL_FILE}" ]; then
    echo "[*] Loading Stage 8 database schema and flag..."
    mysql -u root < "${SQL_FILE}"
else
    echo "[-] Warning: ${SQL_FILE} not found, generating schema..."
    mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS nexacorp;
USE nexacorp;
CREATE TABLE IF NOT EXISTS flags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challenge VARCHAR(100) UNIQUE,
    flag VARCHAR(200)
);
INSERT INTO flags (challenge, flag) VALUES ('final_breach', 'SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}');
CREATE USER IF NOT EXISTS 'db_user'@'%' IDENTIFIED BY 'SecurePass123';
GRANT SELECT ON nexacorp.* TO 'db_user'@'%';
FLUSH PRIVILEGES;
EOF
fi

# 4. Deploy Metadata Service
APP_DIR="/opt/shadownet/stage8/db-host"
mkdir -p "${APP_DIR}"
cp -r "${SCRIPT_DIR}/metadata_service.py" "${APP_DIR}/"

cat << 'EOF' > /etc/systemd/system/stage8-metadata.service
[Unit]
Description=ShadowNet Stage 8 Internal Cloud Metadata Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/shadownet/stage8/db-host
ExecStart=/usr/bin/python3 /opt/shadownet/stage8/db-host/metadata_service.py
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable stage8-metadata.service
systemctl restart stage8-metadata.service

echo "[+] Stage 8 DB Host & Metadata Service successfully initialized!"

