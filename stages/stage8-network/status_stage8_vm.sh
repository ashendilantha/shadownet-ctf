#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 8: Status Verification Script
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="${SCRIPT_DIR}/.stage8_pids"
VM_PID_FILE="${SCRIPT_DIR}/vm.pid"

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║             SHADOWNET CTF // STAGE 8 HEALTH STATUS                   ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"

check_port() {
    local port="$1"
    local name="$2"
    if timeout 1 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/${port}" 2>/dev/null; then
        echo -e "  [✓] ${name} (Port ${port}): \033[32mONLINE\033[0m"
    else
        echo -e "  [✗] ${name} (Port ${port}): \033[31mOFFLINE\033[0m"
    fi
}

echo "[*] Service Status:"
check_port 7681 "In-Browser Web Terminal"
check_port 3008 "Entry Host (SSRF Gateway)"
check_port 8080 "Metadata Service (Internal)"

echo ""
echo "[*] Virtual Machine Process:"
if [ -f "${VM_PID_FILE}" ]; then
    VM_PID="$(cat "${VM_PID_FILE}")"
    if kill -0 "${VM_PID}" 2>/dev/null; then
        echo -e "  [✓] QEMU Virtual Machine: \033[32mRUNNING (PID ${VM_PID})\033[0m"
    else
        echo -e "  [✗] QEMU Virtual Machine: \033[31mDEAD (Stale PID ${VM_PID})\033[0m"
    fi
else
    echo "  [-] QEMU Virtual Machine: Not started (Running in local mode or stopped)"
fi

echo ""
echo "[*] Access Coordinates:"
echo "  • Web Terminal: http://localhost:7681"
echo "  • Entry Portal: http://localhost:3008"
echo "════════════════════════════════════════════════════════════════════════"
