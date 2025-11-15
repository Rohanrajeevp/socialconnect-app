import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { hashPassword } from '@/lib/auth/password';
import { validateEmail, validateUsername, validatePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, first_name, last_name } = body;

    // Validation
    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    console.log('🔍 Checking for existing users...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`);

    if (checkError) {
      console.error('❌ Database error:', checkError);
      console.error('Error details:', JSON.stringify(checkError, null, 2));
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }
    
    console.log('✅ Database check successful');

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username,
        password_hash,
        first_name,
        last_name,
        email_verified: false, // In production, send verification email
      })
      .select('id, email, username, first_name, last_name, bio, avatar_url, website, location, is_active, is_admin, email_verified, profile_visibility, created_at, updated_at')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

