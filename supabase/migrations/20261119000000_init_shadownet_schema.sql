-- ShadowNet CTF Database Schema & Seed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  team_name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  delivery_method TEXT NOT NULL DEFAULT 'docker',
  stage_number INTEGER UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  flag_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hints (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  hint_level INTEGER NOT NULL DEFAULT 1,
  hint_text TEXT NOT NULL,
  point_penalty INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  submitted_flag TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scores (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  challenges_solved INTEGER NOT NULL DEFAULT 0,
  last_submission_at TIMESTAMPTZ
);

-- Seed Challenges
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (1, 'NexaCorp Reconnaissance', 'OSINT', 'Easy', 'The ShadowNet collective begins its campaign against NexaCorp by mapping its public-facing footprint. Analyze the exposed corporate web perimeter, inspect leaked metadata, and crawl employee directories to extract initial operative intelligence.', 100, 'static', 1, true, 'e0a233f083e30d3a7637942f76bd6e607da302fe660a6933cdbe944be045d7e3')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (2, 'Covert Transmissions', 'Steganography', 'Medium', 'A rogue NexaCorp insider smuggled out an encrypted surveillance transmission bundle before going silent. NexaCorp automated counter-measures flooded the frequency with 26 decoy jamming audio streams. Demodulate the authentic carrier wave and recover the whistleblower payload.', 150, 'static', 2, true, 'b6e0ec44a6f19b20fd168c8f54fb72f15da47ca1fe40664eeca380b72edc0e6a')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (3, 'Cipher Oracle', 'Cryptography', 'Medium', 'ShadowNet has established a raw TCP socket connection to NexaCorp internal cryptographic oracle daemon. The service encrypts user-supplied input alongside an ultra-secret executive key. Exploit chosen-ciphertext differential byte leakage to reconstruct the master key.', 200, 'docker', 3, true, 'b018c0eb059172ccbb615545743f19e37aade9cc14d1543e085b74aa3d20ff71')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (4, 'NexaAuth Portal Bypass', 'Web Security', 'Medium', 'The collective arrives at NexaCorp internal Single Sign-On gateway. The login endpoint interacts with a backend SQL database using unsanitized string formatting. Construct a crafted SQL injection query to bypass corporate authentication as administrator.', 250, 'docker', 4, true, 'd90c0f18b91fb660b7220d64acf2d8cab01f036bed799be159eeff4868a56e15')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (5, 'PRNG Token Predictor', 'Scripting', 'Medium', 'NexaCorp uses an automated session token dispenser running on TCP port 5005. The token generator relies on a flawed Linear Congruential Generator (LCG) pseudo-random algorithm. Sample consecutive outputs, compute the internal state parameters, and predict future session keys.', 300, 'docker', 5, true, '0780a0af58a241eedbf4be2d16d20db2a1de53fb15de67227c9fa72bf06dee62')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (6, 'Binary Disassembly', 'Reverse Engineering', 'Hard', 'Operatives have retrieved a compiled binary running on NexaCorp internal security gateway. The binary contains proprietary verification routines with anti-debugging traps. Decompile the ELF executable in Ghidra/GDB to reverse engineer the internal license algorithm.', 350, 'docker', 6, true, 'fd3d0b418bd9694f341115296b42b56cb207b3bb25a1e1519d98b6baf9d1e5f0')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (7, 'Privilege Escalation', 'Linux Security', 'Hard', 'ShadowNet holds low-privileged shell access on a central NexaCorp server. Enumerate system binaries, misconfigured SUID permissions, and unquoted PATH vulnerabilities to escalate execution to UID 0 (root).', 400, 'docker', 7, true, '1f9724cbb2394237d7125762509feeb7ed45b3a3f5d6fea7d47bf1feff6de07a')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;
INSERT INTO public.challenges (id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active, flag_hash)
VALUES (8, 'Core Infrastructure Breach', 'Network Pivoting', 'Hard', 'The final capstone operation. NexaCorp internal MySQL database containing its most sensitive corporate records is completely isolated from the internet. Exploit a Server-Side Request Forgery (SSRF) flaw on the entry host to pivot across the internal network, query the metadata service, and dump the database.', 500, 'vms', 8, true, 'b5866b5459113fd0f08bdf5ddefd295498c98af44c36c0b3ab8387ce3d8c44c0')
ON CONFLICT (stage_number) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  delivery_method = EXCLUDED.delivery_method,
  flag_hash = EXCLUDED.flag_hash;

SELECT setval(pg_get_serial_sequence('public.challenges', 'id'), COALESCE((SELECT MAX(id) FROM public.challenges), 1), true);

-- Seed Default Hints (only if hints table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.hints LIMIT 1) THEN
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (1, 1, 'Inspect the HTML source comments and look for unscrubbed developer remarks containing internal deployment coordinates.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (1, 2, 'Examine custom HTTP response headers returned by the server for exposed debugging keys and author metadata.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (2, 1, 'The whistleblower concealed an encrypted document inside the drone photo exhibit. Use the bunker emergency codeword "shelter" as the steganography extraction passphrase.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (2, 2, 'Out of the 27 audio files, carrier channel 14 carries the authentic signal. Analyze its frequency spectrogram in an audio analysis tool to visually read the hidden flag.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (3, 1, 'The encryption oracle operates in Electronic Codebook (ECB) mode, meaning identical plaintext 16-byte blocks always produce identical ciphertext blocks.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (3, 2, 'Supply crafted padding to push one secret character at a time into the last byte of a target block, allowing you to guess and recover the key byte-by-byte.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (4, 1, 'The login query uses string concatenation for the username parameter. Injecting quote characters breaks the SQL syntax and allows adding custom logic conditions.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (4, 2, 'Use an OR condition that is always true combined with comment delimiters to bypass the password verification check and sign in as administrator.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (5, 1, 'The token generator generates numbers using a standard Linear Congruential Generator recurrence formula with fixed multiplier and increment constants.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (5, 2, 'Collecting several consecutive numbers from the stream lets you solve a system of linear congruences to deduce the modulus, multiplier, and next output token.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (6, 1, 'Decompile the binary and locate the key validation function. Look at how user input is iterated over in a loop.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (6, 2, 'The verification logic applies a symmetric bitwise XOR transformation to your input. Reversing the static reference array reveals the expected key.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (7, 1, 'Search for executables owned by root that have the setuid permission bit enabled across the local filesystem.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (7, 2, 'Inspect the strings and system calls in the custom backup binary to check if it calls sub-utilities without full absolute paths, enabling PATH environment hijacking.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (8, 1, 'The entry web portal accepts URL inputs that can be manipulated to make internal HTTP requests to the local cloud link-local metadata address.', 40);
    INSERT INTO public.hints (challenge_id, hint_level, hint_text, point_penalty) VALUES (8, 2, 'Extract the database connection credentials from the metadata endpoint, then use network pivoting or port forwarding to authenticate to the isolated internal MySQL server.', 40);
  END IF;
END $$;

-- Seed Default Admin User (admin / admin123)
INSERT INTO public.users (username, password_hash, email, team_name, is_admin)
VALUES ('admin', '$2a$10$B.Z9/rmSV8OBw6UGaC89DOkU9mQvLzfQBSXCRdFsytdlA/xRDwAvO', 'admin@shadownet.ctf', 'ShadowNet Command', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.scores (user_id, total_points, challenges_solved)
SELECT id, 0, 0 FROM public.users WHERE username = 'admin'
ON CONFLICT (user_id) DO NOTHING;
