import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/middleware';

// Get system statistics (admin only)
async function getStatsHandler(request: NextRequest) {
  try {
    // Total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });

    // Active users
    const { count: activeUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Total posts
    const { count: totalPosts } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Users active today (logged in within last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: activeToday } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('last_login', yesterday.toISOString());

    // Posts created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: postsToday } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Total likes
    const { count: totalLikes } = await supabaseAdmin
      .from('likes')
      .select('id', { count: 'exact', head: true });

    // Total comments
    const { count: totalComments } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact', head: true });

    // Total follows
    const { count: totalFollows } = await supabaseAdmin
      .from('follows')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        active: activeUsers || 0,
        activeToday: activeToday || 0,
      },
      posts: {
        total: totalPosts || 0,
        createdToday: postsToday || 0,
      },
      engagement: {
        totalLikes: totalLikes || 0,
        totalComments: totalComments || 0,
        totalFollows: totalFollows || 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getStatsHandler);


