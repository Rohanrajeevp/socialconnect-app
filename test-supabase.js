// Test Supabase Connection
// Run this with: node test-supabase.js

require('dotenv').config({ path: '.env' });

console.log('🔍 Checking Environment Variables...\n');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
console.log('  Value:', url || 'NOT SET');

console.log('\nNEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✅ Set' : '❌ Missing');
console.log('  Length:', anonKey ? anonKey.length : 0, 'characters');
console.log('  Starts with:', anonKey ? anonKey.substring(0, 20) + '...' : 'NOT SET');

console.log('\nSUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅ Set' : '❌ Missing');
console.log('  Length:', serviceKey ? serviceKey.length : 0, 'characters');
console.log('  Starts with:', serviceKey ? serviceKey.substring(0, 20) + '...' : 'NOT SET');

console.log('\n🧪 Testing Connection to Supabase...\n');

if (!url || !anonKey) {
  console.log('❌ Cannot test - missing URL or anon key');
  process.exit(1);
}

// Test the connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, anonKey);

supabase
  .from('users')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Connection Failed:', error.message);
      console.log('\nTroubleshooting:');
      console.log('1. Check your Supabase URL is correct (no trailing slash)');
      console.log('2. Verify your anon key is correct');
      console.log('3. Make sure your Supabase project is running');
      console.log('4. Check if you ran the database migration');
    } else {
      console.log('✅ Connection Successful!');
      console.log('✅ Database is accessible');
      console.log('✅ Your credentials are correct');
    }
  })
  .catch((err) => {
    console.log('❌ Connection Error:', err.message);
  });


