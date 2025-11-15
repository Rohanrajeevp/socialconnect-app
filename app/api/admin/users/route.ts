import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/middleware';

// Get all users (admin only)
async function getAllUsersHandler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'active' or 'inactive'
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select('id, email, username, first_name, last_name, bio, avatar_url, is_active, is_admin, email_verified, created_at, last_login', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get all users error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get stats for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { count: followersCount } = await supabaseAdmin
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', user.id);

        const { count: followingCount } = await supabaseAdmin
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', user.id);

        const { count: postsCount } = await supabaseAdmin
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', user.id);

        return {
          ...user,
          followers_count: followersCount || 0,
          following_count: followingCount || 0,
          posts_count: postsCount || 0,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getAllUsersHandler);


