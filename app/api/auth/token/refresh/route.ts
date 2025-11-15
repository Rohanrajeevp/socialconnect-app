import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if token exists and is not blacklisted
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .eq('is_blacklisted', false)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Refresh token has expired' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, username, is_admin, is_active')
      .eq('id', payload.userId)
      .single();

    if (userError || !user || !user.is_active) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.is_admin,
    });

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


