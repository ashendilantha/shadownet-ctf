#!/usr/bin/env bash
set -e

gcc -O2 source.c -o target.bin
chmod 755 target.bin
echo "[+] Successfully built target.bin"
