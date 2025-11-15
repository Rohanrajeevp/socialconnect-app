# 🖼️ Avatar Upload System Setup Guide

## Overview

The avatar system has been updated to use **file uploads to Supabase Storage** instead of generated DiceBear avatars. Users can now upload their own profile pictures with validation.

## 🔧 Setup Instructions

### Step 1: Create the Supabase Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket** or run the SQL script below

#### Option A: Using SQL (Recommended)

Run this SQL script in your Supabase SQL Editor:

```sql
-- Located in: database/user-avatar-bucket-setup.sql

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatar',
  'user-avatar',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-avatar' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read access for user avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'user-avatar');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-avatar' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-avatar' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Option B: Using Supabase UI

1. Go to **Storage** → **Create a new bucket**
2. Bucket name: `user-avatar`
3. Public bucket: **✓ Yes**
4. File size limit: `2097152` (2MB)
5. Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`
6. Click **Create bucket**

Then create the policies manually:
- Go to **Storage** → Select `user-avatar` bucket → **Policies**
- Create the 4 policies as shown in the SQL above

### Step 2: Verify Setup

After running the SQL or creating the bucket manually:

1. Go to **Storage** in Supabase Dashboard
2. You should see a bucket named `user-avatar`
3. Click on it - it should be empty (that's normal!)
4. Check the **Policies** tab - you should see 4 policies

## ✨ Features

### File Upload Validation

✅ **File Types**: JPEG, JPG, PNG, WebP only  
✅ **File Size**: Maximum 2MB  
✅ **Security**: Users can only upload/update/delete their own avatars  
✅ **Auto-cleanup**: Old avatars are automatically deleted when uploading a new one

### User Experience

- **Live Preview**: See the avatar before uploading
- **File Info**: Displays filename and size
- **Remove Option**: Cancel selected file before uploading
- **Upload Progress**: Loading spinner during upload
- **Instant Update**: Avatar updates immediately in the UI and navbar

## 🎯 How It Works

### 1. User Flow

```
Edit Profile → Choose Image → Preview → Upload → Success
```

1. User goes to **Edit Profile**
2. Clicks **"Choose Image"** button
3. Selects an image file from their computer
4. Preview shows the selected image
5. User clicks **"Upload"** button
6. Avatar is uploaded to Supabase Storage
7. Database is updated with the new avatar URL
8. UI refreshes to show the new avatar

### 2. API Endpoint

**POST** `/api/upload/avatar`

- **Authentication**: Required (Bearer token)
- **Body**: FormData with `file` field
- **Response**: `{ url, path, message }`

### 3. Storage Structure

```
user-avatar/
├── {userId}/
│   └── avatar-{timestamp}.{ext}
```

Each user has their own folder identified by their user ID.

## 🔄 Backward Compatibility

The system maintains backward compatibility with old DiceBear avatars:

- **Old avatars** (format: `avatar:1` to `avatar:24`) still work
- **New avatars** (format: Supabase Storage URLs) work seamlessly
- **AvatarRenderer** component handles both automatically

## 📱 Where Avatars Appear

Avatars are displayed throughout the app:
- ✅ Navbar (top-right corner)
- ✅ Profile page
- ✅ Edit profile page
- ✅ Posts (author avatars)
- ✅ Comments (commenter avatars)
- ✅ Followers/Following lists
- ✅ User search results

## 🛡️ Security Features

### Row Level Security (RLS)

1. **Upload**: Users can only upload to their own folder
2. **Read**: Anyone can view avatars (public bucket)
3. **Update**: Users can only update their own avatars
4. **Delete**: Users can only delete their own avatars

### Validation

- File type checked on both client and server
- File size validated before upload
- Old avatars automatically cleaned up

## 🐛 Troubleshooting

### Issue: "Bucket not found"

**Solution**: 
1. Check if you ran the SQL script
2. Verify bucket exists in Supabase Storage
3. Check bucket name is exactly `user-avatar`

### Issue: "Unauthorized error"

**Solution**:
1. Make sure you're logged in
2. Check if JWT token is valid
3. Verify RLS policies are set up correctly

### Issue: "Failed to upload"

**Solution**:
1. Check file size (max 2MB)
2. Verify file type (JPEG, PNG, WebP only)
3. Check Supabase service role key in `.env`

### Issue: Avatar not updating in UI

**Solution**:
1. Hard refresh the page (Ctrl+Shift+R)
2. Clear browser cache
3. Check if upload was successful in Supabase Storage

## 📊 Storage Limits

- **Free Tier**: 1GB storage
- **Avatar Size**: Max 2MB per file
- **Estimate**: ~500 avatars per GB (at ~2MB each)

For a 1GB free tier, you can store approximately **500 high-quality avatars**.

## 🎨 Customization

### Change File Size Limit

Edit `app/api/upload/avatar/route.ts`:

```typescript
const maxSize = 2 * 1024 * 1024; // Change this value
```

And update the SQL:

```sql
file_size_limit = 2097152 -- Change this value
```

### Add More File Types

Edit allowed types in:
- `app/api/upload/avatar/route.ts`
- `app/(dashboard)/profile/edit/page.tsx`
- SQL script `allowed_mime_types` array

## ✅ Testing Checklist

- [ ] Bucket created in Supabase
- [ ] RLS policies are active
- [ ] Can upload avatar in Edit Profile
- [ ] Avatar appears in navbar
- [ ] Avatar appears in posts
- [ ] Avatar appears in profile page
- [ ] Old avatar is deleted when uploading new one
- [ ] File size validation works
- [ ] File type validation works

## 🎉 Success!

Your avatar upload system is now ready to use! Users can upload custom profile pictures with full validation and security. 🖼️✨

