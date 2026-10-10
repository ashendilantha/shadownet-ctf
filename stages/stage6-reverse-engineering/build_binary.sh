#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

gcc -O2 source.c -o target.bin
chmod 755 target.bin
echo "[+] Successfully built target.bin in $DIR"
