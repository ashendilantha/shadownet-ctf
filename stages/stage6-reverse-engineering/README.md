# Stage 6: NexaCorp Defense Daemon

## Overview
- Category: Reverse Engineering & Binary Analysis
- Target: ELF 64-bit x86-64 stripped executable (`target.bin`)
- SSH Service Port: 2222
- Difficulty: Medium-Hard
- Flag: `SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}`

## Description
A defense daemon binary was retrieved from NexaCorp internal perimeter systems. The binary requires an authorization passkey passed as a command-line argument. Entering the wrong access key immediately triggers an `Access denied!` message.

Your objective is to reverse engineer the binary using static analysis or dynamic instrumentation, recover the validation algorithm and internal reference data, and invert the transformation to derive the correct flag.

## Directory Structure
- `target.bin`: Compiled 64-bit ELF Linux executable to analyze.
- `source.c`: Original C source code illustrating the validation logic.
- `build_binary.sh`: Compilation script used to generate the stripped binary.
- `solve.py`: Python solver script that extracts and inverts the byte transformation.
- `Dockerfile`: Container image packaging SSH access for remote challenge sandboxes.
- `docker-compose.yml`: Compose file exposing SSH on port 2222.
- `SOLUTION.md`: Reference writeup detailing disassembly in Ghidra and mathematical inversion.

## Running the Challenge Environment

### Option 1: Analyze Binary Directly on Host
You do not need to run Docker if you are analyzing the binary locally:
```bash
# Verify binary properties
file stages/stage6-reverse-engineering/target.bin
# target.bin: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, stripped

# Test running the binary
./stages/stage6-reverse-engineering/target.bin TEST_INPUT
# Output: Access denied!
```

### Option 2: Run via Docker Sandbox
If testing in an isolated container via SSH:
```bash
# Start container
docker compose -f stages/stage6-reverse-engineering/docker-compose.yml up -d

# Connect via SSH
ssh -p 2222 player@localhost
# Password: password123

# The target binary is located at:
~/challenges/stage6/target.bin
```

To stop the container:
```bash
docker compose -f stages/stage6-reverse-engineering/docker-compose.yml down
```

## Recompiling the Binary
To recompile the binary from source:
```bash
cd stages/stage6-reverse-engineering
./build_binary.sh
```
This runs:
```bash
gcc -O2 -s -no-pie -fno-stack-protector -o target.bin source.c
```

## Static Analysis Walkthrough

### 1. Function Identification
Load `target.bin` into a disassembler or decompiler (Ghidra, IDA, or Binary Ninja):
1. In the Symbol Tree, locate the entrypoint and follow the call to `main`.
2. `main` checks `argc < 2`. If an argument is provided, it passes `argv[1]` into the validation function `check_access`.

### 2. Dissecting the Validation Function
The decompiled C logic in `check_access`:
```c
int check_access(const char *input) {
    if (strlen(input) != 42) {
        printf("Access denied!\n");
        return 0;
    }

    for (int i = 0; i < 42; i++) {
        unsigned char key = (0x5A + (i * 3)) & 0xFF;
        unsigned char transformed = (((unsigned char)input[i] ^ key) + (i % 7)) & 0xFF;
        if (transformed != EXPECTED_DATA[i]) {
            printf("Access denied!\n");
            return 0;
        }
    }

    printf("Access granted!\n");
    printf("Flag: %s\n", input);
    return 1;
}
```

Key observations:
1. Input must be exactly 42 characters long.
2. At each character index $i$:
   - A round key is computed: $\text{key}_i = (0\text{x}5\text{A} + 3i) \pmod{256}$
   - Input byte is XORed with $\text{key}_i$.
   - A modular offset $(i \bmod 7)$ is added to the result.
   - The final byte is checked against `EXPECTED_DATA[i]`.

### 3. Extracting Reference Bytes
In the `.rodata` section, the 42 expected bytes are stored:
```
0x09, 0x16, 0x23, 0x2a, 0x2d, 0x43, 0x28, 0x2a, 0x27, 0x10,
0x50, 0x17, 0x4f, 0xeb, 0xb4, 0xf1, 0xe6, 0xd5, 0xa7, 0x02,
0xf7, 0xa8, 0xf3, 0xae, 0x94, 0xdb, 0x9e, 0xcb, 0xc9, 0xef,
0x87, 0x85, 0xe9, 0xe3, 0xf6, 0xf3, 0xab, 0x98, 0xf8, 0xa8,
0xbf, 0xae
```

## Solution & Inversion

To invert the transformation and recover each character $\text{input}_i$:
1. Subtract the offset $(i \bmod 7)$:
   $$V_i = (\text{EXPECTED\_DATA}_i - (i \bmod 7)) \pmod{256}$$
2. XOR with $\text{key}_i$:
   $$\text{input}_i = V_i \oplus \text{key}_i$$

### Running the Included Solver
```bash
python3 stages/stage6-reverse-engineering/solve.py
```

Output:
```text
[+] Recovered Flag: SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}
```

### Verifying Against the Binary
Execute the target binary with the recovered flag:
```bash
./stages/stage6-reverse-engineering/target.bin "SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}"
```

Output:
```text
Access granted!
Flag: SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}
```

