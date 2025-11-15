import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// Admin provisioning endpoint - secured with environment variable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, secretKey } = body;

    // Verify secret key
    if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user to make them admin
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ is_admin: true })
      .eq('id', userId)
      .select('id, username, email, is_admin')
      .single();

    if (error || !user) {
      console.error('Admin provision error:', error);
      return NextResponse.json(
        { error: 'Failed to provision admin user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User successfully provisioned as admin',
      user,
    });
  } catch (error) {
    console.error('Admin provision error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


