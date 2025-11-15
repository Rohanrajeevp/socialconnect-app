'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { AvatarRenderer } from '@/components/AvatarRenderer';
import { useToast } from '@/components/ui/use-toast';
import { User, Post } from '@/types';
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user: currentUser, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setProfileUser(data);
        setIsFollowing(data.is_following || false);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?author_id=${params.id}`, {
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
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchPosts();
    }
  }, [currentUser, params.id]);

  const handleFollow = async () => {
    if (!currentUser || isFollowLoading) return;

    setIsFollowLoading(true);
    const newFollowState = !isFollowing;

    try {
      const response = await fetch(`/api/users/${params.id}/follow`, {
        method: newFollowState ? 'POST' : 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      setIsFollowing(newFollowState);
      
      // Update follower count locally without reloading
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          followers_count: newFollowState 
            ? (profileUser.followers_count || 0) + 1 
            : Math.max((profileUser.followers_count || 0) - 1, 0),
        });
      }

      toast({
        title: 'Success',
        description: newFollowState ? 'Successfully followed user' : 'Successfully unfollowed user',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !currentUser) {
    return null;
  }

  const isOwnProfile = currentUser.id === params.id;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-4xl">
        {isLoadingProfile ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        ) : profileUser ? (
          <div className="space-y-6 fade-in">
            <div className="glass-strong rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <AvatarRenderer
                  avatarUrl={profileUser.avatar_url}
                  fallbackName={`${profileUser.first_name} ${profileUser.last_name}`}
                  className="h-24 w-24 ring-4 ring-white/10"
                />

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        {profileUser.first_name} {profileUser.last_name}
                      </h1>
                      <p className="text-gray-400">@{profileUser.username}</p>
                    </div>
                    {isOwnProfile ? (
                      <Link href="/profile/edit">
                        <Button className="btn-premium">Edit Profile</Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={isFollowing ? 'bg-white/5 hover:bg-white/10 text-white' : 'btn-premium'}
                      >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </div>

                  {profileUser.bio && (
                    <p className="mt-4 text-gray-300">{profileUser.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                    {profileUser.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profileUser.location}</span>
                      </div>
                    )}
                    {profileUser.website && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        <a
                          href={profileUser.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          {profileUser.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profileUser.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-6 mt-4">
                    <div>
                      <span className="font-bold text-white">{profileUser.posts_count || 0}</span>
                      <span className="text-gray-400 ml-1">Posts</span>
                    </div>
                    <Link href={`/profile/${params.id}/followers`}>
                      <div className="hover:text-white transition-colors">
                        <span className="font-bold text-white">{profileUser.followers_count || 0}</span>
                        <span className="text-gray-400 ml-1">Followers</span>
                      </div>
                    </Link>
                    <Link href={`/profile/${params.id}/following`}>
                      <div className="hover:text-white transition-colors">
                        <span className="font-bold text-white">{profileUser.following_count || 0}</span>
                        <span className="text-gray-400 ml-1">Following</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
              {posts.length === 0 ? (
                <div className="glass-strong rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                  <p className="text-gray-400">
                    {isOwnProfile ? "Start sharing your thoughts!" : "No posts from this user yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onDelete={fetchPosts}
                      onLikeChange={fetchPosts}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-white mb-2">User not found</h3>
            <p className="text-gray-400">This user doesn't exist or has been removed</p>
          </div>
        )}
      </div>
    </div>
  );
}


