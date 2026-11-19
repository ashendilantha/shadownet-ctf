-- Table for storing hashed 6-digit email verification OTPs (used with Resend/SMTP)
CREATE TABLE IF NOT EXISTS public.email_otps (
  email TEXT PRIMARY KEY,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON public.email_otps (expires_at);
