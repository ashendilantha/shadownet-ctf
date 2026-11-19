import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabase, createSupabaseAuthClient } from '@/lib/supabase';
import { signJWT } from '@/lib/auth';

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
    const rawOtp = typeof body.otp === 'string' ? body.otp.replace(/\s+/g, '') : '';

    if (!rawEmail || !rawOtp) {
      return NextResponse.json(
        { error: 'Email and OTP code are required.' },
        { status: 400 }
      );
    }

    if (!/^\d{6,8}$/.test(rawOtp)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6 to 8 digit numeric OTP code.' },
        { status: 400 }
      );
    }

    // Mode 1: Verify against public.email_otps if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      const { data: record, error: fetchError } = await supabase
        .from('email_otps')
        .select('email, otp_hash, expires_at, attempts')
        .eq('email', rawEmail)
        .maybeSingle();

      if (fetchError || !record) {
        return NextResponse.json(
          { error: 'No active OTP found for this email. Please request a new code.' },
          { status: 400 }
        );
      }

      if (record.attempts >= 5) {
        await supabase.from('email_otps').delete().eq('email', rawEmail);
        return NextResponse.json(
          { error: 'Too many invalid attempts. Please request a new OTP code.' },
          { status: 429 }
        );
      }

      if (new Date(record.expires_at).getTime() < Date.now()) {
        await supabase.from('email_otps').delete().eq('email', rawEmail);
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new verification code.' },
          { status: 400 }
        );
      }

      const expectedHash = hashOtp(rawEmail, rawOtp);
      if (expectedHash !== record.otp_hash) {
        await supabase
          .from('email_otps')
          .update({ attempts: record.attempts + 1 })
          .eq('email', rawEmail);

        return NextResponse.json(
          { error: 'Invalid OTP code. Please check your email and try again.' },
          { status: 400 }
        );
      }

      // Valid — consume OTP so it cannot be reused
      await supabase.from('email_otps').delete().eq('email', rawEmail);
    } else {
      // Mode 2: Verify via Supabase Built-in Auth OTP
      const authClient = createSupabaseAuthClient();

      let verifyRes = await authClient.auth.verifyOtp({
        email: rawEmail,
        token: rawOtp,
        type: 'email',
      });

      // Fallback to 'signup' type for brand-new Supabase auth users
      if (verifyRes.error) {
        verifyRes = await authClient.auth.verifyOtp({
          email: rawEmail,
          token: rawOtp,
          type: 'signup',
        });
      }

      if (verifyRes.error) {
        console.error('Supabase verify OTP error:', verifyRes.error);
        return NextResponse.json(
          { error: 'Invalid or expired OTP code. Please check your email and try again.' },
          { status: 400 }
        );
      }
    }

    // Mint a short-lived signed verification token proving this email was OTP-verified
    const verificationToken = await signJWT(
      {
        sub: rawEmail,
        username: rawEmail,
        email: rawEmail,
        purpose: 'email_verified',
      },
      '15m'
    );

    return NextResponse.json({
      verified: true,
      email: rawEmail,
      verification_token: verificationToken,
      message: 'Email verified! You can now complete your enrollment.',
    });
  } catch (error) {
    console.error('Verify OTP server error:', error);
    return NextResponse.json(
      { error: 'Internal server error while verifying OTP.' },
      { status: 500 }
    );
  }
}
