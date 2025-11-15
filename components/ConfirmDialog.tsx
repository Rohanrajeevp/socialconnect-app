'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-500/10',
      iconColor: 'text-red-400',
      button: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30',
    },
    warning: {
      icon: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      button: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30',
    },
    info: {
      icon: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      button: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="glass-strong rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${style.icon}`}>
            <AlertTriangle className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                {cancelText}
              </Button>
              <Button onClick={onConfirm} className={style.button}>
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

