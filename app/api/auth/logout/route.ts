import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';

async function logoutHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Blacklist the refresh token
    const { error } = await supabaseAdmin
      .from('refresh_tokens')
      .update({ is_blacklisted: true })
      .eq('token', refreshToken);

    if (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(logoutHandler);


