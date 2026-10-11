#!/usr/bin/env bash
# ==============================================================================
# ShadowNet CTF - Stage 8: SSH Helper for Ubuntu Virtual Machine
# Connects to the VM without host key collision warnings.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEY_FILE="${SCRIPT_DIR}/id_ed25519"

# Clear any stale host key for port 2228
ssh-keygen -R "[localhost]:2228" 2>/dev/null || true

if [ -f "${KEY_FILE}" ]; then
    exec ssh -o StrictHostKeyChecking=no \
             -o UserKnownHostsFile=/dev/null \
             -o LogLevel=ERROR \
             -i "${KEY_FILE}" \
             -p 2228 shadownet@localhost "$@"
else
    exec ssh -o StrictHostKeyChecking=no \
             -o UserKnownHostsFile=/dev/null \
             -o LogLevel=ERROR \
             -p 2228 shadownet@localhost "$@"
fi

