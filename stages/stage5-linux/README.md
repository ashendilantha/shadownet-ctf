# Stage 5: Token Prediction & PRNG Cryptanalysis

## Overview
- Category: Cryptanalysis / Pseudo-Random Number Generators (PRNG) / Linux Daemons
- Service: NexaCorp Reset Gateway (v1.5)
- Port: 5005 (TCP)
- Difficulty: Medium
- Flag: `SHADOWNET{token_df5b719d0a3044843bf77b0e56b5bbc6}`

## Description
The NexaCorp identity verification service issues one-time password reset tokens over a raw network interface. To streamline verification performance, the engineering team implemented a custom pseudo-random number generator instead of a cryptographically secure random source (`/dev/urandom` or `secrets`).

The generator is based on a standard Linear Congruential Generator (LCG) using glibc parameters, truncated to 8 decimal digits. By capturing consecutive token samples from an active TCP connection, an attacker can reconstruct the 31-bit internal state of the generator, predict the upcoming token, and obtain the authorization flag.

## Directory Structure
- `server.py`: Primary TCP socket daemon implementing the token sequence, state progression, and interactive command interface.
- `http_server.py`: Alternative HTTP adapter used by the platform web interface.
- `stage5-starter.py`: Starter Python template for connecting, collecting samples, and submitting predictions.
- `Dockerfile`: Minimal Alpine/Python container image.
- `docker-compose.yml`: Compose specification binding service port `5005:5005`.
- `test_server.py`: Unit tests verifying token generation and prediction logic.
- `test_http.py`: Integration tests for the HTTP adapter.

## Running the Service

### Using Docker Compose
```bash
docker compose -f stages/stage5-linux/docker-compose.yml up -d
```

To stop the container:
```bash
docker compose -f stages/stage5-linux/docker-compose.yml down
```

### Running Natively with Python
```bash
python3 stages/stage5-linux/server.py
```

To stop the background server:
```bash
pkill -f "stages/stage5-linux/server.py"
```

## Protocol Specifications
Connect via TCP on port 5005:
```text
$ nc localhost 5005
NexaCorp Reset Gateway / v1.5
Each connection has an independent token sequence.
Commands: NEXT | PREDICT <8-digit-token> | HELP | QUIT
READY
```

### Commands:
- `NEXT`: Generates and advances the generator by one step, returning an 8-digit token (`TOKEN <8-digits>`). Limit: 32 tokens per session.
- `PREDICT <8-digit-token>`: Advances the generator by one step and tests if your prediction matches the internal state. Maximum 3 failed attempts per session.
- `HELP`: Displays command usage.
- `QUIT`: Terminates the session.

## Mathematical Vulnerability

The PRNG uses a Linear Congruential Generator (LCG) defined by:
$$S_{n+1} = (A \cdot S_n + C) \pmod{M}$$

Where:
- $A = 1103515245$ (multiplier)
- $C = 12345$ (increment)
- $M = 2^{31} = 2147483648$ (modulus)
- Token output: $T_n = S_n \pmod{10^8}$, formatted as 8 decimal digits with leading zeros.

### State Recovery Strategy
Because $M = 2^{31} \approx 2.14 \times 10^9$ and the token is $T_n = S_n \pmod{10^8}$, the truncated token hides only the top bits:
$$S_n = T_n + k \cdot 10^8 \quad \text{for some integer } k$$

Since $0 \le S_n < 2^{31}$, the range of possible values for $k$ is bounded:
$$0 \le k \le \lfloor \frac{2^{31} - 1}{10^8} \rfloor = 21$$

This gives at most 22 candidate values for the internal state $S_n$.

Given two consecutive tokens $T_1$ and $T_2$:
1. For each candidate $k \in [0, 21]$, test the candidate state $S_1 = T_1 + k \cdot 10^8$.
2. Compute the next state: $S_2' = (A \cdot S_1 + C) \pmod M$.
3. Check whether $S_2' \pmod{10^8} == T_2$.
4. Exactly one candidate will match, identifying the exact internal state $S_2$.
5. From $S_2$, compute $S_3 = (A \cdot S_2 + C) \pmod M$ and calculate the predicted token $T_3 = S_3 \pmod{10^8}$.

## Exploitation Walkthrough

### Interactive Solver Script (`solve_stage5.py`)
```python
import socket

A = 1103515245
C = 12345
M = 2 ** 31
MOD = 100000000

def recover_next_state(t1, t2):
    for k in range(22):
        s1 = t1 + k * MOD
        if s1 < M:
            cand_s2 = (A * s1 + C) % M
            if cand_s2 % MOD == t2:
                return cand_s2
    raise ValueError("Failed to recover internal state")

s = socket.create_connection(("localhost", 5005))
f = s.makefile("rw")

# Read banner
for _ in range(4):
    f.readline()

# Request two consecutive tokens
f.write("NEXT\n")
f.flush()
t1 = int(f.readline().strip().split()[1])

f.write("NEXT\n")
f.flush()
t2 = int(f.readline().strip().split()[1])

print(f"Captured tokens: T1={t1:08d}, T2={t2:08d}")

# Recover state and predict the third token
s2 = recover_next_state(t1, t2)
s3 = (A * s2 + C) % M
prediction = f"{s3 % MOD:08d}"

print(f"Submitting prediction: {prediction}")
f.write(f"PREDICT {prediction}\n")
f.flush()

# Read response and flag
status = f.readline().strip()
flag_line = f.readline().strip()
print(status)
print(flag_line)

s.close()
```

### Execution Output
```text
$ python3 solve_stage5.py
Captured tokens: T1=49281720, T2=81739201
Submitting prediction: 12849102
SUCCESS prediction accepted
FLAG SHADOWNET{token_df5b719d0a3044843bf77b0e56b5bbc6}
```
Submit the flag string into the ShadowNet Command Deck.

