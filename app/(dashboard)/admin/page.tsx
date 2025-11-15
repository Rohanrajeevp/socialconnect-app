'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Activity } from 'lucide-react';

interface Stats {
  users: {
    total: number;
    active: number;
    activeToday: number;
  };
  posts: {
    total: number;
    createdToday: number;
  };
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalFollows: number;
  };
}

export default function AdminDashboardPage() {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.is_admin) {
        router.push('/feed');
      }
    }
  }, [user, isLoading, router]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user && user.is_admin) {
      fetchStats();
    }
  }, [user]);

  if (isLoading || !user || !user.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {isLoadingStats ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.users.active} active users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.posts.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.posts.createdToday} created today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.activeToday}</div>
                  <p className="text-xs text-muted-foreground">
                    users logged in today
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                    <p className="text-2xl font-bold">{stats.engagement.totalLikes}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Comments</p>
                    <p className="text-2xl font-bold">{stats.engagement.totalComments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Follows</p>
                    <p className="text-2xl font-bold">{stats.engagement.totalFollows}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/users">
                    <Button className="w-full">Manage Users</Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    View and manage all users, deactivate accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/posts">
                    <Button className="w-full">Manage Posts</Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    View all posts and remove inappropriate content
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}


