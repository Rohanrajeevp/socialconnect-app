import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth, authenticate } from '@/lib/auth/middleware';

// Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const currentUser = authenticate(request);

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          profile_visibility
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check privacy settings
    const author = post.author;
    if (author) {
      const isOwnPost = currentUser && author.id === currentUser.userId;
      const visibility = author.profile_visibility || 'public';

      // If not own post, check visibility
      if (!isOwnPost) {
        // Private accounts: posts not visible to anyone except the author
        if (visibility === 'private') {
          return NextResponse.json(
            { error: 'Post not found' },
            { status: 404 }
          );
        }

        // Followers only: posts visible only to followers
        if (visibility === 'followers_only') {
          if (!currentUser) {
            return NextResponse.json(
              { error: 'Post not found' },
              { status: 404 }
            );
          }

          // Check if current user follows the author
          const { data: followData } = await supabaseAdmin
            .from('follows')
            .select('id')
            .eq('follower_id', currentUser.userId)
            .eq('following_id', author.id)
            .single();

          if (!followData) {
            return NextResponse.json(
              { error: 'Post not found' },
              { status: 404 }
            );
          }
        }
      }
    }

    // Check if current user has liked this post
    if (currentUser) {
      const { data: like } = await supabaseAdmin
        .from('likes')
        .select('id')
        .eq('user_id', currentUser.userId)
        .eq('post_id', id)
        .single();

      post.is_liked = !!like;
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update post
async function updatePostHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, image_url, category } = body;

    // Check if post exists and user is the author
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.author_id !== user.userId) {
      return NextResponse.json(
        { error: 'You can only update your own posts' },
        { status: 403 }
      );
    }

    const updates: any = {};

    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Content cannot be empty' },
          { status: 400 }
        );
      }
      if (content.length > 280) {
        return NextResponse.json(
          { error: 'Content must be 280 characters or less' },
          { status: 400 }
        );
      }
      updates.content = content;
    }

    if (image_url !== undefined) updates.image_url = image_url;
    
    if (category !== undefined) {
      if (!['general', 'announcement', 'question'].includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
      updates.category = category;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedPost, error } = await supabaseAdmin
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        author:users!posts_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Update post error:', error);
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete post
async function deletePostHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if post exists and user is the author
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.author_id !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Soft delete by setting is_active to false
    const { error } = await supabaseAdmin
      .from('posts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Delete post error:', error);
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuth((req, user) => updatePostHandler(req, user, context))(request);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuth((req, user) => updatePostHandler(req, user, context))(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuth((req, user) => deletePostHandler(req, user, context))(request);
}


