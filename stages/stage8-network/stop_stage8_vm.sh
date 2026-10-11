#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 8: Stop Virtual Machine & Web Terminal
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="${SCRIPT_DIR}/.stage8_pids"
VM_PID_FILE="${SCRIPT_DIR}/vm.pid"

echo "[*] Stopping ShadowNet Stage 8 services..."

# 1. Stop processes listed in PID_FILE
if [ -f "${PID_FILE}" ]; then
    while read -r pid name || [ -n "$pid" ]; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "[-] Terminating $name (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 0.2
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
    done < "${PID_FILE}"
    rm -f "${PID_FILE}"
fi

# 2. Stop QEMU VM if still alive
if [ -f "${VM_PID_FILE}" ]; then
    VM_PID="$(cat "${VM_PID_FILE}")"
    if [ -n "${VM_PID}" ] && kill -0 "${VM_PID}" 2>/dev/null; then
        echo "[-] Terminating QEMU Virtual Machine (PID: ${VM_PID})..."
        kill "${VM_PID}" 2>/dev/null || true
        sleep 0.5
        kill -9 "${VM_PID}" 2>/dev/null || true
    fi
    rm -f "${VM_PID_FILE}"
fi

# 3. Clean up any leftover ports and processes
fuser -k 7681/tcp 2>/dev/null || true
fuser -k 3008/tcp 2>/dev/null || true
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 2228/tcp 2>/dev/null || true
pkill -f "qemu-system-x86_64.*stage8" 2>/dev/null || true

echo "[+] Stage 8 Virtual Machine & Web Terminal successfully stopped."

