import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';

async function followHandler(request: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    const { id: followingId } = params;

    // Can't follow yourself
    if (user.userId === followingId) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists and is active
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_active')
      .eq('id', followingId)
      .single();

    if (userError || !targetUser || !targetUser.is_active) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', user.userId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 409 }
      );
    }

    // Create follow relationship
    const { error: followError } = await supabaseAdmin
      .from('follows')
      .insert({
        follower_id: user.userId,
        following_id: followingId,
      });

    if (followError) {
      console.error('Follow error:', followError);
      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function unfollowHandler(request: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    const { id: followingId } = params;

    // Delete follow relationship
    const { error } = await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', user.userId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Unfollow error:', error);
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow error:', error);
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
  return requireAuth((req, user) => followHandler(req, user, context))(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuth((req, user) => unfollowHandler(req, user, context))(request);
}


