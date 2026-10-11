#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 8: Core Infrastructure Breach
# Launch Ubuntu Virtual Machine & Browser Terminal (HTB/THM Style)
# 100% Free & Open Source, Zero Docker required.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="${SCRIPT_DIR}/.stage8_pids"
LOG_DIR="${SCRIPT_DIR}/logs"
mkdir -p "${LOG_DIR}"

MODE="--vm"
GUI_MODE=0

for arg in "$@"; do
    case "$arg" in
        --local|--instant|-l)
            MODE="--local"
            ;;
        --vm|--kvm|--qemu|-v)
            MODE="--vm"
            ;;
        --gui|--window|-g)
            GUI_MODE=1
            MODE="--vm"
            ;;
    esac
done

show_banner() {
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════════╗
║               SHADOWNET CTF // STAGE 8 VM RUNNER                     ║
║         Core Infrastructure Breach - Network Pivoting & SSRF         ║
╚══════════════════════════════════════════════════════════════════════╝
EOF
}

cleanup_existing() {
    if [ -f "${PID_FILE}" ]; then
        echo "[*] Cleaning up previously running instances..."
        while read -r pid name || [ -n "$pid" ]; do
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                echo "    [-] Stopping $name (PID $pid)..."
                kill "$pid" 2>/dev/null || true
            fi
        done < "${PID_FILE}"
        rm -f "${PID_FILE}"
    fi

    if [ -f "${SCRIPT_DIR}/vm.pid" ]; then
        OLD_VM_PID="$(cat "${SCRIPT_DIR}/vm.pid")"
        if [ -n "${OLD_VM_PID}" ] && kill -0 "${OLD_VM_PID}" 2>/dev/null; then
            echo "    [-] Stopping QEMU VM (PID $OLD_VM_PID)..."
            kill "$OLD_VM_PID" 2>/dev/null || true
        fi
        rm -f "${SCRIPT_DIR}/vm.pid"
    fi

    # Clear stale host key for port 2228
    ssh-keygen -R "[localhost]:2228" 2>/dev/null || true
}

start_web_terminal() {
    echo "[*] Starting In-Browser Web Terminal (HTB/TryHackMe Style)..."
    nohup python3 "${SCRIPT_DIR}/web-terminal/server.py" --host 0.0.0.0 --port 7681 </dev/null > "${LOG_DIR}/web-terminal.log" 2>&1 &
    TERM_PID=$!
    disown ${TERM_PID} 2>/dev/null || true
    echo "${TERM_PID} web-terminal" >> "${PID_FILE}"
    echo "[+] Web Terminal active on: http://localhost:7681"

    sleep 1

    if command -v xdg-open >/dev/null 2>&1; then
        echo "[*] Launching browser terminal window..."
        xdg-open "http://localhost:7681" >/dev/null 2>&1 || true
    elif python3 -c "import webbrowser; webbrowser.open('http://localhost:7681')" 2>/dev/null; then
        echo "[*] Browser terminal window opened via Python webbrowser."
    fi
}

start_local_mode() {
    echo "[*] Mode: Local Isolated Native Services (Instant Start, No Download)"
    cleanup_existing

    ENTRY_PORT=3008
    echo "[*] Setting Entry Host port to ${ENTRY_PORT} (Prevents conflict with Next.js CTF dashboard on port 3000)"

    echo "[*] Starting Internal Metadata Service on port 8080..."
    nohup python3 "${SCRIPT_DIR}/db-host/metadata_service.py" </dev/null > "${LOG_DIR}/metadata.log" 2>&1 &
    META_PID=$!
    disown ${META_PID} 2>/dev/null || true
    echo "${META_PID} metadata-service" >> "${PID_FILE}"

    echo "[*] Starting Entry Host Web Service on port ${ENTRY_PORT}..."
    nohup python3 "${SCRIPT_DIR}/entry-host/app.py" "${ENTRY_PORT}" </dev/null > "${LOG_DIR}/entry-host.log" 2>&1 &
    ENTRY_PID=$!
    disown ${ENTRY_PID} 2>/dev/null || true
    echo "${ENTRY_PID} entry-host" >> "${PID_FILE}"

    start_web_terminal

    echo ""
    echo "════════════════════════════════════════════════════════════════════════"
    echo "  [✓] STAGE 8 ENVIRONMENT ONLINE (LOCAL VM-EQUIVALENT MODE)"
    echo "════════════════════════════════════════════════════════════════════════"
    echo "  • In-Browser Terminal: http://localhost:7681  <-- OPEN IN BROWSER!"
    echo "  • Entry Host Web App:  http://localhost:${ENTRY_PORT}"
    echo "  • Metadata Subnet:     http://127.0.0.1:8080 or http://192.168.100.10:8080"
    echo "  • Stop Services:       ./stages/stage8-network/stop_stage8_vm.sh"
    echo "════════════════════════════════════════════════════════════════════════"
}

start_kvm_vm() {
    echo "[*] Mode: Ubuntu Virtual Machine (QEMU / KVM Hardware Accelerated)"
    cleanup_existing

    KVM_ARG="-enable-kvm"
    if [ ! -e /dev/kvm ] || [ ! -w /dev/kvm ]; then
        echo "[-] Notice: /dev/kvm not writable, falling back to software TCG emulation..."
        KVM_ARG=""
    fi

    IMAGE_PATH="${SCRIPT_DIR}/ubuntu-cloud.img"
    OVERLAY_PATH="${SCRIPT_DIR}/stage8-overlay.qcow2"
    ISO_PATH="${SCRIPT_DIR}/cidata.iso"

    IMAGE_SIZE=0
    if [ -f "${IMAGE_PATH}" ]; then
        IMAGE_SIZE=$(stat -c%s "${IMAGE_PATH}" 2>/dev/null || echo 0)
    fi

    # Check if Ubuntu Cloud Image exists and is complete (~600MB expected)
    if [ ! -f "${IMAGE_PATH}" ] || [ "${IMAGE_SIZE}" -lt 300000000 ]; then
        echo "[-] Ubuntu cloud image missing or incomplete (${IMAGE_SIZE} bytes / ~600MB expected)."
        echo "[*] Downloading / resuming official Ubuntu 22.04 LTS Cloud image (~600MB)..."
        curl -C - -L --progress-bar -o "${IMAGE_PATH}" "https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img"
    fi

    # 1. Regenerate Cloud-Init ISO with fresh credentials
    echo "[*] Generating Cloud-Init configuration ISO..."
    genisoimage -output "${ISO_PATH}" -volid cidata -joliet -rock \
        "${SCRIPT_DIR}/cloud-init/user-data" "${SCRIPT_DIR}/cloud-init/meta-data" >/dev/null 2>&1

    # 2. Create fresh COW overlay for clean first-boot
    echo "[*] Creating fresh QCOW2 virtual disk snapshot..."
    (cd "${SCRIPT_DIR}" && qemu-img create -f qcow2 -b "ubuntu-cloud.img" -F qcow2 "stage8-overlay.qcow2" 15G >/dev/null 2>&1)

    # 3. Launch QEMU VM
    if [ "${GUI_MODE}" -eq 1 ]; then
        echo "[*] Launching Ubuntu Virtual Machine with visible desktop window (GTK)..."
        nohup qemu-system-x86_64 \
            ${KVM_ARG} \
            -m 2048 \
            -smp 2 \
            -drive file="${OVERLAY_PATH}",format=qcow2 \
            -cdrom "${ISO_PATH}" \
            -netdev user,id=net0,hostfwd=tcp:0.0.0.0:3008-:3000,hostfwd=tcp:0.0.0.0:2228-:22 \
            -device virtio-net-pci,netdev=net0 \
            -display gtk \
            -serial file:"${LOG_DIR}/serial.log" \
            -pidfile "${SCRIPT_DIR}/vm.pid" > "${LOG_DIR}/vm.log" 2>&1 &
        VM_PID=$!
        disown ${VM_PID} 2>/dev/null || true
    else
        echo "[*] Launching Ubuntu Virtual Machine in background (headless server)..."
        qemu-system-x86_64 \
            ${KVM_ARG} \
            -m 2048 \
            -smp 2 \
            -drive file="${OVERLAY_PATH}",format=qcow2 \
            -cdrom "${ISO_PATH}" \
            -netdev user,id=net0,hostfwd=tcp:0.0.0.0:3008-:3000,hostfwd=tcp:0.0.0.0:2228-:22 \
            -device virtio-net-pci,netdev=net0 \
            -display none \
            -serial file:"${LOG_DIR}/serial.log" \
            -daemonize \
            -pidfile "${SCRIPT_DIR}/vm.pid" > "${LOG_DIR}/vm.log" 2>&1
        VM_PID="$(cat "${SCRIPT_DIR}/vm.pid")"
    fi

    echo "${VM_PID} qemu-vm" >> "${PID_FILE}"
    echo "[+] Ubuntu Virtual Machine active (PID: ${VM_PID})!"

    # 4. Start In-Browser Web Terminal
    start_web_terminal

    HOST_IPS=$(hostname -I 2>/dev/null || ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '^127\.' | tr '\n' ' ' || echo "127.0.0.1")

    echo ""
    echo "════════════════════════════════════════════════════════════════════════"
    echo "  [✓] UBUNTU VIRTUAL MACHINE & BROWSER TERMINAL ONLINE"
    echo "════════════════════════════════════════════════════════════════════════"
    echo "  • In-Browser Terminal: http://localhost:7681  <-- DIRECT VM SHELL!"
    echo "  • Entry Host Web App:  http://localhost:3008"
    echo ""
    echo "  [🔑 SSH ACCESS (Local Host)]"
    echo "  • Password Login:      ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2228 shadownet@localhost"
    echo "                         Password: password123"
    echo "  • One-Click Script:    ./stages/stage8-network/ssh_vm.sh"
    echo ""
    echo "  [🐉 SSH ACCESS FROM KALI LINUX VM]"
    echo "  • From Kali Terminal:  ssh -p 2228 shadownet@<HOST_IP>"
    echo "                         Password: password123"
    echo "  • Host Machine IPs:    ${HOST_IPS}"
    echo ""
    echo "  • VM Window (GUI):     To see visible VM window, use: ./stages/stage8-network/start_stage8_vm.sh --vm --gui"
    echo "  • Stop Services:       ./stages/stage8-network/stop_stage8_vm.sh"
    echo "════════════════════════════════════════════════════════════════════════"
}

show_banner

case "${MODE}" in
    --local|--instant|-l)
        start_local_mode
        ;;
    --vm|--kvm|--qemu|-v)
        start_kvm_vm
        ;;
    *)
        start_kvm_vm
        ;;
esac
