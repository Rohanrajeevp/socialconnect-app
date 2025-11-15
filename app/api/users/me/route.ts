import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAuth } from '@/lib/auth/middleware';
import { validateUsername } from '@/lib/utils';

async function getMeHandler(request: NextRequest, user: any) {
  try {
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, first_name, last_name, bio, avatar_url, website, location, is_active, is_admin, email_verified, profile_visibility, created_at, updated_at, last_login')
      .eq('id', user.userId)
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
      .eq('following_id', user.userId);

    const { count: followingCount } = await supabaseAdmin
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', user.userId);

    const { count: postsCount } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', user.userId)
      .eq('is_active', true);

    return NextResponse.json({
      ...userData,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      posts_count: postsCount || 0,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateMeHandler(request: NextRequest, user: any) {
  try {
    const body = await request.json();
    const { username, first_name, last_name, bio, avatar_url, website, location, profile_visibility } = body;

    const updates: any = {};

    if (username !== undefined) {
      if (!validateUsername(username)) {
        return NextResponse.json(
          { error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' },
          { status: 400 }
        );
      }

      // Check if username is already taken
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', user.userId)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }

      updates.username = username;
    }

    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (bio !== undefined) {
      if (bio.length > 160) {
        return NextResponse.json(
          { error: 'Bio must be 160 characters or less' },
          { status: 400 }
        );
      }
      updates.bio = bio;
    }
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (website !== undefined) updates.website = website;
    if (location !== undefined) updates.location = location;
    if (profile_visibility !== undefined) {
      if (!['public', 'private', 'followers_only'].includes(profile_visibility)) {
        return NextResponse.json(
          { error: 'Invalid profile visibility' },
          { status: 400 }
        );
      }
      updates.profile_visibility = profile_visibility;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', user.userId)
      .select('id, email, username, first_name, last_name, bio, avatar_url, website, location, is_active, is_admin, email_verified, profile_visibility, created_at, updated_at')
      .single();

    if (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getMeHandler);
export const PUT = requireAuth(updateMeHandler);
export const PATCH = requireAuth(updateMeHandler);


