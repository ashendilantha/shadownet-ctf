# 🎯 Stage 6: Reverse Engineering — Solution & Architecture Guide

## 📋 Overview
- **Domain:** Reverse Engineering / Binary Analysis
- **Target:** NexaCorp Defense Daemon (`target.bin`)
- **Delivery:** Isolated Ubuntu VM (or SSH Sandbox Container)
- **Default SSH Access:** `ssh player@<VM_IP>` (Password: `password123`)
- **Target Location on Target:** `/home/player/challenges/stage6/target.bin`
- **Flag:** `SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}`

---

## 🔍 Workflow: How to Approach This Challenge

### 1. Connecting & Extracting the Binary via SSH
Players are given SSH credentials to access the sandbox host:
```bash
# SSH into the sandbox VM
ssh player@<VM_IP>
# Enter password: password123
```

To analyze the binary comfortably in a local GUI tool (such as **Ghidra**, **IDA Pro**, or **Binary Ninja**), download it to your local workstation using `scp`:
```bash
# On your local machine:
scp player@<VM_IP>:~/challenges/stage6/target.bin ./target.bin
```

---

## 🔬 Decompilation & Static Analysis (Ghidra Walkthrough)

### Step 1: Open `target.bin` in Ghidra
1. Launch Ghidra, create a project, and import `target.bin` (Format: `ELF 64-bit LSB executable, x86-64`).
2. Run automated analysis.
3. Locate `main` and `check_access` in the **Symbol Tree** / **Functions** panel.

### Step 2: Analyze `check_access`
The decompiled C code reveals:
```c
int check_access(char *input) {
    if (strlen(input) != 42) {
        puts("Access denied!");
        return 0;
    }

    for (int i = 0; i < 42; i++) {
        unsigned char key = (0x5A + (i * 3)) & 0xFF;
        unsigned char transformed = (((unsigned char)input[i] ^ key) + (i % 7)) & 0xFF;
        if (transformed != EXPECTED_DATA[i]) {
            puts("Access denied!");
            return 0;
        }
    }

    puts("Access granted!");
    printf("Flag: %s\n", input);
    return 1;
}
```

### Step 3: Inspect `EXPECTED_DATA`
In `.rodata`, the 42 expected byte values are stored:
```
0x09, 0x16, 0x23, 0x2a, 0x2d, 0x43, 0x28, 0x2a, 0x27, 0x10,
0x50, 0x17, 0x4f, 0xeb, 0xb4, 0xf1, 0xe6, 0xd5, 0xa7, 0x02,
0xf7, 0xa8, 0xf3, 0xae, 0x94, 0xdb, 0x9e, 0xcb, 0xc9, 0xef,
0x87, 0x85, 0xe9, 0xe3, 0xf6, 0xf3, 0xab, 0x98, 0xf8, 0xa8,
0xbf, 0xae
```

---

## 💻 Mathematical Inversion & Flag Recovery

The forward encryption equation for each index $i$ is:
$$\text{key}_i = (0\text{x}5A + 3 \times i) \pmod{256}$$
$$\text{transformed}_i = ((\text{input}_i \oplus \text{key}_i) + (i \bmod 7)) \pmod{256} = \text{EXPECTED\_DATA}_i$$

To invert and solve for $\text{input}_i$:
1. Subtract the modular offset:
   $$v_i = (\text{EXPECTED\_DATA}_i - (i \bmod 7)) \pmod{256}$$
2. XOR with the key:
   $$\text{input}_i = v_i \oplus \text{key}_i$$

### Python Solver (`solve.py`)
```python
#!/usr/bin/env python3

EXPECTED_DATA = [
    0x09, 0x16, 0x23, 0x2a, 0x2d, 0x43, 0x28, 0x2a, 0x27, 0x10,
    0x50, 0x17, 0x4f, 0xeb, 0xb4, 0xf1, 0xe6, 0xd5, 0xa7, 0x02,
    0xf7, 0xa8, 0xf3, 0xae, 0x94, 0xdb, 0x9e, 0xcb, 0xc9, 0xef,
    0x87, 0x85, 0xe9, 0xe3, 0xf6, 0xf3, 0xab, 0x98, 0xf8, 0xa8,
    0xbf, 0xae
]

flag = ""
for i, exp in enumerate(EXPECTED_DATA):
    key = (0x5A + (i * 3)) & 0xFF
    val = (exp - (i % 7)) & 0xFF
    flag += chr(val ^ key)

print("[+] Flag:", flag)
```

---

## 🚩 Flag Verification
Run the target binary with the recovered flag:
```bash
./target.bin "SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}"
```
**Output:**
```
Access granted!
Flag: SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}
```

