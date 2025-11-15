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

-- Set up storage policies for user avatars
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatar' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access for user avatars
CREATE POLICY "Public read access for user avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-avatar');

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatar' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatar' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

