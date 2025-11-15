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

    // Get followers
    const { data: follows, error, count } = await supabaseAdmin
      .from('follows')
      .select(`
        id,
        created_at,
        follower:users!follows_follower_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url,
          bio
        )
      `, { count: 'exact' })
      .eq('following_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get followers error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch followers' },
        { status: 500 }
      );
    }

    const followers = follows?.map((f: any) => f.follower) || [];

    return NextResponse.json({
      followers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get followers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


