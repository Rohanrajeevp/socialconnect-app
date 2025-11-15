'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { User } from '@/types';
import { Ban } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userToDeactivate, setUserToDeactivate] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.is_admin) {
        router.push('/feed');
      }
    }
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const url = search
        ? `/api/admin/users?search=${encodeURIComponent(search)}`
        : '/api/admin/users';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user && user.is_admin) {
      fetchUsers();
    }
  }, [user, search]);

  const handleDeactivate = async () => {
    if (!userToDeactivate) return;

    try {
      const response = await fetch(`/api/admin/users/${userToDeactivate}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User deactivated successfully',
        });
        fetchUsers();
      } else {
        throw new Error('Failed to deactivate user');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate user',
        variant: 'destructive',
      });
    } finally {
      setUserToDeactivate(null);
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

  if (isLoading || !user || !user.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Search users by name, email, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={u.avatar_url} alt={u.username} />
                        <AvatarFallback>
                          {getInitials(`${u.first_name} ${u.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {u.first_name} {u.last_name}
                          {u.is_admin && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                          {!u.is_active && (
                            <span className="ml-2 text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                              Deactivated
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">@{u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        <div>{u.posts_count || 0} posts</div>
                        <div>{u.followers_count || 0} followers</div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/profile/${u.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        {u.is_active && u.id !== user.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setUserToDeactivate(u.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!userToDeactivate}
        title="Deactivate User?"
        message="Are you sure you want to deactivate this user? They will no longer be able to access the platform."
        confirmText="Deactivate"
        cancelText="Cancel"
        onConfirm={handleDeactivate}
        onCancel={() => setUserToDeactivate(null)}
        variant="danger"
      />
    </div>
  );
}


