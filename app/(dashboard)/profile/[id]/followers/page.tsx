'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import { AvatarRenderer } from '@/components/AvatarRenderer';

interface Follower {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_following?: boolean;
}

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);
  const userId = params.id as string;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (userId) {
      loadFollowers();
    }
  }, [user, isLoading, userId, router]);

  const loadFollowers = async () => {
    setIsLoadingFollowers(true);
    try {
      const response = await fetch(`/api/users/${userId}/followers`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers || []);
      }
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const handleFollow = async (followUserId: string) => {
    try {
      const response = await fetch(`/api/users/${followUserId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setFollowers(prev => prev.map(f => 
          f.id === followUserId ? { ...f, is_following: true } : f
        ));
        toast({ title: 'Success', description: 'Now following user' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to follow user', variant: 'destructive' });
    }
  };

  const handleUnfollow = async (followUserId: string) => {
    try {
      const response = await fetch(`/api/users/${followUserId}/follow`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setFollowers(prev => prev.map(f => 
          f.id === followUserId ? { ...f, is_following: false } : f
        ));
        toast({ title: 'Success', description: 'Unfollowed user' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to unfollow user', variant: 'destructive' });
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-2xl">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Followers</h1>
          </div>

          {isLoadingFollowers ? (
            <div className="text-center py-8">
              <div className="spinner-lg mx-auto mb-2"></div>
              <p className="text-gray-400">Loading followers...</p>
            </div>
          ) : followers.length > 0 ? (
            <div className="space-y-4">
              {followers.map((follower) => (
                <div key={follower.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                  <Link href={`/profile/${follower.id}`}>
                    <AvatarRenderer
                      avatarUrl={follower.avatar_url}
                      fallbackName={`${follower.first_name} ${follower.last_name}`}
                      className="h-12 w-12 ring-2 ring-white/10"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${follower.id}`} className="font-semibold text-white hover:text-gray-300">
                      {follower.first_name} {follower.last_name}
                    </Link>
                    <p className="text-sm text-gray-400">@{follower.username}</p>
                    {follower.bio && <p className="text-sm text-gray-500 mt-1">{follower.bio}</p>}
                  </div>
                  {follower.id !== user.id && (
                    follower.is_following ? (
                      <Button variant="outline" size="sm" onClick={() => handleUnfollow(follower.id)} className="text-gray-400 hover:text-white">
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleFollow(follower.id)} className="btn-premium">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No followers yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

