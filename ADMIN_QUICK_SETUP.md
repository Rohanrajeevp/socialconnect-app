# 🚀 Quick Admin Setup (5 Minutes)

Follow these steps to create your first admin user:

---

## **Step 1: Create Your Account** (1 min)

1. Go to: `http://localhost:3001`
2. Click **Sign Up**
3. Fill in your details
4. Remember your **username**

---

## **Step 2: Add Admin Secret Key** (1 min)

1. Open your `.env` file
2. Add this line:
   ```env
   ADMIN_SECRET_KEY=mysecretkey123
   ```
3. Save the file
4. **Restart your dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

---

## **Step 3: Make Yourself Admin** (2 mins)

### **Choose ONE method:**

### **Method A: SQL (Easiest)** ⭐

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Paste this (replace `your_username`):
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE username = 'your_username';
   ```
4. Click **Run**

### **Method B: Script**

```bash
# Get your user ID from your profile URL first
# Then run:
node scripts/provision-admin.js YOUR_USER_ID_HERE
```

### **Method C: API**

```bash
curl -X POST http://localhost:3001/api/admin/provision \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "secretKey": "mysecretkey123"
  }'
```

---

## **Step 4: Log Out & Back In** (1 min)

1. **Log out** from your app
2. **Log back in**
3. You should now see:
   - 🛡️ **Admin** in the navbar
   - Admin dashboard access
   - Extra management features

---

## ✅ **Done!**

You are now an admin! Check out:
- `/admin` - Admin Dashboard
- `/admin/users` - User Management
- `/admin/posts` - Content Management

---

## 🆘 **Not Working?**

1. Did you restart the server after adding `ADMIN_SECRET_KEY`?
2. Did you log out and back in?
3. Check if `is_admin` is `true` in database:
   ```sql
   SELECT username, is_admin FROM users WHERE username = 'your_username';
   ```

---

## 🔒 **Security Tips**

- Use a strong random key: `openssl rand -hex 32`
- Never commit `.env` to git
- Only make trusted users admins
- Change `ADMIN_SECRET_KEY` periodically

---

**Full Guide:** See `ADMIN_PROVISIONING_GUIDE.md` for detailed documentation.

