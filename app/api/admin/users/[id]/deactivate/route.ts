import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/middleware';

// Deactivate user (admin only)
async function deactivateUserHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Can't deactivate yourself
    if (user.userId === id) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Deactivate user error:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate user' },
        { status: 500 }
      );
    }

    // Invalidate all user's refresh tokens
    await supabaseAdmin
      .from('refresh_tokens')
      .update({ is_blacklisted: true })
      .eq('user_id', id);

    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAdmin((req, user) => deactivateUserHandler(req, user, context))(request);
}


