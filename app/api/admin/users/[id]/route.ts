import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/middleware';

// Get user details (admin only)
async function getUserDetailsHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user stats
    const { count: followersCount } = await supabaseAdmin
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', id);

    const { count: followingCount } = await supabaseAdmin
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', id);

    const { count: postsCount } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', id);

    const { count: commentsCount } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id);

    const { count: likesCount } = await supabaseAdmin
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id);

    // Remove sensitive data
    delete userData.password_hash;

    return NextResponse.json({
      ...userData,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      posts_count: postsCount || 0,
      comments_count: commentsCount || 0,
      likes_count: likesCount || 0,
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAdmin((req, user) => getUserDetailsHandler(req, user, context))(request);
}


