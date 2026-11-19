import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabase, createSupabaseAuthClient } from '@/lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashOtp(email: string, otp: string): string {
  return crypto
    .createHash('sha256')
    .update(`${email.toLowerCase()}:${otp}`)
    .digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Ensure email is not already registered in public.users
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .ilike('email', rawEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email address is already registered to another operative.' },
        { status: 409 }
      );
    }

    // Mode 1: Resend API (if RESEND_API_KEY is configured — sends a crisp 6-digit OTP directly)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const otpCode = String(crypto.randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error: upsertError } = await supabase
        .from('email_otps')
        .upsert(
          {
            email: rawEmail,
            otp_hash: hashOtp(rawEmail, otpCode),
            expires_at: expiresAt,
            attempts: 0,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );

      if (upsertError) {
        console.error('Failed to store OTP:', upsertError);
        return NextResponse.json(
          { error: 'Failed to initialize OTP verification. Please try again.' },
          { status: 500 }
        );
      }

      const fromAddress = process.env.OTP_FROM_EMAIL || 'ShadowNet CTF <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [rawEmail],
          subject: 'ShadowNet CTF — Your Email Verification OTP',
          html: `
            <div style="font-family:monospace;background:#070B14;color:#F8FAFC;padding:28px;border-radius:12px;border:1px solid #1E293B;">
              <h2 style="color:#9FEF00;margin:0 0 12px;">SHADOWNET COLLECTIVE // OTP UPLINK</h2>
              <p style="color:#A4B1CD;font-size:14px;">Use the 6-digit verification code below to confirm your operative email address:</p>
              <div style="font-size:32px;font-weight:900;letter-spacing:8px;color:#9FEF00;background:#0F172A;padding:16px 24px;border-radius:8px;display:inline-block;margin:16px 0;border:1px solid #334155;">
                ${otpCode}
              </div>
              <p style="color:#6B7894;font-size:12px;">This code expires in 10 minutes. If you did not request enrollment, ignore this transmission.</p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error('Resend API error:', errText);
        return NextResponse.json(
          { error: 'Email delivery failed. Please verify your email address or try again shortly.' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        message: 'A 6-digit verification OTP has been sent to your email.',
        provider: 'resend',
        otp_length: 6,
      });
    }

    // Mode 2: Supabase Built-in Auth OTP (zero extra config)
    const authClient = createSupabaseAuthClient();
    const { error: otpError } = await authClient.auth.signInWithOtp({
      email: rawEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (otpError) {
      console.error('Supabase send OTP error:', otpError);
      const isRateLimit =
        otpError.status === 429 ||
        otpError.message.toLowerCase().includes('rate limit') ||
        otpError.message.toLowerCase().includes('security purposes');

      return NextResponse.json(
        {
          error: isRateLimit
            ? 'Too many OTP requests. Please wait a minute before requesting a new code.'
            : otpError.message || 'Failed to send verification OTP.',
        },
        { status: isRateLimit ? 429 : 400 }
      );
    }

    return NextResponse.json({
      message: 'Verification OTP sent! Check your inbox (and spam folder) for the code.',
      provider: 'supabase',
      otp_length: 8,
    });
  } catch (error) {
    console.error('Send OTP server error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending OTP.' },
      { status: 500 }
    );
  }
}
