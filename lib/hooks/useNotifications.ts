'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      console.log('⚠️ useNotifications: No user, skipping');
      return;
    }

    console.log('🔔 useNotifications: Setting up for user', user.id);

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        console.log('📊 Fetching unread notifications count...');
        const { count, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (error) {
          console.error('❌ Failed to fetch notifications:', error);
          return;
        }

        console.log('✅ Unread count:', count);
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('❌ Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time notifications
    try {
      console.log('🔌 Setting up real-time subscription...');
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔔 New notification received');
            setUnreadCount((prev) => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔄 Notification updated');
            // Refetch unread count when notifications are updated
            fetchUnreadCount();
          }
        )
        .subscribe();

      console.log('✅ Real-time subscription active');

      return () => {
        console.log('🔌 Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('❌ Failed to set up real-time subscription:', error);
      // Continue without real-time if it fails
      return () => {};
    }
  }, [user]);

  return { unreadCount };
}

