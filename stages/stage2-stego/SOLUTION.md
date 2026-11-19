# Stage 2: Covert Transmissions — Solution Guide

## Overview
- **Domain:** Steganography & Signal Processing
- **Difficulty:** Medium (+150 XP)
- **Delivery Method:** Downloadable Archive (`stage2-covert-transmissions.zip`)
- **Flag:** `SHADOWNET{7r4c3s_1n_th3_fr3qu3ncy_d0m41n}`

---

## Step 1: Reconnaissance & Asset Retrieval
Download the covert transmissions archive directly from the challenge portal or CLI:
```bash
wget http://<platform-domain>/downloads/stage2-covert-transmissions.zip
unzip stage2-covert-transmissions.zip
```
The archive unpacks 28 operational files:
- `whistleblower.jpg` (encrypted photographic exhibit)
- 27 intercepted radio transmissions: `intercept_alpha_09.wav` and 26 decoy channels (`intercept_beta_02.wav` through `intercept_gamma2_28.wav`).

---

## Step 2: Extracting Embedded Whistleblower Intel
Inspect `whistleblower.jpg`:
- The red header reads `SHADOWNET EVIDENCE EXHIBIT #2026-B`
- A hint text appears on the document: `PASSPHRASE HINT: Emergency bunker refuge` -> `shelter`

Extract the hidden payload with `steghide`:
```bash
steghide extract -sf whistleblower.jpg -p shelter
```
This extracts `passphrase.txt`. Decode the Base64 content:
```bash
base64 -d passphrase.txt
```
The decrypted report reveals:
- The 26 decoy transmissions (`intercept_beta_02.wav`, `intercept_zeta_03.wav`, etc.) contain dummy noise & spectral decoy patterns.
- `intercept_alpha_09.wav` is the authentic transmission containing the genuine operational key in the frequency domain.

---

## Step 3: Spectral Frequency Analysis
Open `intercept_alpha_09.wav` in **Audacity** or **Sonic Visualiser**:
1. In Audacity: Click the audio track dropdown arrow next to the track name.
2. Switch display mode from **Waveform** to **Spectrogram**.
3. Adjust spectrogram frequency scale (1.5 kHz – 7.5 kHz).
4. The visual flag is rendered in the acoustic frequencies:
   `SHADOWNET{7r4c3s_1n_th3_fr3qu3ncy_d0m41n}`

Submit the flag into the ShadowNet Command Deck.

