'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Home, User, Bell, LogOut, Shield, Plus } from 'lucide-react';
import { AvatarRenderer } from '@/components/AvatarRenderer';

export function NavbarPremium() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { path: `/profile/${user.id}`, icon: User, label: 'Profile' },
  ];

  if (user.is_admin) {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3 group">
            <Image
              src="/icons/Social-connect-icon.png"
              alt="SocialConnect"
              width={50}
              height={50}
              className="object-contain transform group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold text-white hidden sm:block">
              SocialConnect
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-black text-xs flex items-center justify-center font-bold shadow-lg">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}

            {/* Profile Menu */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <Link href={`/profile/${user.id}`}>
                <AvatarRenderer
                  avatarUrl={user.avatar_url}
                  fallbackName={`${user.first_name} ${user.last_name}`}
                  className="h-9 w-9 ring-2 ring-white/10 hover:ring-white/30 transition-all cursor-pointer hover-scale"
                />
              </Link>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

