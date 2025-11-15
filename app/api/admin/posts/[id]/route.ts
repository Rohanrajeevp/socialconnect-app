import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/middleware';

// Delete any post (admin only)
async function deletePostHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAdmin((req, user) => deletePostHandler(req, user, context))(request);
}


