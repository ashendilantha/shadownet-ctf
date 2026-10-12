# Stage 1: NexaCorp Public Reconnaissance Portal

## Overview
- Category: Open Source Intelligence (OSINT) / Web Reconnaissance
- Target: NexaCorp Public Web Portal
- Difficulty: Easy
- Flag: `SHADOWNET{public_archive_b107fbd6e4251b4a55439951}`

## Description
NexaCorp maintains a public-facing corporate website that exposes marketing materials, company announcements, and an employee staff directory. During initial footprinting, an analyst must inspect public assets, profile metadata, and downloadable files to uncover leaked internal identifiers or archived evidence.

## Directory Structure
- `index.html`: Main landing page for the NexaCorp public corporate site.
- `staff-directory.html`: Staff listing linking individual employee profiles.
- `alex-chen.html`: Profile page for Research Associate Alex Chen (`@achen`).
- `updates.html`: Public press releases and newsroom articles.
- `styles.css`: Styling and layout rules for the static site.
- `assets/`: Media directory containing staff workspace photographs and graphics.
  - `alex-research-bench.png`: Original high-resolution photograph containing leaked artifact metadata.

## Running the Challenge Locally

### Option 1: Via the Main Next.js Platform
When running the ShadowNet platform (`npm run dev`), the static portal is automatically served at:
```
http://localhost:3000/stages/stage1-osint/index.html
```

### Option 2: Standalone HTTP Server
You can serve the static site independently using Python on port 8081:
```bash
python3 -m http.server 8081 --directory stages/stage1-osint
```
Then navigate to:
```
http://localhost:8081/index.html
```

To stop the standalone server:
```bash
pkill -f "http.server 8081"
```

## Solution Walkthrough

### 1. Site Enumeration
Browse to `staff-directory.html` and review employee profiles. Notice that staff cards link to dedicated subpages (`maya-fernando.html`, `ravi-patel.html`, `alex-chen.html`, etc.).

### 2. Identifying the Target Profile
Navigate to Alex Chen's profile page (`alex-chen.html`). In the bio section, under "Public update / 18 September 2026", Alex notes:
> "I saved the original photograph from our September review. The archive keeps its publishing notes with the file; the preview only tells part of the story."

A direct link is provided: `Download original image` pointing to `assets/alex-research-bench.png`.

### 3. Extracting the Flag
Download the image or inspect the file directly from the filesystem:
```bash
# Extract printable strings and filter for the flag pattern
strings stages/stage1-osint/assets/alex-research-bench.png | grep "SHADOWNET{"
```

Alternatively, inspect the PNG text chunks using `exiftool` or `pngcheck`:
```bash
exiftool stages/stage1-osint/assets/alex-research-bench.png
```

The output reveals:
```
SHADOWNET{public_archive_b107fbd6e4251b4a55439951}
```
Submit this token into the challenge dashboard.

