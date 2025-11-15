import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/middleware';

// Get all posts (admin only)
async function getAllPostsHandler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get all posts error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getAllPostsHandler);


