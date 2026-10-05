# 🚀 ShadowNet CTF — Next.js + Vercel Migration Guide

## Migration from Flask to Next.js & Vercel Deployment

**Status:** Production-Ready  
**Platform:** Vercel (free tier)  
**Framework:** Next.js 13+ (App Router)  
**Database:** Supabase (PostgreSQL, free tier)  
**Challenges:** All 8 stages ✅ Compatible  

---

## 📁 **PART 1: New Next.js Folder Structure**

```
shadownet-ctf/
├── README.md
├── .gitignore
├── .env.local                    # Local env variables
├── .env.example                  # Example env file
├── vercel.json                   # Vercel config
├── package.json                  # Node dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
│
├── public/                       # Static assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── shadownet-banner.png
│   │   └── favicon.ico
│   └── assets/                   # Stage 1-2 static files
│       ├── stage1/
│       │   ├── mock-site.html
│       │   └── company_logo.jpg
│       └── stage2/
│           ├── whistleblower.jpg
│           └── message.mp3
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   │
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── logout/
│   │   │       └── route.ts
│   │   │
│   │   ├── dashboard/            # Main dashboard
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── challenges/
│   │   │   │   ├── page.tsx      # All challenges
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Challenge detail
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx
│   │   │   └── progress/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/                # Admin panel
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   └── stats/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                  # API routes (backend)
│   │       ├── auth/
│   │       │   ├── register/
│   │       │   │   └── route.ts  # User registration
│   │       │   ├── login/
│   │       │   │   └── route.ts  # User login
│   │       │   └── verify/
│   │       │       └── route.ts  # JWT verification
│   │       │
│   │       ├── challenges/
│   │       │   ├── route.ts      # Get all challenges
│   │       │   └── [id]/
│   │       │       └── route.ts  # Get challenge detail
│   │       │
│   │       ├── submissions/
│   │       │   └── route.ts      # Submit flag
│   │       │
│   │       ├── scores/
│   │       │   ├── leaderboard/
│   │       │   │   └── route.ts  # Get leaderboard
│   │       │   └── progress/
│   │       │       └── route.ts  # Get user progress
│   │       │
│   │       ├── admin/
│   │       │   ├── reset/
│   │       │   │   └── route.ts  # Reset scores
│   │       │   └── stats/
│   │       │       └── route.ts  # Get stats
│   │       │
│   │       └── hints/
│   │           └── [id]/
│   │               └── route.ts  # Get challenge hints
│   │
│   ├── components/               # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ChallengeCard.tsx
│   │   ├── LeaderboardTable.tsx
│   │   ├── FlagSubmitForm.tsx
│   │   ├── ProgressBar.tsx
│   │   └── AdminPanel.tsx
│   │
│   ├── lib/                      # Utility functions
│   │   ├── supabase.ts           # Supabase client
│   │   ├── auth.ts               # Auth utilities
│   │   ├── crypto.ts             # Flag hashing
│   │   ├── api-client.ts         # Fetch wrapper
│   │   └── constants.ts          # Constants
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLeaderboard.ts
│   │   └── useChallenges.ts
│   │
│   ├── styles/                   # CSS modules
│   │   ├── Dashboard.module.css
│   │   ├── Challenges.module.css
│   │   ├── Leaderboard.module.css
│   │   └── Admin.module.css
│   │
│   └── types/                    # TypeScript types
│       ├── index.ts
│       ├── user.ts
│       ├── challenge.ts
│       └── submission.ts
├── stages/                            # All 8 challenge stages
│   ├── stage1-osint/                  # [DELIVERY: Static Web Files]
│   │   ├── README.md                  # Setup instructions
│   │   ├── assets/
│   │   │   ├── mock-site.html         # Mock NexaCorp website
│   │   │   ├── employee-profile.html  # Fake employee profile
│   │   │   └── company_logo.jpg       # Image with EXIF metadata
│   │   └── flag.txt                   # SHADOWNET{OSINT_RECONNAISSANCE}
│   │
│   ├── stage2-steganography/          # [DELIVERY: Static Web Files]
│   │   ├── README.md
│   │   ├── assets/
│   │   │   ├── whistleblower.jpg      # Image with hidden passphrase (steghide)
│   │   │   ├── message.mp3            # Audio with spectrogram data
│   │   │   └── setup.sh               # Script to embed files
│   │   └── flag.txt                   # SHADOWNET{STEGANOGRAPHY_DECODED}
│   │
│   ├── stage3-cryptography/           # [DELIVERY: Docker Container]
│   │   ├── README.md
│   │   ├── Dockerfile                 # Container definition
│   │   ├── oracle.py                  # Vigenère encryption oracle
│   │   ├── requirements.txt           # Python dependencies
│   │   ├── .env                       # Environment variables (KEY, FLAG)
│   │   └── entrypoint.sh              # Container startup script
│   │
│   ├── stage4-web-security/           # [DELIVERY: Docker Container]
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── app.py                     # Vulnerable Flask/Node.js app (SQLi)
│   │   ├── requirements.txt
│   │   ├── database.db                # Pre-populated SQLite DB
│   │   ├── init_db.sql                # SQL schema & data
│   │   └── entrypoint.sh
│   │
│   ├── stage5-scripting/              # [DELIVERY: Docker Container]
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── token_service.py           # LCG token generator
│   │   ├── requirements.txt
│   │   └── entrypoint.sh
│   │
│   ├── stage6-reverse-engineering/    # [DELIVERY: Isolated Ubuntu VM]
│   │   ├── README.md
│   │   ├── build_binary.sh            # Script to compile target binary
│   │   ├── source.c                   # C source with hardcoded flag
│   │   ├── target.bin                 # Compiled 64-bit ELF (pre-built)
│   │   ├── vm_setup.sh                # VM provisioning script
│   │   └── tools_install.sh           # Install Ghidra, strings, objdump
│   │
│   ├── stage7-linux-security/         # [DELIVERY: Dedicated Ubuntu VM]
│   │   ├── README.md
│   │   ├── vm_setup.sh                # VM provisioning & misconfiguration
│   │   ├── setup_privesc.sh           # Create SUID binary / cron job
│   │   ├── vulnerable_binary.c        # Exploitable SUID binary
│   │   ├── cron_job.sh                # Alternative priv-esc vector
│   │   └── sudoers_config             # Sudo misconfiguration
│   │
│   └── stage8-networking/             # [DELIVERY: VM Cluster (Entry + DB)]
│       ├── README.md
│       ├── entry-host/
│       │   ├── vm_setup.sh            # Entry VM provisioning
│       │   ├── app.py                 # Node.js app with SSRF endpoint
│       │   ├── Dockerfile             # Build for quick testing
│       │   └── requirements.txt
│       ├── db-host/
│       │   ├── vm_setup.sh            # DB VM provisioning
│       │   ├── metadata_service.py    # Flask metadata service (port 8080)
│       │   ├── init_mysql.sql         # MySQL database init
│       │   └── requirements.txt
│       └── network_config.sh          # VLAN/subnet isolation setup
│
├── docker/                            # Docker configurations
│   ├── docker-compose.yml             # Orchestration file (stages 3-5)
│   ├── Dockerfile.stage3              # Crypto oracle Dockerfile
│   ├── Dockerfile.stage4              # Web security Dockerfile
│   └── Dockerfile.stage5              # Scripting Dockerfile
│
├── vms/                               # VM setup & provisioning
│   ├── stage6_re_sandbox.ova          # Pre-built VM image (optional)
│   ├── stage7_linux_security.ova      # Pre-built VM image (optional)
│   ├── stage8_entry_host.ova          # Pre-built VM image (optional)
│   ├── stage8_db_host.ova             # Pre-built VM image (optional)
│   ├── ubuntu_base.sh                 # Base Ubuntu 22.04 setup (for all VMs)
│   ├── network_setup.sh               # Configure VLAN/isolation
│   └── snapshot_manager.sh            # Create/revert snapshots
│
├── tests/                             # Testing & verification
│   ├── test_all_stages.sh             # Full integration test
│   ├── test_stage1.sh                 # OSINT validation
│   ├── test_stage2.sh                 # Steganography validation
│   ├── test_stage3.sh                 # Crypto oracle test
│   ├── test_stage4.sh                 # SQLi vulnerability test
│   ├── test_stage5.sh                 # Token prediction test
│   ├── test_stage6.sh                 # Binary analysis test
│   ├── test_stage7.sh                 # Priv-esc test
│   └── test_stage8.sh                 # Pivoting test
│
├── docs/                              # Documentation
│   ├── DEPLOYMENT.md                  # Deployment guide
│   ├── ADMIN_GUIDE.md                 # Admin operations
│   ├── TROUBLESHOOTING.md             # Common issues & fixes
│   └── ARCHITECTURE.md                # Detailed architecture
│
└── scripts/                           # Utility scripts
    ├── reset_all.sh                   # Reset all challenges
    ├── backup_db.sh                   # Backup scores database
    ├── monitor_resources.sh           # Monitor CPU/RAM/disk
    └── build_all.sh                   # Master build script
```

---

## 🗑️ **PART 2: Files to DELETE (Flask → Next.js)**

### **Delete These Flask Files:**

```bash
# OLD Dashboard (delete entire folder)
rm -rf dashboard/
   ├── app.py              # ❌ DELETE
   ├── database.py         # ❌ DELETE
   ├── requirements.txt    # ❌ DELETE
   ├── Dockerfile          # ❌ DELETE
   ├── templates/          # ❌ DELETE
   ├── static/             # ❌ DELETE
   └── database.db         # ❌ DELETE

# OLD Docker Compose (if dashboard was there)
rm docker-compose.yml      # ⚠️ MODIFY (keep challenges only)
```

### **Keep These:**

```bash
# ✅ ALL CHALLENGES (completely unchanged)
stages/stage1-osint/       # ✅ KEEP
stages/stage2-steganography/ # ✅ KEEP
stages/stage3-cryptography/  # ✅ KEEP
stages/stage4-web-security/  # ✅ KEEP
stages/stage5-scripting/     # ✅ KEEP
stages/stage6-reverse-engineering/ # ✅ KEEP
stages/stage7-linux-security/      # ✅ KEEP
stages/stage8-networking/          # ✅ KEEP

# ✅ Docker config (modify to remove dashboard)
docker-compose.yml         # ✅ MODIFY
```

---

## 🔧 **PART 3: Environment Setup**

### **3.1 Install Dependencies**

```bash
# Node.js and npm (required)
sudo apt install -y nodejs npm

# Verify installation
node --version  # v18+
npm --version   # v9+

# Install Vercel CLI (for local deployment testing)
npm install -g vercel

# Create Next.js project
npx create-next-app@latest shadownet-ctf --typescript --tailwind --eslint
cd shadownet-ctf
```

### **3.2 Install Required Packages**

**File: `package.json`**

```json
{
  "name": "shadownet-ctf",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "jose": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.28",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "^14.0.0"
  }
}
```

**Install:**
```bash
npm install
```

---

## 🗄️ **PART 4: Database Setup (Supabase)**

### **4.1 Create Supabase Project**

1. Go to https://supabase.com
2. Create new project
3. Get `SUPABASE_URL` and `SUPABASE_ANON_KEY`
4. Save in `.env.local`

### **4.2 Database Schema**

**File: `scripts/setup-db.sql`**

```sql
-- Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    team_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges Table
CREATE TABLE challenges (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    description TEXT,
    flag_hash TEXT NOT NULL,
    points INTEGER DEFAULT 100,
    delivery_method TEXT,
    stage_number INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Submissions Table
CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    challenge_id INTEGER NOT NULL REFERENCES challenges(id),
    submitted_flag TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scores Table
CREATE TABLE scores (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    total_points INTEGER DEFAULT 0,
    challenges_solved INTEGER DEFAULT 0,
    last_submission_at TIMESTAMP
);

-- Hints Table
CREATE TABLE hints (
    id BIGSERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id),
    hint_level INTEGER NOT NULL,
    hint_text TEXT NOT NULL,
    point_penalty INTEGER DEFAULT 10
);

-- Create indexes for performance
CREATE INDEX idx_submissions_user_challenge ON submissions(user_id, challenge_id);
CREATE INDEX idx_scores_total_points ON scores(total_points DESC);
```

---

## ⚙️ **PART 5: Environment Variables**

**File: `.env.example`**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (generate: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-key-here

# API Base URLs
NEXT_PUBLIC_API_URL=http://localhost:3000  # Local dev
# NEXT_PUBLIC_API_URL=https://shadownet-ctf.vercel.app  # Production

# Challenge Service URLs
STAGE3_CRYPTO_URL=http://localhost:5000
STAGE4_WEB_URL=http://localhost:3000
STAGE5_SCRIPT_URL=http://localhost:5001

# VM Challenge IPs (if running locally)
STAGE6_VM_IP=192.168.56.10
STAGE7_VM_IP=192.168.56.11
STAGE8_ENTRY_VM=192.168.56.20
STAGE8_DB_VM=192.168.56.21

# Admin settings
ADMIN_EMAIL=admin@shadownet.ctf
```

**File: `.env.local` (for local development)**

```bash
# Copy .env.example and fill in with your credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
# ... rest of variables
```

---

## 📱 **PART 6: Next.js API Routes (Replace Flask)**

### **6.1 Authentication API**

**File: `src/app/api/auth/register/route.ts`**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password, email, team_name } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash,
        email,
        team_name,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create score entry
    await supabase
      .from('scores')
      .insert({
        user_id: data.id,
      });

    return NextResponse.json(
      { message: 'User registered successfully', user: data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

**File: `src/app/api/auth/login/route.ts`**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const supabase = createServerComponentClient({ cookies });

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (!user || error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({
      sub: user.id,
      username: user.username,
      is_admin: user.is_admin,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Set secure cookie
    const response = NextResponse.json(
      { message: 'Login successful', user },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

### **6.2 Challenges API**

**File: `src/app/api/challenges/route.ts`**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('stage_number', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ challenges });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}
```

### **6.3 Flag Submission API**

**File: `src/app/api/submissions/route.ts`**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import crypto from 'crypto';

function hashFlag(flag: string): string {
  return crypto.createHash('sha256').update(flag).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { challenge_id, flag } = await request.json();

    const supabase = createServerComponentClient({ cookies });

    // Check if already solved
    const { data: existing } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.sub)
      .eq('challenge_id', challenge_id)
      .eq('is_correct', true)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Challenge already solved', correct: false },
        { status: 200 }
      );
    }

    // Get challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .single();

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Verify flag
    const flag_hash = hashFlag(flag);
    const is_correct = flag_hash === challenge.flag_hash;

    // Record submission
    const { error: submitError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.sub,
        challenge_id,
        submitted_flag: flag,
        is_correct,
      });

    if (submitError) throw submitError;

    // Update score if correct
    if (is_correct) {
      const { data: score } = await supabase
        .from('scores')
        .select('total_points, challenges_solved')
        .eq('user_id', user.sub)
        .single();

      await supabase
        .from('scores')
        .update({
          total_points: (score?.total_points || 0) + challenge.points,
          challenges_solved: (score?.challenges_solved || 0) + 1,
          last_submission_at: new Date().toISOString(),
        })
        .eq('user_id', user.sub);
    }

    return NextResponse.json(
      {
        correct: is_correct,
        message: is_correct ? 'Flag accepted!' : 'Incorrect flag',
        points: is_correct ? challenge.points : 0,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    );
  }
}
```

### **6.4 Leaderboard API**

**File: `src/app/api/scores/leaderboard/route.ts`**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const { data: leaderboard, error } = await supabase
      .from('scores')
      .select(`
        total_points,
        challenges_solved,
        last_submission_at,
        users:user_id (username, team_name)
      `)
      .order('total_points', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 **PART 7: React Components**

### **7.1 Challenge Card Component**

**File: `src/components/ChallengeCard.tsx`**

```typescript
import React from 'react';
import styles from '@/styles/Challenges.module.css';

interface Challenge {
  id: number;
  name: string;
  domain: string;
  difficulty: string;
  points: number;
  solved?: boolean;
}

export default function ChallengeCard({ challenge, solved }: { challenge: Challenge; solved?: boolean }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{challenge.name}</h3>
        {solved && <span className={styles.solved}>✅</span>}
      </div>
      
      <div className={styles.meta}>
        <span>{challenge.domain}</span>
        <span>{challenge.difficulty}</span>
        <span className={styles.points}>{challenge.points} pts</span>
      </div>
      
      <a href={`/dashboard/challenges/${challenge.id}`} className={styles.button}>
        View Challenge
      </a>
    </div>
  );
}
```

### **7.2 Flag Submit Form**

**File: `src/components/FlagSubmitForm.tsx`**

```typescript
'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface FlagSubmitFormProps {
  challengeId: number;
  onSuccess?: () => void;
}

export default function FlagSubmitForm({ challengeId, onSuccess }: FlagSubmitFormProps) {
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/submissions', {
        challenge_id: challengeId,
        flag,
      });

      setIsCorrect(response.data.correct);
      setMessage(response.data.message);

      if (response.data.correct) {
        setFlag('');
        onSuccess?.();
      }
    } catch (error: any) {
      setIsCorrect(false);
      setMessage(error.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
      <div>
        <label htmlFor="flag">Enter Flag:</label>
        <input
          type="text"
          id="flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="SHADOWNET{...}"
          disabled={loading}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Flag'}
      </button>

      {message && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            borderRadius: '5px',
            background: isCorrect ? '#d4edda' : '#f8d7da',
            color: isCorrect ? '#155724' : '#721c24',
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
}
```

---

## 🔗 **PART 8: How Challenges Connect to Vercel**

### **8.1 Architecture Overview**

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Next.js)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Frontend (React Components)                      │  │
│  │  - Login, Dashboard, Challenges, Leaderboard     │  │
│  └──────────────────┬────────────────────────────────┘  │
│                     │                                    │
│  ┌──────────────────▼────────────────────────────────┐  │
│  │  API Routes (/api)                                │  │
│  │  - Authentication (/auth)                         │  │
│  │  - Challenges (/challenges)                       │  │
│  │  - Submissions (/submissions)                     │  │
│  │  - Scores & Leaderboard (/scores)                 │  │
│  └──────────────────┬────────────────────────────────┘  │
│                     │                                    │
└─────────────────────┼────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
     ┌────────┐ ┌──────────┐ ┌────────────┐
     │Supabase│ │ Docker   │ │  VMs       │
     │(Users, │ │Services  │ │(Stages 6-8)│
     │Scores) │ │(Stage3-5)│ │            │
     └────────┘ └──────────┘ └────────────┘

     (Database)   (Challenges)  (Challenges)
```

### **8.2 Challenge Integration**

#### **Stages 1-2 (Static Files on Vercel)**

Static files are served directly from Vercel's CDN:

```typescript
// src/app/api/challenges/[id]/static/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Stages 1-2 are downloaded from /public/assets/
  // No API needed—browser fetches directly from Vercel
  
  return NextResponse.json({
    stage_number: parseInt(params.id),
    delivery: 'static',
    assets: [
      '/assets/stage1/mock-site.html',
      '/assets/stage2/whistleblower.jpg'
    ]
  });
}
```

#### **Stages 3-5 (Docker Services)**

Docker services run on a separate server/machine and are called from Vercel:

```typescript
// src/lib/challenge-services.ts
const DOCKER_SERVICES = {
  3: process.env.STAGE3_CRYPTO_URL || 'http://localhost:5000',
  4: process.env.STAGE4_WEB_URL || 'http://localhost:3000',
  5: process.env.STAGE5_SCRIPT_URL || 'http://localhost:5001',
};

export async function connectToDockerChallenge(stageNumber: number) {
  const url = DOCKER_SERVICES[stageNumber];
  if (!url) throw new Error(`Docker service not configured for stage ${stageNumber}`);
  
  return {
    baseUrl: url,
    // Players access via: docker-host:port
  };
}
```

#### **Stages 6-8 (VM Services)**

VM services are accessed via SSH/network:

```typescript
// src/lib/challenge-services.ts
const VM_SERVICES = {
  6: {
    type: 'vm',
    ssh_host: process.env.STAGE6_VM_IP,
    ssh_user: 'player',
    ssh_port: 22,
    description: 'SSH into Stage 6 VM for binary analysis',
  },
  7: {
    type: 'vm',
    ssh_host: process.env.STAGE7_VM_IP,
    ssh_user: 'player',
    ssh_port: 22,
    description: 'SSH into Stage 7 VM for privilege escalation',
  },
  8: {
    type: 'vm_cluster',
    entry_host: process.env.STAGE8_ENTRY_VM,
    db_host: process.env.STAGE8_DB_VM,
    description: 'Access Entry Host for network pivoting',
  },
};

export async function getVMChallenge(stageNumber: number) {
  return VM_SERVICES[stageNumber];
}
```

### **8.3 Challenge Detail Page (Dynamic)**

**File: `src/app/dashboard/challenges/[id]/page.tsx`**

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import FlagSubmitForm from '@/components/FlagSubmitForm';
import axios from 'axios';

interface Challenge {
  id: number;
  name: string;
  domain: string;
  difficulty: string;
  description: string;
  points: number;
  delivery_method: string;
}

export default function ChallengePage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await axios.get(`/api/challenges/${params.id}`);
        setChallenge(data.challenge);
        setHints(data.hints || []);
      } catch (error) {
        console.error('Failed to load challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!challenge) return <div>Challenge not found</div>;

  return (
    <div className="challenge-detail">
      <h1>{challenge.name}</h1>
      
      <div className="meta">
        <p><strong>Domain:</strong> {challenge.domain}</p>
        <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
        <p><strong>Points:</strong> {challenge.points}</p>
        <p><strong>Delivery:</strong> {challenge.delivery_method}</p>
      </div>

      <div className="description">
        <h2>Description</h2>
        <p>{challenge.description}</p>
      </div>

      {challenge.delivery_method === 'docker' && (
        <div className="info-box">
          ⚠️ This challenge runs on a Docker container.
          <br />
          Access instructions: Check your dashboard for connection details
        </div>
      )}

      {challenge.delivery_method === 'vm' && (
        <div className="info-box">
          ⚠️ This challenge requires SSH access to a VM.
          <br />
          Credentials will be provided in your dashboard
        </div>
      )}

      <FlagSubmitForm challengeId={challenge.id} />

      {hints.length > 0 && (
        <div className="hints-section">
          <h3>💡 Hints</h3>
          {hints.map((hint: any) => (
            <details key={hint.id}>
              <summary>Hint {hint.hint_level} ({hint.point_penalty} pt penalty)</summary>
              <p>{hint.hint_text}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 **PART 9: Vercel Deployment**

### **9.1 Vercel Configuration**

**File: `vercel.json`**

```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "JWT_SECRET": "@jwt_secret",
    "STAGE3_CRYPTO_URL": "@stage3_crypto_url",
    "STAGE4_WEB_URL": "@stage4_web_url",
    "STAGE5_SCRIPT_URL": "@stage5_script_url",
    "STAGE6_VM_IP": "@stage6_vm_ip",
    "STAGE7_VM_IP": "@stage7_vm_ip",
    "STAGE8_ENTRY_VM": "@stage8_entry_vm",
    "STAGE8_DB_VM": "@stage8_db_vm"
  },
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev"
}
```

### **9.2 Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables

# Production URL will be something like:
# https://shadownet-ctf.vercel.app
```

### **9.3 GitHub Integration (Recommended)**

```bash
# Push to GitHub
git remote add origin https://github.com/YourUsername/shadownet-ctf.git
git branch -M main
git push -u origin main

# In Vercel dashboard:
# 1. Connect GitHub account
# 2. Select shadownet-ctf repo
# 3. Select Next.js as framework
# 4. Add environment variables
# 5. Deploy (auto-deploys on push to main)
```

---

## 📊 **PART 10: Challenge Connection Summary**

| Stage | Delivery | Hosted On | How Players Access | Connection |
|-------|----------|-----------|--------------------| ---|
| **1** | Static | Vercel CDN | `/public/assets/stage1` | Direct link in dashboard |
| **2** | Static | Vercel CDN | `/public/assets/stage2` | Direct link in dashboard |
| **3** | Docker | Separate server | `STAGE3_CRYPTO_URL:5000` | API call from Vercel |
| **4** | Docker | Separate server | `STAGE4_WEB_URL:3000` | API call from Vercel |
| **5** | Docker | Separate server | `STAGE5_SCRIPT_URL:5001` | API call from Vercel |
| **6** | VM | Network | SSH to `STAGE6_VM_IP` | IP address in dashboard |
| **7** | VM | Network | SSH to `STAGE7_VM_IP` | IP address in dashboard |
| **8** | VM Cluster | Network | SSH to `STAGE8_ENTRY_VM` | IP address in dashboard |

---

## ✅ **PART 11: Modified docker-compose.yml**

**File: `docker-compose.yml` (Challenges Only - No Dashboard)**

```yaml
version: '3.8'

services:
  # ============= Stage 3: Cryptography =============
  stage3-crypto:
    build:
      context: ./challenges/stage3-cryptography
      dockerfile: Dockerfile
    container_name: stage3-crypto
    ports:
      - "5000:5000"
    networks:
      - challenges
    restart: unless-stopped
    environment:
      - KEY=SECRET

  # ============= Stage 4: Web Security =============
  stage4-web:
    build:
      context: ./challenges/stage4-web-security
      dockerfile: Dockerfile
    container_name: stage4-web
    ports:
      - "3000:3000"
    networks:
      - challenges
    restart: unless-stopped
    environment:
      - FLASK_ENV=production

  # ============= Stage 5: Scripting =============
  stage5-scripting:
    build:
      context: ./challenges/stage5-scripting
      dockerfile: Dockerfile
    container_name: stage5-scripting
    ports:
      - "5001:5001"
    networks:
      - challenges
    restart: unless-stopped

networks:
  challenges:
    driver: bridge
```

**Start only challenges (no dashboard):**
```bash
docker-compose up -d
```

---

## 🎯 **PART 12: Vercel + Challenges Compatibility**

### **✅ Works Great with Vercel:**

| Aspect | Status | Notes |
|--------|--------|-------|
| **Static Files (1-2)** | ✅ Perfect | Served from Vercel CDN |
| **API Routes** | ✅ Perfect | Serverless functions |
| **Database (Supabase)** | ✅ Perfect | Free tier available |
| **Docker Challenges (3-5)** | ✅ Works | Run separately, call via API |
| **VM Challenges (6-8)** | ✅ Works | Players SSH directly |
| **Authentication** | ✅ Perfect | JWT + cookies |
| **Leaderboard** | ✅ Perfect | Real-time via Supabase |
| **Free Tier** | ✅ Good | Vercel + Supabase free tier |

### **⚠️ Important Notes:**

1. **Docker services must run separately** (not on Vercel)
   - Can run on any server, VPS, or local machine
   - Vercel calls them via API (HTTP requests)

2. **VMs must have network access**
   - Players SSH directly (not through Vercel)
   - Vercel just shows instructions/IPs in dashboard

3. **Flags are validated on Vercel**
   - All flag hashes stored in Supabase
   - Scoring happens in Next.js API routes

4. **No backend to manage**
   - Vercel handles frontend + API
   - Supabase handles database
   - Docker/VMs handle challenge services

---

## 📝 **PART 13: Migration Checklist**

### **Before Migration:**

- [ ] Backup all challenge code
- [ ] Backup Flask database
- [ ] Create Supabase project
- [ ] Create Vercel account
- [ ] Export challenges to `.sql` file

### **Migration Steps:**

- [ ] Create Next.js project
- [ ] Install dependencies
- [ ] Set up Supabase schema
- [ ] Seed Supabase with challenge data
- [ ] Create API routes
- [ ] Build React components
- [ ] Set up environment variables
- [ ] Deploy to Vercel
- [ ] Test all stages
- [ ] Configure Docker services
- [ ] Connect VMs
- [ ] Full integration test

### **After Migration:**

- [ ] Test complete user journey
- [ ] Verify all challenges work
- [ ] Check leaderboard
- [ ] Test flag submission
- [ ] Verify flag hashing
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation complete

---

## 🎓 **Summary**

| Aspect | Before (Flask) | After (Next.js) |
|--------|---|---|
| **Hosting** | Self-hosted server | Vercel (free) |
| **Backend** | Flask (Python) | Next.js API (Node.js) |
| **Frontend** | HTML/CSS | React (Next.js) |
| **Database** | SQLite local | Supabase (PostgreSQL) |
| **Deployment** | Manual | Git + Auto-deploy |
| **Cost** | VPS (~$5/month) | Free (Vercel + Supabase) |
| **Challenges** | Same ✅ | Same ✅ |
| **Scalability** | Limited | Auto-scales |

---

**You're now ready to deploy to Vercel!** 🚀

All challenges remain the same and working. Only the dashboard/platform moves to Next.js + Vercel.