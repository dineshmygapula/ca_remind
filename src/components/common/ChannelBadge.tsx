'use client';

import React from 'react';
import { Mail, Smartphone, Bell } from 'lucide-react';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';

export interface ChannelBadgeProps {
  channel?: string | null;
  className?: string;
}

export default function ChannelBadge({ channel, className = '' }: ChannelBadgeProps) {
  const ch = (channel || '').toUpperCase();

  if (ch === 'WHATSAPP') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 shadow-2xs ${className}`}
      >
        <WhatsAppIcon size={14} className="fill-current shrink-0 text-[#047857] dark:text-emerald-300" />
        <span>WhatsApp</span>
      </span>
    );
  }

  if (ch === 'EMAIL') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 shadow-2xs ${className}`}
      >
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span>Email</span>
      </span>
    );
  }

  if (ch === 'SMS') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef2ff] text-[#4338ca] dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 shadow-2xs ${className}`}
      >
        <Smartphone className="h-3.5 w-3.5 shrink-0" />
        <span>SMS</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 shadow-2xs ${className}`}
    >
      <Bell className="h-3.5 w-3.5 shrink-0" />
      <span>{channel || '—'}</span>
    </span>
  );
}
