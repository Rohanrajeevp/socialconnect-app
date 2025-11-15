'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AVATAR_OPTIONS, parseAvatarId } from './AvatarPicker';

interface AvatarDisplayProps {
  avatarUrl: string | null | undefined;
  fallback: string;
  className?: string;
}

export function AvatarDisplay({ avatarUrl, fallback, className }: AvatarDisplayProps) {
  // Check if it's an avatar ID
  const avatarId = parseAvatarId(avatarUrl);
  
  if (avatarId) {
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
    if (avatar) {
      return (
        <div
          className={`flex items-center justify-center text-4xl ${className}`}
          style={{ backgroundColor: avatar.bg }}
        >
          {avatar.emoji}
        </div>
      );
    }
  }

  // Regular avatar URL
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl || undefined} />
      <AvatarFallback className="bg-white/10 text-white font-semibold">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}

