#!/usr/bin/env node

/**
 * Admin Provisioning Helper Script
 * 
 * Usage:
 *   node scripts/provision-admin.js <user_id>
 * 
 * Example:
 *   node scripts/provision-admin.js abc123-def456-ghi789
 * 
 * Make sure ADMIN_SECRET_KEY is set in your .env file before running this script.
 */

const userId = process.argv[2];
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const adminSecretKey = process.env.ADMIN_SECRET_KEY;

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('\nUsage: node scripts/provision-admin.js <user_id>');
  console.log('\nExample: node scripts/provision-admin.js abc123-def456-ghi789');
  console.log('\n💡 Tip: You can find user IDs in Supabase Dashboard → Authentication → Users');
  process.exit(1);
}

if (!adminSecretKey) {
  console.error('❌ Error: ADMIN_SECRET_KEY is not set in .env file');
  console.log('\nPlease add ADMIN_SECRET_KEY to your .env file:');
  console.log('ADMIN_SECRET_KEY=your_secure_random_key_here');
  console.log('\n💡 Generate a key using: openssl rand -hex 32');
  process.exit(1);
}

console.log('🔐 Provisioning admin user...');
console.log(`User ID: ${userId}`);
console.log(`API URL: ${baseUrl}/api/admin/provision\n`);

fetch(`${baseUrl}/api/admin/provision`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: userId,
    secretKey: adminSecretKey,
  }),
})
  .then(async (response) => {
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Admin user provisioned successfully');
      console.log('\n📊 User Details:');
      console.log(`   ID: ${data.user.id}`);
      console.log(`   Username: ${data.user.username}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Admin: ${data.user.is_admin}`);
      console.log('\n🎉 The user now has admin privileges!');
      console.log('💡 They need to log out and log back in to see admin features.');
    } else {
      console.error('❌ ERROR:', data.error || 'Failed to provision admin');
      
      if (response.status === 403) {
        console.log('\n💡 Tip: Check that ADMIN_SECRET_KEY in .env matches the one you\'re using');
      } else if (response.status === 400) {
        console.log('\n💡 Tip: Make sure the User ID is correct and the user exists');
      }
    }
  })
  .catch((error) => {
    console.error('❌ Network Error:', error.message);
    console.log('\n💡 Make sure your development server is running on', baseUrl);
  });

