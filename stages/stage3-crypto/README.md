# Stage 3: Cryptographic Oracle Uplink

## Overview
- Category: Cryptography
- Target: Raw TCP Socket Encryption Oracle
- Port: 5000 (TCP)
- Difficulty: Medium
- Flag: `SHADOWNET{7h_0f_7h3_3ncrypt10n_1s_4w3s0m3}`

## Description
Stage 3 hosts a network daemon acting as an interactive cryptographic encryption oracle. When a client connects via TCP, the server announces an encrypted target token and invites arbitrary plaintext strings to encrypt.

The challenge is to analyze the behavior of the encryption service, identify the cipher and keying mechanism, determine the plaintext that maps to the target ciphertext, and submit it back to the oracle to unlock the flag.

## Files
- `oracle.py`: Python socket server running the encryption oracle on port 5000.
- `Dockerfile`: Container definition based on Python 3.11.
- `docker-compose.yml`: Compose specification mapping host port `5000:5000`.
- `requirements.txt`: Python package requirements.

## Running the Service

### Using Docker Compose
To start the container in the background:
```bash
docker compose -f stages/stage3-crypto/docker-compose.yml up -d
```

To stop the container:
```bash
docker compose -f stages/stage3-crypto/docker-compose.yml down
```

### Running Directly with Python
To run the daemon directly on the host:
```bash
python3 stages/stage3-crypto/oracle.py
```

To stop the process:
```bash
pkill -f "stages/stage3-crypto/oracle.py"
```

## Service Protocol
Connecting to TCP port 5000 with Netcat or Telnet returns the following interactive prompt:

```text
$ nc localhost 5000
=== Encryption Oracle Service ===
Target flag : GJSOV HDWSJ FZRMX RYMTC GYQWZ
Send plaintext to encrypt (type 'quit' to exit):
```

Entering any string causes the oracle to return its encrypted ciphertext:
```text
AAAAAA
Encrypted: SECRET
```

## Cryptanalysis & Exploitation

### 1. Identifying the Cipher
Notice the oracle's output when encrypting repeated letters:
- Plaintext `AAAAAA` returns ciphertext `SECRET`.
- Plaintext `BBBBBB` returns ciphertext `TFDSFU`.

Because an input of `A` (shift of 0) returns the literal key letters, sending repeating `A` characters directly exposes the key:
- Key: `SECRET`
- Key length: 6 characters
- Cipher: Polyalphabetic substitution (Vigenere cipher)

### 2. Decrypting the Target Ciphertext
The service announced the target string:
```text
Target: GJSOV HDWSJ FZRMX RYMTC GYQWZ
```

Using key `SECRET`, invert each character:
$$\text{Plaintext}_i = (\text{Ciphertext}_i - \text{Key}_{i \bmod 6}) \pmod{26}$$

Performing the decryption yields:
```
OFQXR OLSQS BGZIV AUTBY EHMDH
```

### 3. Submitting the Solution
Connect to the oracle and send the recovered plaintext:
```bash
nc localhost 5000
```
Input:
```text
OFQXR OLSQS BGZIV AUTBY EHMDH
```

Server response:
```text
Encrypted: GJSOV HDWSJ FZRMX RYMTC GYQWZ

[+] Congratulations! Correct Decryption!
[+] Flag: SHADOWNET{7h_0f_7h3_3ncrypt10n_1s_4w3s0m3}
```

### Automated Solver Script
```python
import socket

def vigenere_decrypt(ciphertext, key):
    res = []
    idx = 0
    for c in ciphertext.upper():
        if c.isalpha():
            shift = ord(key[idx % len(key)].upper()) - ord('A')
            res.append(chr((ord(c) - ord('A') - shift) % 26 + ord('A')))
            idx += 1
        else:
            res.append(c)
    return "".join(res)

s = socket.create_connection(("localhost", 5000))
banner = s.recv(1024).decode()
target = "GJSOV HDWSJ FZRMX RYMTC GYQWZ"
key = "SECRET"
plaintext = vigenere_decrypt(target, key)

s.sendall((plaintext + "\n").encode())
response = s.recv(2048).decode()
print(response)
s.close()
```

