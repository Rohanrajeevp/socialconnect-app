import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Must provide either email or username
    if ((!email && !username) || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // Find user by email or username
    let query = supabaseAdmin
      .from('users')
      .select('*');

    if (email) {
      query = query.eq('email', email);
    } else {
      query = query.eq('username', username);
    }

    const { data: users, error: queryError } = await query;

    if (queryError || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account has been deactivated' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Get user stats
    const { data: followersCount } = await supabaseAdmin
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', user.id);

    const { data: followingCount } = await supabaseAdmin
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    const { data: postsCount } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', user.id)
      .eq('is_active', true);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.is_admin,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.is_admin,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await supabaseAdmin
      .from('refresh_tokens')
      .insert({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt.toISOString(),
      });

    // Remove sensitive data
    delete user.password_hash;

    return NextResponse.json({
      user: {
        ...user,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        posts_count: postsCount || 0,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


