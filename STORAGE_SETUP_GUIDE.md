# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for image uploads in your SocialConnect application.

## 📋 Prerequisites

- Supabase project already created
- Access to Supabase Dashboard

## 🚀 Setup Steps

### Step 1: Create Storage Bucket (Manual Method)

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://app.supabase.com
   - Click on **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **"New bucket"** button
   - Enter the following details:
     - **Name**: `post-images`
     - **Public bucket**: ✅ Enable (Check this box)
     - **File size limit**: `2 MB`
     - **Allowed MIME types**: Leave default or specify: `image/jpeg, image/jpg, image/png, image/gif, image/webp`
   - Click **"Create bucket"**

3. **Set Up Policies (Optional - if needed)**
   - Click on your newly created `post-images` bucket
   - Go to the **Policies** tab
   - The bucket should allow:
     - ✅ Public read access (already enabled by making bucket public)
     - ✅ Authenticated users can upload
     - ✅ Users can delete their own images

### Step 2: Create Storage Bucket (SQL Method)

Alternatively, you can run the SQL script:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the contents of `database/storage-setup.sql`
3. Click **"Run"**

The script will:
- Create the `post-images` bucket
- Set it as public
- Configure file size limits (5MB)
- Set allowed MIME types
- Create storage policies for upload, read, delete, and update

### Step 3: Verify Setup

1. Go to **Storage** in Supabase Dashboard
2. You should see the `post-images` bucket
3. Click on it to verify it's marked as **Public**

## 🎨 How It Works

### Upload Flow

1. User clicks "Add Image" button
2. User selects an image file from their computer
3. Image is validated (type and size)
4. Preview is shown immediately
5. When user submits the post:
   - Image is uploaded to Supabase Storage first
   - Upload returns a public URL
   - Post is created with the image URL
   - Image is displayed in the feed

### File Organization

Images are stored with the following structure:
```
post-images/
  └── {user_id}/
      └── {timestamp}-{random}.{ext}
```

Example: `post-images/abc123/1699999999999-x7k2p9.jpg`

### Security Features

- ✅ File type validation (JPEG, PNG, GIF, WebP only)
- ✅ File size limit (5MB maximum)
- ✅ Users can only delete their own images
- ✅ Public read access for all images
- ✅ Authenticated users only can upload

## 🔧 Supported File Types

- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

## 📏 File Size Limit

- Maximum: **5MB** per image
- Recommended: Keep images under 2MB for faster loading

## 🐛 Troubleshooting

### Error: "Failed to upload image"

**Possible causes:**
1. Storage bucket doesn't exist
2. Bucket is not public
3. Storage policies are not configured
4. File size exceeds 5MB
5. Invalid file type

**Solution:**
- Re-run the storage setup SQL script
- Verify the bucket exists and is public
- Check browser console for detailed error messages

### Error: "Invalid file type"

**Solution:**
- Only use supported image formats (JPEG, PNG, GIF, WebP)
- Convert other formats before uploading

### Error: "File size exceeds 5MB limit"

**Solution:**
- Compress your image before uploading
- Use online tools like TinyPNG or ImageOptim
- Keep images under 2MB for best performance

## 🎯 Testing

1. Go to your feed page
2. Click "Add Image"
3. Select an image from your computer
4. You should see a preview
5. Add some text content
6. Click "Post"
7. Image should upload and appear in your post

## 📝 Notes

- Images are stored permanently unless manually deleted
- Deleting a post does NOT automatically delete the image from storage
- Users can only delete images in folders matching their user ID
- All images are publicly accessible via their URL

## 🔐 Security Considerations

- The `SUPABASE_SERVICE_ROLE_KEY` is used server-side for uploads
- Never expose this key to the client
- Client uploads go through your API endpoint (`/api/upload`)
- The API validates authentication before allowing uploads

## ✅ Verification Checklist

- [ ] Storage bucket `post-images` created
- [ ] Bucket is marked as **Public**
- [ ] File size limit set to 5MB
- [ ] Storage policies configured
- [ ] Test upload successful
- [ ] Image appears in post
- [ ] Image loads correctly

---

**Need help?** Check the Supabase Storage documentation: https://supabase.com/docs/guides/storage

