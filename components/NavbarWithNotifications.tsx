'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, User, Bell, LogOut, Shield } from 'lucide-react';

export function NavbarWithNotifications() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/feed" className="text-2xl font-bold text-primary">
            SocialConnect
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/feed">
              <Button
                variant={isActive('/feed') ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Feed</span>
              </Button>
            </Link>

            <Link href="/notifications">
              <Button
                variant={isActive('/notifications') ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 relative"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href={`/profile/${user.id}`}>
              <Button
                variant={isActive(`/profile/${user.id}`) ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>

            {user.is_admin && (
              <Link href="/admin">
                <Button
                  variant={isActive('/admin') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>
                  {getInitials(`${user.first_name} ${user.last_name}`)}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


