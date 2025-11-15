import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';

// Get post comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data: comments, error, count } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        user:users!comments_user_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get comments error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comments: comments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add comment to post
async function addCommentHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be 500 characters or less' },
        { status: 400 }
      );
    }

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

    // Create comment
    const { data: newComment, error: commentError } = await supabaseAdmin
      .from('comments')
      .insert({
        content,
        user_id: user.userId,
        post_id: postId,
      })
      .select(`
        *,
        user:users!comments_user_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (commentError) {
      console.error('Add comment error:', commentError);
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    // Return comment with 'author' key for consistency
    const commentWithAuthor = {
      ...newComment,
      author: newComment.user,
    };

    return NextResponse.json({ comment: commentWithAuthor }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
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
  return requireAuth((req, user) => addCommentHandler(req, user, context))(request);
}


