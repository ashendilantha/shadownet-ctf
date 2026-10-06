#!/bin/bash
# ShadowNet CTF - Stage 2: Covert Transmissions Startup Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "  [+] Setting up Stage 2: Covert Transmissions (Port 5000)"
echo "============================================================"

# Ensure assets are present
if [ ! -f "assets/whistleblower.jpg" ] || [ ! -f "assets/intercept_alpha_09.wav" ]; then
    echo "[!] Generating assets using generate_spectrogram.py..."
    python3 generate_spectrogram.py || true
fi

# Try Docker build and launch
if command -v docker >/dev/null 2>&1; then
    echo "[+] Building Docker image for Stage 2..."
    docker build -t stage2-stego .
    echo "[+] Launching container on port 5000..."
    docker run -d --name stage2-stego -p 5000:5000 --restart unless-stopped stage2-stego || true
    echo "[✓] Stage 2 container running on port 5000."
    echo "    Test with: curl http://localhost:5000"
else
    echo "[!] Docker not detected. Launching via local Python environment..."
    pip3 install -r requirements.txt
    python3 server.py &
    echo "[✓] Stage 2 server started in background on port 5000."
fi
