-- Allow content to be NULL in posts table (for image-only posts)
ALTER TABLE posts ALTER COLUMN content DROP NOT NULL;

-- Add a check constraint to ensure at least content or image_url is present
ALTER TABLE posts ADD CONSTRAINT posts_content_or_image_check 
  CHECK (content IS NOT NULL OR image_url IS NOT NULL);

