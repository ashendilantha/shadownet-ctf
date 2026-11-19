import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, createSupabaseAuthClient } from '@/lib/supabase';
import { signJWT } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { username, password, email, team_name } = await request.json();

    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanTeam = typeof team_name === 'string' && team_name.trim() ? team_name.trim() : null;

    if (!cleanUsername || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'A valid email address is required to verify your account.' },
        { status: 400 }
      );
    }

    // Check if username already exists in active users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken.' },
        { status: 409 }
      );
    }

    // Check if email already exists in active users
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in.' },
        { status: 409 }
      );
    }

    // Hash password and store pending registration until user clicks the email link
    const password_hash = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    const { error: pendingError } = await supabase
      .from('pending_registrations')
      .upsert(
        {
          email: cleanEmail,
          username: cleanUsername,
          password_hash,
          team_name: cleanTeam,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (pendingError) {
      console.error('Pending registration save error:', pendingError);
      return NextResponse.json(
        { error: 'Could not prepare account verification. Please try again.' },
        { status: 500 }
      );
    }

    // Determine redirect URL back to this app's /auth/confirm page
    const origin =
      request.headers.get('origin') ||
      request.nextUrl.origin ||
      'https://shadownet-ctf.vercel.app';

    // Mode 1: Direct Resend API (if RESEND_API_KEY is configured — avoids Supabase's 2 emails/hour free limit)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const verifyToken = await signJWT(
        {
          sub: cleanEmail,
          username: cleanUsername,
          email: cleanEmail,
          purpose: 'confirm_link',
        },
        '1h'
      );

      const confirmLink = `${origin}/auth/confirm?verify_token=${encodeURIComponent(verifyToken)}`;
      const fromAddress = process.env.OTP_FROM_EMAIL || 'ShadowNet CTF <onboarding@resend.dev>';

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [cleanEmail],
          subject: 'ShadowNet CTF — Confirm your email address',
          html: `
            <div style="font-family:monospace;background:#070B14;color:#F8FAFC;padding:28px;border-radius:12px;border:1px solid #1E293B;">
              <h2 style="color:#9FEF00;margin:0 0 12px;">SHADOWNET COLLECTIVE // EMAIL CONFIRMATION</h2>
              <p style="color:#A4B1CD;font-size:14px;">Click the button below to confirm your email address and activate your operative account (<strong>${cleanUsername}</strong>):</p>
              <a href="${confirmLink}" style="display:inline-block;margin:18px 0;padding:12px 24px;background:#9FEF00;color:#070B14;font-weight:900;text-decoration:none;border-radius:8px;">Confirm Email &amp; Create Account</a>
              <p style="color:#6B7894;font-size:12px;">This link expires in 1 hour. If you did not register, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error('Resend API error:', errText);
        return NextResponse.json(
          { error: 'Email delivery failed via Resend. Check RESEND_API_KEY and sender configuration.' },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          pending: true,
          email: cleanEmail,
          message: 'Verification link sent! Open your email and click "Confirm Email & Create Account".',
        },
        { status: 202 }
      );
    }

    // Mode 2: Supabase Built-in Auth confirmation email
    const redirectUrl = `${origin}/auth/confirm`;
    const authClient = createSupabaseAuthClient();
    const { error: emailError } = await authClient.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    });

    if (emailError) {
      console.error('Supabase confirmation email error:', emailError);
      const lowerMsg = emailError.message.toLowerCase();
      const isHourlyLimit = lowerMsg.includes('rate limit');
      const isCooldown = lowerMsg.includes('security purposes');

      if (isHourlyLimit || isCooldown || emailError.status === 429) {
        return NextResponse.json(
          {
            error: isHourlyLimit
              ? 'Supabase free email limit reached (max 2 emails/hour on default SMTP). Wait for the hourly reset, or configure Custom SMTP in Supabase / RESEND_API_KEY in Vercel.'
              : 'Verification email recently sent. Please wait 60 seconds or check your inbox/spam folder.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: emailError.message || 'Failed to send verification link.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        pending: true,
        email: cleanEmail,
        message: 'Verification link sent! Open your email and click "Confirm email address" to finish creating your account.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Registration server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
