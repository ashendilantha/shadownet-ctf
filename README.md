# ShadowNet CTF

A cybersecurity training platform and capture-the-flag (CTF) environment designed for hands-on penetration testing exercises. ShadowNet CTF blends a fictional narrative with practical security challenges, allowing players to progress through staged attacks, exploit scenarios, and defensive analysis in a structured learning path.

The project combines a modern web dashboard, challenge assets, and Docker-based environments to simulate a realistic adversarial workflow against a fictional target organization, NexaCorp.

## Overview

ShadowNet CTF is built around a narrative in which players assume the role of a covert operative inside the ShadowNet underground collective. The objective is to infiltrate the internal systems of NexaCorp by solving progressively difficult security challenges across reconnaissance, steganography, cryptography, web exploitation, Linux privilege escalation, reverse engineering, and network pivoting.

This repository contains:

- A Next.js-based CTF platform and dashboard
- Challenge modules for multiple security categories
- Dockerized vulnerable services and lab environments
- Challenge documentation and instructional writeups
- A structured progression model for team-based or individual play

## Project Highlights

- Progressive attack chain across staged cyber exercises
- Interactive dashboard with user tracking and leaderboard flow
- Authentication and user account handling via Supabase and JWT-based patterns
- Realistic challenge themes inspired by offensive security workflows
- Docker-supported lab infrastructure for isolated challenge execution
- Built for educational and training use in Penetration Testing coursework

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Docker & Docker Compose
- Node.js / npm
- ESLint

## Challenge Structure

The project includes a multi-stage attack path designed to teach a broad range of offensive security techniques.

| Stage | Focus Area | Difficulty | Delivery |
| --- | --- | --- | --- |
| 1 | OSINT / Reconnaissance | Easy | Web |
| 2 | Steganography | Medium | Web |
| 3 | Cryptography | Medium | Web |
| 4 | Web Security | Medium | Docker |
| 5 | Linux / System Security | Medium-Hard | Docker |
| 6 | Reverse Engineering | Hard | Docker / Local Binary |
| 7 | Linux Security / Privilege Escalation | Hard | Docker |
| 8 | Networking / Pivoting | Hard | VM / Network Lab |

Each stage is designed to simulate a realistic stage in an intrusion campaign, from initial recon to lateral movement and data exfiltration.

## Repository Layout

```text
.
├── docs/                     # Project documentation, diagrams, and planning materials
├── public/                   # Static assets and publicly served resources
├── src/                      # Next.js application source
│   ├── app/                  # App routes, pages, and dashboard views
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility logic and app helpers
│   └── types/               # Shared TypeScript types
├── stages/                   # Per-stage challenge content and supporting files
│   ├── stage1-osint/
│   ├── stage2-stego/
│   ├── stage3-crypto/
│   ├── stage4-web/
│   ├── stage5-linux/
│   ├── stage6-reverse-engineering/
│   ├── stage7-linux-security/
│   └── stage8-network/
├── supabase/                 # Supabase-related configuration and database assets
├── docker-compose.yml        # Root docker orchestration for challenge services
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Project scripts and dependencies
├── postcss.config.mjs       # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Deployment configuration for Vercel
├── README.md                # Project overview and setup guide
├── .gitignore               # Git ignore rules
└── package-lock.json        # Lockfile for dependency integrity
```

## Application Flow

The platform is structured as a cyber-themed training portal with the following user interactions:

1. Operatives register or sign in to the platform
2. They access the challenge dashboard and mission briefing area
3. They complete sequential security objectives in order
4. Each challenge validates a flag or success condition
5. Progress is tracked across the platform and leaderboard flow

## Getting Started

### Prerequisites

Before running the project locally, ensure the following are installed:

- Node.js 20 or later
- npm
- Docker
- Docker Compose

### Installation

Clone the repository:

```bash
git clone https://github.com/ashendilantha/shadownet-ctf.git
cd shadownet-ctf
```

Install dependencies:

```bash
npm install
```

### Run the Web Application

Start the development server:

```bash
npm run dev
```

Then open the application in a browser:

```text
http://localhost:3000
```

### Run the Challenge Infrastructure

Some challenge stages are packaged as Docker services and can be started via the repository-level Compose file:

```bash
docker compose up --build
```

This is useful for running the modular lab environments required by the security challenge content.

## Environment Notes

This project integrates with Supabase and may require environment configuration depending on your deployment and local setup. Ensure your local environment includes the required keys and configuration for authentication and database flows before running the full platform.

## Documentation

Additional project documentation and design materials can be found in the `docs/` directory, including architecture, planning, and challenge documentation.

## Educational Context

ShadowNet CTF is intended for educational use in cybersecurity and penetration testing coursework. It is designed to provide a realistic, story-driven progression for learning ethical offensive techniques in a controlled and instructional environment.

## Project Context

This repository is associated with:

- IE3132 - Penetration Testing
- BSc (Hons) IT - SLIIT

## Contributing

Contributions, improvements, and feedback are welcome. If you are working on challenge content, infrastructural improvements, or user experience enhancements, consider opening a discussion or contributing changes through a pull request.

## License

This project does not currently declare an explicit license in the repository metadata. Please review the repository and project context before using it in a production or public distribution setting.

## Summary

ShadowNet CTF is a structured, narrative-driven cybersecurity CTF platform that blends web development, challenge engineering, and offensive security education into a single training experience. It is intended to simulate the path of an attacker moving through increasingly complex systems while reinforcing practical, realistic security concepts.
