import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if username is valid (3-20 characters, alphanumeric and underscore only)
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({
        available: false,
        error: 'Username must be between 3 and 20 characters',
      });
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        error: 'Username can only contain lowercase letters, numbers, and underscores',
      });
    }

    // Check if username exists in database
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Check username error:', error);
      return NextResponse.json(
        { error: 'Failed to check username' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      available: !data,
    });
  } catch (error: any) {
    console.error('Check username error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check username' },
      { status: 500 }
    );
  }
}

