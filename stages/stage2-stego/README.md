# Stage 2: Covert Transmissions

## Overview
- Category: Steganography & Signal Processing
- Difficulty: Medium
- Points: 150 XP
- Delivery: Downloadable archive (`stage2-covert-transmissions.zip`)
- Flag: `SHADOWNET{7r4c3s_1n_th3_fr3qu3ncy_d0m41n}`

## Challenge Description
An operative intercepted an exfiltrated surveillance package from NexaCorp facilities. The archive contains classified photographic evidence along with 27 multichannel radio intercepts recorded in WAV format. To prevent simple eavesdropping, NexaCorp broadcast 26 jamming decoy signals alongside a single authentic transmission channel.

Your objective is to extract embedded intelligence from the photographic exhibit, identify the genuine transmission channel, and reconstruct the concealed flag from the acoustic frequency domain.

## Directory Structure
- `assets/`: Working directory with all raw challenge files.
  - `whistleblower.jpg`: Photographic exhibit containing an encrypted steghide payload.
  - `intercept_alpha_09.wav`: Authentic audio carrier with visual spectrogram flag data.
  - `intercept_beta_02.wav` through `intercept_gamma2_28.wav`: 26 decoy radio channels with random noise and decoy tones.
  - `passphrase.txt`: Plaintext intel report explaining the channel layout (embedded inside `whistleblower.jpg`).
- `generate_spectrogram.py`: Script used to generate the spectrogram audio payload and decoy WAV files.
- `setup_stage2.sh`: Build script that embeds `passphrase.txt` into `whistleblower.jpg` using steghide and packages the zip file.
- `requirements.txt`: Python dependencies (`scipy`, `numpy`, `pillow`).
- `SOLUTION.md`: Quick reference solution guide.

## Building / Resetting Challenge Assets
To regenerate the challenge files and compile the downloadable zip archive:

```bash
# Ensure steghide is installed on Linux
sudo apt-get install -y steghide

# Run the build script
./setup_stage2.sh
```

This compiles:
1. `generate_spectrogram.py` generates the 27 WAV audio files in `assets/`.
2. `steghide` embeds `passphrase.txt` into `assets/whistleblower.jpg` using passphrase `shelter`.
3. Creates `public/downloads/stage2/stage2-covert-transmissions.zip` for platform downloads.

## Exploitation Walkthrough

### Step 1: Examine the Photographic Exhibit
Inspect `whistleblower.jpg` with an image viewer or command-line tools:
- The top banner reads: `SHADOWNET EVIDENCE EXHIBIT #2026-B`
- A stamp on the lower document notes: `PASSPHRASE HINT: Emergency bunker refuge` -> `shelter`

Extract the hidden file using `steghide`:
```bash
steghide extract -sf assets/whistleblower.jpg -p shelter
```

This unpacks `passphrase.txt`.

### Step 2: Decode the Intel Report
Read and decode the extracted note:
```bash
cat passphrase.txt
# If base64-encoded:
base64 -d passphrase.txt
```

The report details:
- 26 channels (`intercept_beta_02.wav`, `intercept_zeta_03.wav`, etc.) are jamming decoys with dummy noise.
- `intercept_alpha_09.wav` is the authentic carrier channel containing operational intelligence.

### Step 3: Spectral Frequency Analysis
Open `intercept_alpha_09.wav` in an audio analysis tool such as **Audacity**, **Sonic Visualiser**, or via a Python script:

Using Audacity:
1. Open `intercept_alpha_09.wav`.
2. Click the downward arrow next to the track name in the left track control panel.
3. Switch the view mode from **Waveform** to **Spectrogram**.
4. Adjust the frequency range to focus on 1500 Hz - 7500 Hz.
5. The visual text rendered in the audio spectrum becomes legible:
   ```
   SHADOWNET{7r4c3s_1n_th3_fr3qu3ncy_d0m41n}
   ```

Using Python:
```python
import numpy as np
from scipy.io import wavfile
import matplotlib.pyplot as plt

sample_rate, data = wavfile.read("assets/intercept_alpha_09.wav")
plt.figure(figsize=(12, 6))
plt.specgram(data, Fs=sample_rate, NFFT=1024, noverlap=512, cmap='inferno')
plt.ylim(0, 10000)
plt.ylabel("Frequency (Hz)")
plt.xlabel("Time (s)")
plt.title("Acoustic Spectrogram")
plt.savefig("spectrogram_recovered.png")
```
Inspect `spectrogram_recovered.png` to read the flag.

