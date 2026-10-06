# Stage 2: Covert Transmissions — Solution Guide

## Overview
- **Domain:** Steganography & Signal Processing
- **Difficulty:** Medium (+150 XP)
- **Service Endpoint:** `http://localhost:5000`
- **Flag:** `SHADOWNET{7r4c3s_1n_th3_fr3qu3ncy_d0m41n}`

---

## Step 1: Reconnaissance & Asset Retrieval
Query the service on port 5000:
```bash
curl http://localhost:5000
```
Download the evidence files:
```bash
wget http://localhost:5000/whistleblower.jpg
wget http://localhost:5000/intercept_alpha_09.wav
wget http://localhost:5000/intercept_beta_02.wav
wget http://localhost:5000/intercept_gamma_07.wav
```
Or download the full bundle:
```bash
wget http://localhost:5000/stage2-assets.zip
unzip stage2-assets.zip
```

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
The report reveals:
- `intercept_beta_02.wav` and `intercept_gamma_07.wav` are decoys.
- `intercept_alpha_09.wav` is the authentic transmission containing the flag in the frequency domain.

---

## Step 3: Spectral Frequency Analysis
Open `intercept_alpha_09.wav` in **Audacity** or **Sonic Visualiser**:
1. In Audacity: Click the audio track dropdown arrow next to the track name.
2. Switch display mode from **Waveform** to **Spectrogram**.
3. Adjust spectrogram frequency scale (1.5 kHz – 7.5 kHz).
4. The visual flag is rendered in the acoustic frequencies:
   `SHADOWNET{7r4c3s_1n_th3_fr3qu3ncy_d0m41n}`

Submit the flag into the ShadowNet Command Deck.
