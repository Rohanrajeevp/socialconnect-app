import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth, authenticate } from '@/lib/auth/middleware';

// Get all posts (feed)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const authorId = searchParams.get('author_id');
    const following = searchParams.get('following') === 'true';
    
    const currentUser = authenticate(request);
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
          avatar_url,
          profile_visibility
        )
      `, { count: 'exact' })
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    // If following is true, only show posts from users the current user follows
    if (following && currentUser) {
      const { data: followingUsers } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.userId);

      if (followingUsers && followingUsers.length > 0) {
        const followingIds = followingUsers.map(f => f.following_id);
        query = query.in('author_id', followingIds);
      } else {
        // If not following anyone, return empty result
        return NextResponse.json({
          posts: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Posts query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Filter posts based on privacy settings
    let filteredPosts = posts || [];
    
    if (filteredPosts.length > 0) {
      // Get the list of users that the current user follows (if authenticated)
      let followingIds = new Set<string>();
      if (currentUser) {
        const { data: followingData } = await supabaseAdmin
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.userId);
        
        followingIds = new Set(followingData?.map(f => f.following_id) || []);
      }

      // Filter posts based on author's privacy settings
      filteredPosts = filteredPosts.filter(post => {
        const author = post.author;
        if (!author) return false;

        const isOwnPost = currentUser && author.id === currentUser.userId;
        const visibility = author.profile_visibility || 'public';

        // Own posts are always visible
        if (isOwnPost) return true;

        // Private accounts: posts not visible to anyone except the author
        if (visibility === 'private') return false;

        // Followers only: posts visible only to followers
        if (visibility === 'followers_only') {
          return currentUser && followingIds.has(author.id);
        }

        // Public: posts visible to everyone
        return true;
      });
    }

    // Check if current user has liked each post
    if (currentUser && filteredPosts.length > 0) {
      const postIds = filteredPosts.map(p => p.id);
      const { data: likes } = await supabaseAdmin
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUser.userId)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      
      filteredPosts.forEach(post => {
        post.is_liked = likedPostIds.has(post.id);
      });
    }

    return NextResponse.json({
      posts: filteredPosts,
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / limit),
      },
    });
  } catch (error) {
    console.error('Posts list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new post
async function createPostHandler(request: NextRequest, user: any) {
  try {
    const body = await request.json();
    const { content, image_url, category = 'general' } = body;

    // Allow image-only posts (content is optional if image is provided)
    if ((!content || content.trim().length === 0) && !image_url) {
      return NextResponse.json(
        { error: 'Content or image is required' },
        { status: 400 }
      );
    }

    if (content && content.length > 280) {
      return NextResponse.json(
        { error: 'Content must be 280 characters or less' },
        { status: 400 }
      );
    }

    if (category && !['general', 'announcement', 'question'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const { data: newPost, error } = await supabaseAdmin
      .from('posts')
      .insert({
        content: content || null,
        image_url,
        category,
        author_id: user.userId,
      })
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
      console.error('Create post error:', error);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(createPostHandler);


