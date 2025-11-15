import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';

// Mark all notifications as read
async function markAllAsReadHandler(request: NextRequest, user: any) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.userId)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all notifications read error:', error);
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(markAllAsReadHandler);


