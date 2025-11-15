'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { CreatePostForm } from '@/components/CreatePostForm';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Post } from '@/types';

export default function FeedPage() {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Feed Page State:', { isLoading, hasUser: !!user, hasToken: !!accessToken });
  }, [isLoading, user, accessToken]);

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('⚠️ No user found, redirecting to login...');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const url = showFollowingOnly 
        ? '/api/posts?following=true'
        : '/api/posts';
      
      const response = await fetch(url, {
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
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
    if (user) {
      fetchPosts();
    }
  }, [user, showFollowingOnly]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering feed page for user:', user?.username);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post */}
          <CreatePostForm onPostCreated={fetchPosts} />

          {/* Feed Filter */}
          <div className="flex gap-3 glass rounded-2xl p-2">
            <Button
              variant="ghost"
              onClick={() => setShowFollowingOnly(false)}
              className={`flex-1 rounded-xl transition-all duration-300 ${
                !showFollowingOnly
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Posts
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowFollowingOnly(true)}
              className={`flex-1 rounded-xl transition-all duration-300 ${
                showFollowingOnly
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Following
            </Button>
          </div>

          {/* Posts */}
          {isLoadingPosts ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center fade-in">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400">
                {showFollowingOnly 
                  ? 'Follow some users to see their posts here!'
                  : 'Be the first to share something amazing!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <PostCard
                    post={post}
                    onDelete={fetchPosts}
                    onLikeChange={fetchPosts}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

