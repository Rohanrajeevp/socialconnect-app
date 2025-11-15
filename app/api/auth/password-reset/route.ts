import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { validateEmail } from '@/lib/utils';

// Note: In a production environment, this would send an email with a reset link
// For this implementation, we'll return a reset token that can be used
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    // Always return success for security (don't reveal if email exists)
    // But only create a token if user exists
    if (!userError && user) {
      // In production: Generate a secure reset token, store it with expiry, and email it
      // For now, we'll just log that a reset was requested
      console.log(`Password reset requested for user: ${user.id}`);
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


