import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { authenticate } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    console.log('[Avatar Upload] Request received');
    
    // Authenticate user
    const user = authenticate(request);
    console.log('[Avatar Upload] User authenticated:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.error('[Avatar Upload] Authentication failed - no user');
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

    // Validate file type - only images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB for avatars)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 2MB limit' },
        { status: 400 }
      );
    }

    // Delete old avatar if exists
    try {
      const { data: existingFiles } = await supabaseAdmin.storage
        .from('user-avatar')
        .list(user.userId);

      if (existingFiles && existingFiles.length > 0) {
        const filePaths = existingFiles.map(f => `${user.userId}/${f.name}`);
        await supabaseAdmin.storage
          .from('user-avatar')
          .remove(filePaths);
        console.log('[Avatar Upload] Deleted old avatar(s)');
      }
    } catch (error) {
      console.log('[Avatar Upload] No old avatar to delete or error deleting:', error);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.userId}/avatar-${Date.now()}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    console.log('[Avatar Upload] Uploading to Supabase Storage:', fileName);
    const { data, error } = await supabaseAdmin.storage
      .from('user-avatar')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[Avatar Upload] Supabase storage error:', error);
      return NextResponse.json(
        { error: `Failed to upload avatar: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[Avatar Upload] Upload successful:', data.path);

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('user-avatar')
      .getPublicUrl(data.path);

    console.log('[Avatar Upload] Public URL generated:', publicUrl);

    // Update user's avatar_url in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.userId);

    if (updateError) {
      console.error('[Avatar Upload] Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
      message: 'Avatar uploaded successfully',
    });
  } catch (error: any) {
    console.error('[Avatar Upload] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

