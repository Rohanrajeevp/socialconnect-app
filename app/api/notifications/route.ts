import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';

// Get user notifications
async function getNotificationsHandler(request: NextRequest, user: any) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('notifications')
      .select(`
        *,
        related_user:users!notifications_related_user_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('user_id', user.userId);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get notifications error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getNotificationsHandler);


