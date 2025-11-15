'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Notification } from '@/types';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';

export default function NotificationsPage() {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'All notifications marked as read',
        });
        fetchNotifications();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-white fill-current" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-white" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-white" />;
      default:
        return null;
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

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-2xl">
        <div className="glass-strong rounded-2xl overflow-hidden fade-in">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {notifications.some(n => !n.is_read) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            {isLoadingNotifications ? (
              <div className="text-center py-12">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-400">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
                <p className="text-gray-400">When you get notifications, they'll show up here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-4 p-4 rounded-xl transition-all hover-scale ${
                      !notification.is_read ? 'glass' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <Link href={`/profile/${notification.related_user?.id}`}>
                      <Avatar className="h-10 w-10 ring-2 ring-white/10">
                        <AvatarImage
                          src={notification.related_user?.avatar_url}
                          alt={notification.related_user?.username}
                        />
                        <AvatarFallback className="bg-white/10 text-white font-semibold">
                          {notification.related_user &&
                            getInitials(
                              `${notification.related_user.first_name} ${notification.related_user.last_name}`
                            )}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <p className="text-white">
                        <Link href={`/profile/${notification.related_user?.id}`}>
                          <span className="font-semibold hover:text-gray-300 transition-colors">
                            {notification.related_user?.first_name}{' '}
                            {notification.related_user?.last_name}
                          </span>
                        </Link>{' '}
                        <span className="text-gray-400">{notification.content}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    {notification.related_post_id && (
                      <Link href={`/posts/${notification.related_post_id}`}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/5"
                        >
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


