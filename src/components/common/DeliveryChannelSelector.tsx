'use client';

import React from 'react';
import { Mail, Smartphone } from 'lucide-react';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import { DeliveryChannel } from '@/types/task.types';

export interface ChannelOption {
  id: DeliveryChannel;
  label: string;
  icon: React.ReactNode;
}

export const DELIVERY_CHANNELS: ChannelOption[] = [
  {
    id: 'EMAIL',
    label: 'Email',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: 'WHATSAPP',
    label: 'WhatsApp',
    icon: <WhatsAppIcon size={20} className="fill-current" />,
  },
  {
    id: 'SMS',
    label: 'SMS',
    icon: <Smartphone className="w-5 h-5" />,
  },
];

export interface DeliveryChannelSelectorProps {
  value: string;
  onChange: (channel: DeliveryChannel) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function DeliveryChannelSelector({
  value,
  onChange,
  label = 'Delivery Channel',
  error,
  disabled = false,
  className = '',
}: DeliveryChannelSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-txt-main">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-3">
        {DELIVERY_CHANNELS.map((ch) => {
          const isSelected = value?.toUpperCase() === ch.id;
          return (
            <button
              type="button"
              key={ch.id}
              disabled={disabled}
              onClick={() => onChange(ch.id)}
              className={`flex flex-col items-center justify-center gap-2 py-3.5 px-3 rounded-2xl border transition-all text-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'bg-[#0F1E36] text-white border-[#0F1E36] shadow-md ring-2 ring-[#0F1E36]/20'
                  : 'bg-surface text-txt-main border-divider hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div
                className={`transition-transform duration-150 ${
                  isSelected ? 'scale-110 text-white' : 'text-txt-sub'
                }`}
              >
                {ch.icon}
              </div>
              <span
                className={`text-xs font-bold tracking-tight ${
                  isSelected ? 'text-white' : 'text-txt-main'
                }`}
              >
                {ch.label}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium leading-4 text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
