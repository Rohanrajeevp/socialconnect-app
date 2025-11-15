import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { authenticate } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Request received');
    
    // Authenticate user
    const user = authenticate(request);
    console.log('[Upload] User authenticated:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.error('[Upload] Authentication failed - no user');
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    console.log('[Upload] Uploading to Supabase Storage:', fileName);
    const { data, error } = await supabaseAdmin.storage
      .from('post-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[Upload] Supabase storage error:', error);
      return NextResponse.json(
        { error: `Failed to upload image: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[Upload] Upload successful:', data.path);

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('post-images')
      .getPublicUrl(data.path);

    console.log('[Upload] Public URL generated:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
    });
  } catch (error: any) {
    console.error('[Upload] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

