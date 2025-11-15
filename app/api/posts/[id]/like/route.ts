import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';

// Like a post
async function likePostHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;

    // Check if post exists
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, is_active')
      .eq('id', postId)
      .single();

    if (postError || !post || !post.is_active) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const { data: existingLike } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user.userId)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: 'Post already liked' },
        { status: 409 }
      );
    }

    // Create like
    const { error: likeError } = await supabaseAdmin
      .from('likes')
      .insert({
        user_id: user.userId,
        post_id: postId,
      });

    if (likeError) {
      console.error('Like post error:', likeError);
      return NextResponse.json(
        { error: 'Failed to like post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Like post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Unlike a post
async function unlikePostHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;

    // Delete like
    const { error } = await supabaseAdmin
      .from('likes')
      .delete()
      .eq('user_id', user.userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Unlike post error:', error);
      return NextResponse.json(
        { error: 'Failed to unlike post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
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
  return requireAuth((req, user) => likePostHandler(req, user, context))(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuth((req, user) => unlikePostHandler(req, user, context))(request);
}


