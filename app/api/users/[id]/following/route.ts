import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get following
    const { data: follows, error, count } = await supabaseAdmin
      .from('follows')
      .select(`
        id,
        created_at,
        following:users!follows_following_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio
        )
      `, { count: 'exact' })
      .eq('follower_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get following error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch following' },
        { status: 500 }
      );
    }

    const following = follows?.map((f: any) => f.following) || [];

    return NextResponse.json({
      following,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get following error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


