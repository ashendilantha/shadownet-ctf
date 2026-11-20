# ShadowNet CTF

A full-stack, narrative-driven **Capture The Flag (CTF)** and hands-on penetration testing platform built for **IE3132 — Penetration Testing (SLIIT)**. Players operate inside the fictional **ShadowNet Underground Collective**, infiltrating **NexaCorp's** simulated infrastructure across an 8-stage sequential killchain spanning OSINT, steganography, cryptography, web exploitation, PRNG forecasting, reverse engineering, Linux privilege escalation, and internal network pivoting.

**Live Platform:** https://shadownet-ctf.vercel.app

---

## Key Features

- **Layered Cyber Glassmorphism UI**
  - Floating rounded frosted-glass navigation bar, ambient glowing backdrop, responsive mobile/tablet navigation, and glassmorphic command decks across every page.
  - Interactive **Global Cyber Threat Map** (`CyberThreatMap`) with animated attack arcs, vector filters, clickable node inspector, and live packet intercept feed.
  - Real-time **Breach Telemetry Terminal**, **NexaCorp 8-Stage Defense Matrix**, and **Live Collective Leaderboard** preview on the homepage.
- **8-Stage Sequential Killchain (2,250 XP Total)**
  - Chronological stage progression where each defense ring unlocks upon submitting the verified SHA-256 flag hash (`SHADOWNET{...}`).
  - Integrated **Tactical Intelligence Hints** with persistent unlock tracking (`hint_unlocks`) and automatic XP penalty deduction.
- **Verified Operative Authentication**
  - Required email verification via **1-click Email Confirmation Link** (`/auth/register` → `/auth/confirm`) backed by Supabase Auth (with optional direct Resend API support).
  - Bcrypt password hashing and `HttpOnly` JWT session cookies (`jose`).
- **ShadowCommand Admin Controller (`/admin`)**
  - Full administrative panel with responsive swipeable tabs for live telemetry, stage & flag CRUD, tactical hint management, operative dossiers, submission audit logs, and scoreboard resets.
  - Admins are automatically isolated from the competitive player leaderboard.
- **Always-On Free Cloud Database**
  - Powered by **Supabase PostgreSQL** with dual-layer automated keep-alive pings via **Vercel Cron** (`/api/cron/keep-alive`) and **GitHub Actions** (`.github/workflows/supabase-keep-alive.yml`) to prevent free-tier inactivity pauses.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS v4 |
| **Backend & Auth** | Next.js Route Handlers, `jose` (JWT), `bcryptjs`, Axios |
| **Database & Email** | Supabase (PostgreSQL + Auth Confirmation Links), optional Resend API |
| **Challenge Labs** | Docker, Docker Compose, Flask/Python, C (x86_64 ELF), QEMU/KVM VM Cluster |
| **Deployment & Uptime** | Vercel (Hosting + Daily Cron), GitHub Actions (Keep-Alive Workflow) |

---

## 8-Stage Infiltration Killchain

| Stage | Subsystem | Challenge Name | Domain | Difficulty | Bounty | Delivery |
| :---: | --- | --- | --- | --- | :---: | --- |
| **01** | `NEXA-DMZ-01` | NexaCorp Reconnaissance | OSINT | Easy | 100 XP | Static Web |
| **02** | `NEXA-SIGINT-02` | Covert Transmissions | Steganography | Medium | 150 XP | Static Package |
| **03** | `NEXA-CRYPTO-03` | Cipher Oracle | Cryptography | Medium | 200 XP | Docker (`TCP 5000`) |
| **04** | `NEXA-AUTH-04` | NexaAuth Portal Bypass | Web Security (SQLi) | Medium | 250 XP | Docker (`HTTP 8084`) |
| **05** | `NEXA-PRNG-05` | PRNG Token Predictor | Scripting / LCG Math | Medium | 300 XP | Docker (`TCP 5005`) |
| **06** | `NEXA-RE-06` | Binary Disassembly | Reverse Engineering | Hard | 350 XP | Docker (`SSH 2222`) |
| **07** | `NEXA-ROOT-07` | Privilege Escalation | Linux Security (SUID) | Hard | 400 XP | Docker (`SSH 2227`) |
| **08** | `NEXA-CORE-08` | Core Infrastructure Breach | Network Pivoting (SSRF) | Hard | 500 XP | VM Cluster (`2228 / 3008 / 7681`) |

---

## Repository Structure

```text
shadownet-ctf/
├── .github/
│   └── workflows/
│       └── supabase-keep-alive.yml     # Scheduled keep-alive ping every 2 days
├── docs/                               # Architecture diagrams & coursework docs
├── public/                             # Static web assets & downloadable stage bundles
├── src/
│   ├── app/
│   │   ├── admin/                      # ShadowCommand admin controller UI
│   │   ├── api/
│   │   │   ├── admin/                  # Admin CRUD, hints, users, audit & reset APIs
│   │   │   ├── auth/                   # Register, confirm-email, login, logout, me
│   │   │   ├── challenges/             # Challenges, detail, downloads & hint unlock APIs
│   │   │   ├── cron/keep-alive/        # Daily Vercel Cron DB keep-alive endpoint
│   │   │   ├── scores/                 # Live leaderboard & killchain progress APIs
│   │   │   └── submissions/            # Real-time flag hash validation endpoint
│   │   ├── auth/                       # Login, Register & 1-click Email Confirm pages
│   │   ├── dashboard/                  # Target Deck, Challenge Detail, Leaderboard, Progress
│   │   ├── globals.css                 # Cyber glassmorphism design tokens & animations
│   │   ├── layout.tsx                  # Root layout with ambient glass backdrop
│   │   └── page.tsx                    # Homepage (Hero, Cybermap, Roadmap, Matrix, Roster)
│   ├── components/                     # Navbar, Footer, CyberThreatMap, ChallengeCard, etc.
│   ├── lib/                            # Supabase client, JWT auth, SHA-256 crypto, stage configs
│   └── types/                          # Shared TypeScript definitions
├── stages/
│   ├── stage1-osint/                   # Static NexaCorp recon portal
│   ├── stage2-stego/                   # Audio spectrogram & image steganography generator
│   ├── stage3-crypto/                  # AES-ECB / Vigenere oracle service
│   ├── stage4-web/                     # Vulnerable NexaAuth Flask SQLi target
│   ├── stage5-linux/                   # LCG PRNG token predictor service
│   ├── stage6-reverse-engineering/     # x86_64 ELF reverse engineering sandbox
│   ├── stage7-linux-security/          # SUID / PATH hijacking Linux bastion
│   └── stage8-network/                 # Multi-host SSRF + internal MySQL VM cluster
├── supabase/
│   └── migrations/                     # PostgreSQL schema, seed, pending_registrations & hint_unlocks
├── docker-compose.yml                  # Root Docker Compose orchestration
├── vercel.json                         # Vercel framework & daily keep-alive cron config
└── package.json                        # Scripts & dependencies
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** and **npm**
- **Docker** & **Docker Compose** (for containerized challenge stages)
- **Supabase** project (PostgreSQL database + Auth)

### 1. Clone & Install

```bash
git clone https://github.com/ashendilantha/shadownet-ctf.git
cd shadownet-ctf
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
SHADOWNET_SUPABASE_URL=https://<your-project-ref>.supabase.co
SHADOWNET_SUPABASE_ANON_KEY=<your-anon-key>
SHADOWNET_SUPABASE_KEY=<your-service-role-key>
JWT_SECRET=<your-strong-jwt-secret>

# Optional: Direct Resend API for 1-click confirmation emails (bypasses Supabase's 2 emails/hr free SMTP limit)
# RESEND_API_KEY=re_xxxxxxxxx
# OTP_FROM_EMAIL=ShadowNet CTF <onboarding@resend.dev>
```

> **Tip:** To send unlimited verification emails via Supabase Auth for free, configure Custom SMTP (e.g., Gmail App Password or Resend SMTP) under **Supabase Dashboard → Authentication → SMTP Settings**, and ensure your app URLs (`http://localhost:3000/**` and your production domain) are in **Authentication → URL Configuration**.

### 3. Apply Database Migrations

Run the SQL migrations in `supabase/migrations/` in order on your Supabase SQL Editor:
1. `20261119000000_init_shadownet_schema.sql` — creates `users`, `challenges`, `hints`, `submissions`, `scores`, and seeds all 8 stages, 16 hints, and the default admin account.
2. `20261119020000_pending_registrations.sql` — creates `pending_registrations` for email-confirmed signups.
3. `20261119030000_hint_unlocks.sql` — creates `hint_unlocks` for persistent hint decryption & XP tracking.

### 4. Run the Web Platform

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

For a production build check:

```bash
npm run build
npm run start
```

### 5. Launch Challenge Lab Containers

Start the Dockerized targets:

```bash
docker compose up --build
```

For the Stage 8 VM cluster, see [stages/stage8-network/README.md](stages/stage8-network/README.md).

---

## Keep-Alive & Continuous Uptime

To prevent Supabase Free tier databases from auto-pausing after 7 days of inactivity:

- **Vercel Daily Cron** (`vercel.json`) automatically pings `GET /api/cron/keep-alive` every day at `08:00 UTC`.
- **GitHub Actions** (`.github/workflows/supabase-keep-alive.yml`) independently pings the Supabase REST API every 2 days and supports manual runs via `workflow_dispatch`.

---

## Academic Context

- **Module:** IE3132 — Penetration Testing
- **Degree:** BSc (Hons) in Information Technology, SLIIT
- **Purpose:** Strictly for educational, authorized cybersecurity training inside isolated sandbox environments.
