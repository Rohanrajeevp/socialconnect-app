'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarRendererProps {
  avatarUrl: string | null | undefined;
  fallbackName: string;
  className?: string;
}

export function AvatarRenderer({ avatarUrl, fallbackName, className = '' }: AvatarRendererProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl || undefined} alt={fallbackName} />
      <AvatarFallback className="bg-white/10 text-white font-semibold">
        {getInitials(fallbackName)}
      </AvatarFallback>
    </Avatar>
  );
}

