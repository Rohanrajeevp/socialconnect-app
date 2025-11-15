'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Post } from '@/types';

export default function AdminPostsPage() {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'username'>('recent');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.is_admin) {
        router.push('/feed');
      }
    }
  }, [user, isLoading, router]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch('/api/admin/posts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user && user.is_admin) {
      fetchPosts();
    }
  }, [user]);

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/admin/posts/${postToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Post deleted successfully',
        });
        fetchPosts();
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setPostToDelete(null);
    }
  };

  if (isLoading || !user || !user.is_admin) {
    return null;
  }

  // Sort posts based on selected sorting option
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'username') {
      const usernameA = a.author?.username?.toLowerCase() || '';
      const usernameB = b.author?.username?.toLowerCase() || '';
      return usernameA.localeCompare(usernameB);
    }
    // Default: sort by recent (created_at)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Post Management</h1>
          <Link href="/admin">
            <Button variant="outline" className="text-white hover:bg-white/10">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">All Posts</h2>
            
            {/* Sort Options */}
            <div className="flex gap-2 glass rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy('recent')}
                className={`rounded-lg transition-all ${
                  sortBy === 'recent'
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Recent
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy('username')}
                className={`rounded-lg transition-all ${
                  sortBy === 'username'
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                By Username
              </Button>
            </div>
          </div>
          
          {isLoadingPosts ? (
            <div className="text-center py-12">
              <div className="spinner-lg mx-auto mb-4"></div>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-400">No posts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPosts.map((post) => (
                <div key={post.id} className="relative group">
                  <div className="glass rounded-xl overflow-hidden hover-scale">
                    {/* Post Preview */}
                    <div className="p-4">
                      {/* Author Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <Link href={`/profile/${post.author?.id}`} className="flex items-center gap-2 flex-1">
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white">
                            {post.author?.username?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white truncate">
                              {post.author?.first_name} {post.author?.last_name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">@{post.author?.username}</p>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Content Preview */}
                      {post.content && (
                        <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                          {post.content}
                        </p>
                      )}
                      
                      {/* Image Preview */}
                      {post.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <span>❤️ {post.like_count}</span>
                        <span>💬 {post.comment_count}</span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/posts/${post.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full text-white hover:bg-white/10 border-white/10">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setPostToDelete(post.id)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!postToDelete}
        title="Delete Post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeletePost}
        onCancel={() => setPostToDelete(null)}
        variant="danger"
      />
    </div>
  );
}


