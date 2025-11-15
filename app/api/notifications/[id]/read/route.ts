import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';

// Mark notification as read
async function markAsReadHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Update notification - ensure it belongs to the current user
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.userId);

    if (error) {
      console.error('Mark notification read error:', error);
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
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
  return requireAuth((req, user) => markAsReadHandler(req, user, context))(request);
}


