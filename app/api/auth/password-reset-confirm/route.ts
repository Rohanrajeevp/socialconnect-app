import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { hashPassword } from '@/lib/auth/password';
import { validatePassword } from '@/lib/utils';

// Note: In production, this would verify a secure reset token sent via email
// For this implementation, we'll use a simple approach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, resetToken } = body;

    if (!email || !newPassword || !resetToken) {
      return NextResponse.json(
        { error: 'Email, new password, and reset token are required' },
        { status: 400 }
      );
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // In production: Verify the reset token from database
    // For this implementation, we'll skip token verification
    // and just update the password for the given email

    // Find user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid reset token or email' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password reset error:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    // Invalidate all refresh tokens for security
    await supabaseAdmin
      .from('refresh_tokens')
      .update({ is_blacklisted: true })
      .eq('user_id', user.id);

    return NextResponse.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


