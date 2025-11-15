# Admin Provisioning Guide

This guide explains how to manually provision admin users in your SocialConnect application.

---

## 🔐 **Admin Role Overview**

By default, all users are created with the **User** role. Admin privileges must be granted manually after initial setup for security reasons.

### **Admin Capabilities:**
- ✅ All user features (post, comment, follow, etc.)
- ✅ **User Management** - View and manage all users
- ✅ **Delete Any Content** - Remove any post or comment
- ✅ **View All Users List** - Access to user directory
- ✅ **Admin Dashboard** - Special admin interface

---

## 🚀 **Provisioning Methods**

There are **3 methods** to provision admin users:

### **Method 1: SQL Script (Recommended for First Admin)** ⭐

This is the safest and easiest method for creating your first admin user.

#### **Steps:**

1. **Sign up for a regular user account** in your app
2. **Go to Supabase Dashboard** → Your Project → **SQL Editor**
3. **Open** `database/provision-admin.sql` from your project
4. **Choose one option:**

   **Option A - By Username:**
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE username = 'your_username';
   ```

   **Option B - By Email:**
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE email = 'your@email.com';
   ```

   **Option C - By User ID:**
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE id = 'user-id-from-database';
   ```

5. **Click "Run"** in SQL Editor
6. **Verify** the admin was created:
   ```sql
   SELECT id, username, email, first_name, last_name, is_admin, created_at
   FROM users 
   WHERE is_admin = true;
   ```

7. **Log out and log back in** to see admin features

---

### **Method 2: API Endpoint (For Additional Admins)**

Use this method after you have at least one admin provisioned.

#### **Setup:**

1. **Add to your `.env` file:**
   ```env
   ADMIN_SECRET_KEY=your_secure_random_key_here
   ```

   **Generate a secure key:**
   ```bash
   # On Linux/Mac:
   openssl rand -hex 32
   
   # Or use online: https://generate-secret.vercel.app/32
   ```

2. **Restart your dev server** after adding the key

#### **Usage:**

**Option A - Via cURL (Terminal):**
```bash
curl -X POST http://localhost:3001/api/admin/provision \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "secretKey": "YOUR_ADMIN_SECRET_KEY"
  }'
```

**Option B - Via Postman/Thunder Client:**
```http
POST http://localhost:3001/api/admin/provision
Content-Type: application/json

{
  "userId": "USER_ID_HERE",
  "secretKey": "YOUR_ADMIN_SECRET_KEY"
}
```

**Option C - Via JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3001/api/admin/provision', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'USER_ID_HERE',
    secretKey: 'YOUR_ADMIN_SECRET_KEY',
  }),
});

const data = await response.json();
console.log(data);
```

---

### **Method 3: Direct Database Update (Advanced)**

For advanced users who have direct database access:

```sql
-- In Supabase SQL Editor or your database client:
UPDATE users 
SET is_admin = true 
WHERE username = 'admin_username';
```

---

## 📋 **Step-by-Step: First Admin Setup**

Follow these exact steps to create your first admin:

### **Step 1: Create a User Account**
1. Go to your app: `http://localhost:3001`
2. Click **Sign Up**
3. Create an account (remember your username/email)
4. Complete registration

### **Step 2: Get User Information**
1. Log in to your app
2. Go to your profile
3. Note down your **username** or **email**

### **Step 3: Provision Admin via SQL**
1. Go to **Supabase Dashboard**
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **New query**
5. Run this query (replace `your_username`):
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE username = 'your_username';
   ```
6. Click **Run**
7. You should see: `Success. 1 rows affected.`

### **Step 4: Verify Admin Access**
1. **Log out** from your app
2. **Log back in**
3. You should now see:
   - 🛡️ **Admin** link in navbar
   - Access to admin dashboard
   - Ability to delete any content
   - User management features

---

## 🔍 **How to Find User IDs**

If you need to use the API method and need a user ID:

### **Method A - Via SQL:**
```sql
SELECT id, username, email, first_name, last_name
FROM users 
WHERE username = 'target_username';
```

### **Method B - Via Profile URL:**
1. Go to the user's profile in your app
2. Look at the URL: `http://localhost:3001/profile/USER_ID_HERE`
3. Copy the ID from the URL

---

## ⚙️ **Environment Variables Setup**

Add these to your `.env` file:

```env
# Required for all admin features
ADMIN_SECRET_KEY=generate_a_secure_random_string_here

# Generate using:
# openssl rand -hex 32
```

**Example:**
```env
ADMIN_SECRET_KEY=a7f3d8c2b9e1f4a6d8c2b5e9f3a1d7c4b2e8f6a3d9c1e5f7a2d4c6b8e1f3a5d7
```

---

## 🛡️ **Security Best Practices**

1. **Never commit** `.env` file to git (it's already in `.gitignore`)
2. **Keep `ADMIN_SECRET_KEY` private** - never share it
3. **Use strong random keys** - don't use simple passwords
4. **Provision admins sparingly** - only trusted users
5. **Audit admin actions** - monitor admin activities
6. **Rotate keys periodically** - update `ADMIN_SECRET_KEY` every few months
7. **Use SQL method for first admin** - it's the most secure

---

## ✅ **Verification Checklist**

After provisioning an admin, verify:

- [ ] User can log in successfully
- [ ] Admin link appears in navbar
- [ ] Can access `/admin` route
- [ ] Admin dashboard loads
- [ ] Can view user management page
- [ ] Can see delete buttons on any post
- [ ] Admin stats appear correctly

---

## 🐛 **Troubleshooting**

### **Problem: Admin features not showing after SQL update**
**Solution:** Log out and log back in. JWT tokens need to be refreshed.

### **Problem: API returns "Invalid secret key"**
**Solution:** 
- Check `.env` file has `ADMIN_SECRET_KEY` set
- Restart dev server after adding/changing env variables
- Make sure you're using the exact key from `.env`

### **Problem: SQL query returns "0 rows affected"**
**Solution:**
- User doesn't exist - check username/email spelling
- User ID is incorrect - verify in database
- Run verification query to check users table

### **Problem: Can't access admin routes**
**Solution:**
- Clear browser cache and cookies
- Check database: `SELECT * FROM users WHERE username = 'your_username'`
- Verify `is_admin` column is `true`
- Log out and log back in

---

## 🔄 **Revoking Admin Access**

To remove admin privileges:

```sql
UPDATE users 
SET is_admin = false 
WHERE username = 'username_here';
```

The user will need to log out and back in for changes to take effect.

---

## 📊 **Current Admins Query**

To see all current admins:

```sql
SELECT 
  id,
  username,
  email,
  first_name || ' ' || last_name as full_name,
  created_at,
  last_login
FROM users 
WHERE is_admin = true
ORDER BY created_at DESC;
```

---

## 🚀 **Quick Reference**

### **First Admin (SQL Method):**
```sql
UPDATE users SET is_admin = true WHERE username = 'your_username';
```

### **Additional Admin (API Method):**
```bash
curl -X POST http://localhost:3001/api/admin/provision \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "secretKey": "YOUR_KEY"}'
```

### **Verify Admins:**
```sql
SELECT * FROM users WHERE is_admin = true;
```

### **Remove Admin:**
```sql
UPDATE users SET is_admin = false WHERE username = 'username';
```

---

## 📞 **Need Help?**

- Check database: Is `is_admin` column `true`?
- Check `.env`: Is `ADMIN_SECRET_KEY` set?
- Restart server after env changes
- Clear browser cache
- Log out and log back in

---

**Security Note:** The admin provisioning endpoint (`/api/admin/provision`) is protected by the `ADMIN_SECRET_KEY` environment variable and should NEVER be exposed publicly. Always use SQL method for the first admin, then use API for additional admins if needed.

