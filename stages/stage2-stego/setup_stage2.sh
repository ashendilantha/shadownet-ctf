#!/bin/bash
# ShadowNet CTF - Stage 2: Covert Transmissions Startup Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "  [+] Setting up Stage 2: Covert Transmissions (Downloadable Archive)"
echo "============================================================"

# Ensure assets are present and build package
echo "[+] Generating assets and covert transmissions..."
python3 generate_spectrogram.py

echo "[+] Creating release zip package (excluding passphrase.txt)..."
rm -f stage2-covert-transmissions.zip
zip -j stage2-covert-transmissions.zip assets/*.wav assets/whistleblower.jpg

echo "[✓] Stage 2 package generated: stage2-covert-transmissions.zip"
echo "    Delivery method: Downloadable Archive (Supabase Storage / Web Dashboard)"


