import { NextRequest, NextResponse } from 'next/server';
import { supabase, createSupabaseAuthClient } from '@/lib/supabase';
import { signJWT, verifyJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = typeof body.access_token === 'string' ? body.access_token.trim() : '';
    const tokenHash = typeof body.token_hash === 'string' ? body.token_hash.trim() : '';
    const verifyToken = typeof body.verify_token === 'string' ? body.verify_token.trim() : '';
    const type = typeof body.type === 'string' ? body.type.trim() : 'signup';

    let verifiedEmail = '';

    if (verifyToken) {
      const payload = await verifyJWT(verifyToken);
      if (!payload || payload.purpose !== 'confirm_link' || typeof payload.email !== 'string') {
        return NextResponse.json(
          { error: 'Invalid or expired confirmation link. Please register again.' },
          { status: 401 }
        );
      }
      verifiedEmail = payload.email.trim().toLowerCase();
    } else if (accessToken) {
      // Verify the Supabase access token returned in the confirmation link redirect
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data?.user?.email) {
        return NextResponse.json(
          { error: 'Invalid or expired confirmation link. Please register again.' },
          { status: 401 }
        );
      }
      verifiedEmail = data.user.email.trim().toLowerCase();
    } else if (tokenHash) {
      const authClient = createSupabaseAuthClient();
      const otpType = (type === 'magiclink' || type === 'email' ? type : 'signup') as
        | 'signup'
        | 'magiclink'
        | 'email';
      const { data, error } = await authClient.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
      if (error || !data?.user?.email) {
        return NextResponse.json(
          { error: 'Invalid or expired confirmation link. Please register again.' },
          { status: 401 }
        );
      }
      verifiedEmail = data.user.email.trim().toLowerCase();
    } else {
      return NextResponse.json(
        { error: 'Missing email confirmation credentials.' },
        { status: 400 }
      );
    }

    // If user already completed confirmation (e.g. clicked the link twice), log them right in
    const { data: alreadyCreated } = await supabase
      .from('users')
      .select('id, username, email, team_name, is_admin')
      .ilike('email', verifiedEmail)
      .maybeSingle();

    if (alreadyCreated) {
      const jwt = await signJWT({
        sub: alreadyCreated.id,
        username: alreadyCreated.username,
        team_name: alreadyCreated.team_name,
        is_admin: alreadyCreated.is_admin,
      });

      const response = NextResponse.json(
        { message: 'Email already verified. Signed in!', user: alreadyCreated },
        { status: 200 }
      );
      response.cookies.set('auth_token', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    // Look up pending registration
    const { data: pending, error: pendingErr } = await supabase
      .from('pending_registrations')
      .select('email, username, password_hash, team_name, expires_at')
      .eq('email', verifiedEmail)
      .maybeSingle();

    if (pendingErr || !pending) {
      return NextResponse.json(
        { error: 'No pending registration found for this email. Please fill out the registration form again.' },
        { status: 404 }
      );
    }

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await supabase.from('pending_registrations').delete().eq('email', verifiedEmail);
      return NextResponse.json(
        { error: 'Registration link expired. Please register again.' },
        { status: 410 }
      );
    }

    // Ensure username wasn't claimed in the meantime
    const { data: usernameTaken } = await supabase
      .from('users')
      .select('id')
      .eq('username', pending.username)
      .maybeSingle();

    if (usernameTaken) {
      return NextResponse.json(
        { error: 'That callsign was taken while awaiting confirmation. Please register with a new callsign.' },
        { status: 409 }
      );
    }

    // Create the verified user in public.users
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username: pending.username,
        password_hash: pending.password_hash,
        email: verifiedEmail,
        team_name: pending.team_name,
        is_admin: false,
      })
      .select('id, username, email, team_name, is_admin')
      .single();

    if (insertError || !newUser) {
      console.error('Finalize registration insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to finalize account creation. Please try again.' },
        { status: 500 }
      );
    }

    // Initialize score record
    await supabase.from('scores').insert({
      user_id: newUser.id,
      total_points: 0,
      challenges_solved: 0,
    });

    // Clean up pending registration
    await supabase.from('pending_registrations').delete().eq('email', verifiedEmail);

    // Issue session cookie
    const jwt = await signJWT({
      sub: newUser.id,
      username: newUser.username,
      team_name: newUser.team_name,
      is_admin: newUser.is_admin,
    });

    const response = NextResponse.json(
      { message: 'Email verified and account created!', user: newUser },
      { status: 201 }
    );

    response.cookies.set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Confirm email server error:', error);
    return NextResponse.json(
      { error: 'Internal server error while confirming email.' },
      { status: 500 }
    );
  }
}
