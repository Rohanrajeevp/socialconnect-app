import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { authenticate } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const currentUser = authenticate(request);

    // Get user data
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, bio, avatar_url, website, location, profile_visibility, created_at')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check privacy settings
    if (userData.profile_visibility === 'private' && (!currentUser || currentUser.userId !== id)) {
      return NextResponse.json(
        { error: 'This profile is private' },
        { status: 403 }
      );
    }

    if (userData.profile_visibility === 'followers_only' && currentUser && currentUser.userId !== id) {
      // Check if current user follows this user
      const { data: followData } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.userId)
        .eq('following_id', id)
        .single();

      if (!followData) {
        return NextResponse.json(
          { error: 'This profile is only visible to followers' },
          { status: 403 }
        );
      }
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
      .eq('author_id', id)
      .eq('is_active', true);

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUser && currentUser.userId !== id) {
      const { data: followData } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.userId)
        .eq('following_id', id)
        .single();
      
      isFollowing = !!followData;
    }

    return NextResponse.json({
      ...userData,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      posts_count: postsCount || 0,
      is_following: isFollowing,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


