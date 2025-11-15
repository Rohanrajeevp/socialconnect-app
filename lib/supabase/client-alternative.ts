// Alternative Supabase client configuration for Windows fetch issues
// Only use this if the main client.ts doesn't work

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Custom fetch function to handle Windows issues
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  try {
    // Use native fetch
    return await fetch(url, {
      ...options,
      // Disable HTTP/2 which can cause issues on Windows
      // @ts-ignore
      agent: undefined,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: customFetch,
  }
});

// Server-side Supabase admin client
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: customFetch,
    }
  }
);


