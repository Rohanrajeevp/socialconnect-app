-- Manual Admin Provisioning SQL Script
-- Use this script to manually provision admin users via Supabase SQL Editor

-- Option 1: Provision admin by user ID
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from the users table
UPDATE users 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID_HERE';

-- Option 2: Provision admin by username
-- Replace 'username_here' with the actual username
UPDATE users 
SET is_admin = true 
WHERE username = 'username_here';

-- Option 3: Provision admin by email
-- Replace 'user@example.com' with the actual email
UPDATE users 
SET is_admin = true 
WHERE email = 'user@example.com';

-- Verify admin provisioning
SELECT id, username, email, first_name, last_name, is_admin, created_at
FROM users 
WHERE is_admin = true;

-- To remove admin privileges (if needed)
-- UPDATE users 
-- SET is_admin = false 
-- WHERE id = 'USER_ID_HERE';

