'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ImagePlus, X, Send } from 'lucide-react';
import { AvatarRenderer } from '@/components/AvatarRenderer';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: 'File size exceeds 5MB limit',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setShowImageInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Allow image-only posts
    if (!content.trim() && !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please add some content or an image',
        variant: 'destructive',
      });
      return;
    }

    if (content.length > 280) {
      toast({
        title: 'Error',
        description: 'Post content must be 280 characters or less',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';

      // Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        console.log('[CreatePost] Starting image upload...');
        console.log('[CreatePost] Access token exists:', !!accessToken);
        
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        console.log('[CreatePost] Upload response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          console.error('[CreatePost] Upload error:', error);
          throw new Error(error.error || 'Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        console.log('[CreatePost] Upload successful:', uploadData);
        imageUrl = uploadData.url;
        setIsUploading(false);
      }

      // Create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content,
          image_url: imageUrl || undefined,
          category: 'general',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      toast({
        title: 'Success',
        description: 'Post created successfully',
      });

      setContent('');
      handleRemoveImage();
      onPostCreated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="glass-strong rounded-2xl p-6 fade-in">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <AvatarRenderer
            avatarUrl={user.avatar_url}
            fallbackName={`${user.first_name} ${user.last_name}`}
            className="h-12 w-12 ring-2 ring-white/10"
          />

          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's on your mind? (Optional if you add an image)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 rounded-xl"
              maxLength={280}
            />

            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${content.length > 260 ? 'text-red-400' : 'text-gray-400'}`}>
                {content.length}/280
              </span>
            </div>

            {showImageInput && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                {!imagePreview ? (
                  <div className="flex gap-2">
                    <label className="flex-1 h-10 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 flex items-center justify-center text-sm text-gray-400 hover:border-white/40 hover:bg-white/10 cursor-pointer transition-all">
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Choose an image...
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="text-gray-400 hover:text-white hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {selectedFile && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2 text-xs text-gray-300">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowImageInput(!showImageInput)}
                className="text-gray-400 hover:text-white hover:bg-white/5"
                disabled={isSubmitting || isUploading}
              >
                <ImagePlus className="h-5 w-5 mr-2" />
                {showImageInput ? 'Cancel' : 'Add Image'}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isUploading || (!content.trim() && !selectedFile)}
                className="btn-premium px-6"
              >
                {isUploading ? (
                  <>
                    <div className="spinner mr-2 h-4 w-4"></div>
                    Uploading...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="spinner mr-2 h-4 w-4"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

