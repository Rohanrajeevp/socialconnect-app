-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for post-images bucket

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- Policy: Allow public read access to images
CREATE POLICY "Public read access for post images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Policy: Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

