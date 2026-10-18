'use client';

import React, { ReactNode, useState } from 'react';
import {
  LucideIcon,
  Edit2,
  Save,
  X,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ProfileBadgeItem {
  label: string;
  variant?: 'role' | 'success' | 'info' | 'warning' | 'neutral';
  icon?: LucideIcon;
}

export interface ProfileContactItem {
  icon: LucideIcon;
  text: string;
  href?: string;
}

export interface ProfileMetaItem {
  icon: LucideIcon;
  text: string;
}

export interface ProfileHeroConfig {
  avatar?: {
    text?: string;
    icon?: LucideIcon;
  };
  title: string;
  badges?: ProfileBadgeItem[];
  contactInfo?: ProfileContactItem[];
  metaInfo?: ProfileMetaItem[];
  isEditing: boolean;
  saving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave?: (e: React.FormEvent) => void;
  formId?: string;
  editLabel?: string;
  saveLabel?: string;
  isActive?: boolean;
}

export interface ProfileLayoutProps {
  pageTitle: string;
  pageDescription?: string;
  error?: string | null;
  onDismissError?: () => void;
  hero: ProfileHeroConfig;
  children: ReactNode;
  sidebar?: ReactNode;
}

// ─────────────────────────────────────────────
// 1. ProfilePageLayout (Main Wrapper)
// ─────────────────────────────────────────────

export default function ProfileLayout({
  pageTitle,
  pageDescription,
  error,
  onDismissError,
  hero,
  children,
  sidebar,
}: ProfileLayoutProps) {
  const {
    avatar,
    title,
    badges = [],
    contactInfo = [],
    metaInfo = [],
    isEditing,
    saving = false,
    onEdit,
    onCancel,
    onSave,
    formId,
    editLabel = 'Edit profile',
    saveLabel = 'Save changes',
    isActive = true,
  } = hero;

  const AvatarIcon = avatar?.icon;

  return (
    <div className="min-h-screen bg-bg py-8 sm:py-10">
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 sm:px-6">
        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 py-3.5 pl-4 pr-2 text-red-700 shadow-xs dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          >
            <span className="pt-0.5 text-sm font-medium">{error}</span>
            {onDismissError && (
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl hover:bg-red-100 transition-colors dark:hover:bg-red-900/40 cursor-pointer"
                onClick={onDismissError}
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Page Top Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight text-[var(--heading)]">
            {pageTitle}
          </h1>
          {pageDescription && (
            <p className="text-sm sm:text-[15px] text-txt-sub">
              {pageDescription}
            </p>
          )}
        </div>

        {/* Executive Profile Hero Banner */}
        <section className="relative overflow-hidden rounded-[24px] bg-[var(--primary)] p-6 sm:p-8 text-white shadow-md border border-[var(--border)]">
          {/* Subtle Decorative Geometry */}
          <svg
            aria-hidden="true"
            width="520"
            height="520"
            viewBox="0 0 760 760"
            fill="none"
            className="pointer-events-none absolute -right-36 -top-36 select-none opacity-75"
          >
            <circle cx="380" cy="380" r="370" stroke="#F2B63F" strokeOpacity=".18" strokeWidth="2" />
            <circle cx="380" cy="380" r="270" stroke="#ffffff" strokeOpacity=".1" strokeWidth="2" />
            <circle cx="380" cy="380" r="170" stroke="#F2B63F" strokeOpacity=".14" strokeWidth="2" />
          </svg>

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Avatar & Identity details */}
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Avatar Box */}
              <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-black text-navy shadow-md ring-4 ring-white/10">
                {AvatarIcon ? <AvatarIcon className="h-9 w-9 text-navy" /> : (avatar?.text || 'P')}
                {isActive && (
                  <span
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-[var(--primary)] bg-emerald-400 shadow-xs"
                    title="Active status"
                  />
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-[26px] font-black tracking-tight text-white">
                    {title}
                  </h2>

                  {/* Badges */}
                  {badges.map((b, idx) => {
                    const BIcon = b.icon;
                    if (b.variant === 'success') {
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur-sm"
                        >
                          {BIcon ? <BIcon className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                          {b.label}
                        </span>
                      );
                    }
                    if (b.variant === 'warning') {
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-200 backdrop-blur-sm"
                        >
                          {BIcon && <BIcon className="h-3.5 w-3.5" />}
                          {b.label}
                        </span>
                      );
                    }
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm"
                      >
                        {BIcon && <BIcon className="h-3.5 w-3.5" />}
                        {b.label}
                      </span>
                    );
                  })}
                </div>

                {/* Contact items */}
                {contactInfo.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-sm text-white/85">
                    {contactInfo.map((ci, idx) => {
                      const CIcon = ci.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <CIcon className="h-4 w-4 text-[var(--accent)] shrink-0" />
                          <span>{ci.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Meta items */}
                {metaInfo.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-white/70">
                    {metaInfo.map((mi, idx) => {
                      const MIcon = mi.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <MIcon className="h-3.5 w-3.5 text-white/50 shrink-0" />
                          <span>{mi.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 self-start md:self-center">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex h-11 sm:h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-[var(--accent)]" />
                  <span>{editLabel}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="h-11 sm:h-12 rounded-xl px-4 sm:px-5 text-sm font-bold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type={formId ? 'submit' : 'button'}
                    form={formId}
                    onClick={!formId ? onSave : undefined}
                    disabled={saving}
                    className="inline-flex h-11 sm:h-12 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-extrabold text-navy shadow-md transition-all hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saveLabel}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main 2-column Content */}
          <div className="space-y-6 lg:col-span-2">
            {children}
          </div>

          {/* Sidebar 1-column Content */}
          {sidebar && (
            <div className="space-y-6">
              {sidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. ProfileCard Component
// ─────────────────────────────────────────────

export interface ProfileCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  isEditing?: boolean;
  editingBadgeText?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ProfileCard({
  icon: Icon,
  title,
  subtitle,
  isEditing = false,
  editingBadgeText = 'Editing',
  action,
  children,
  className = '',
}: ProfileCardProps) {
  return (
    <section className={`rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)] dark:text-[var(--accent)] border border-[var(--border)]/60">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-[17px] font-extrabold tracking-tight text-txt-main">
              {title}
            </h3>
            {subtitle && <p className="text-xs sm:text-sm text-txt-sub">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <span className="shrink-0 rounded-full bg-amber-500/15 border border-amber-500/25 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
              {editingBadgeText}
            </span>
          )}
          {action}
        </div>
      </div>

      {/* Body */}
      <div>{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 3. ProfileField Component
// ─────────────────────────────────────────────

export interface ProfileFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  isEditing: boolean;
  value?: ReactNode;
  icon?: LucideIcon;
  isMono?: boolean;
  rightBadge?: ReactNode;
  children: ReactNode;
  colSpan?: '1' | '2';
  className?: string;
}

export function ProfileField({
  label,
  required = false,
  hint,
  isEditing,
  value,
  icon: Icon,
  isMono = false,
  rightBadge,
  children,
  colSpan = '1',
  className = '',
}: ProfileFieldProps) {
  return (
    <div className={`${colSpan === '2' ? 'sm:col-span-2' : ''} ${className}`}>
      <label className="block mb-2 text-[13px] font-bold text-txt-main">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {hint && <span className="ml-1 text-xs font-normal text-txt-sub">({hint})</span>}
      </label>

      {isEditing ? (
        children
      ) : (
        <div
          className={`flex items-center justify-between gap-2.5 min-h-[46px] rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-2 text-sm font-semibold text-txt-main ${
            isMono ? 'font-mono' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            {Icon && <Icon className="h-4 w-4 text-txt-sub shrink-0" />}
            <span className="truncate">{value || <span className="text-txt-sub/60 font-normal italic">—</span>}</span>
          </div>
          {rightBadge}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. ProfileIdentifiersCard
// ─────────────────────────────────────────────

export interface IdentifierItem {
  label: string;
  value: string;
  copyable?: boolean;
}

export interface TimestampItem {
  label: string;
  value?: string | null;
}

export interface ProfileIdentifiersCardProps {
  title?: string;
  icon?: LucideIcon;
  identifiers: IdentifierItem[];
  timestamps?: TimestampItem[];
}

export function ProfileIdentifiersCard({
  title = 'System Identifiers',
  icon: Icon = ShieldCheck,
  identifiers,
  timestamps = [],
}: ProfileIdentifiersCardProps) {
  const toast = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string, label: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border)]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)] dark:text-[var(--accent)] border border-[var(--border)]/60">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-[15px] font-extrabold tracking-tight text-txt-main">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {identifiers.map((item, idx) => (
          <div key={idx}>
            <p className="mb-1.5 text-xs font-bold text-txt-sub uppercase tracking-wider">
              {item.label}
            </p>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] py-1 pl-3.5 pr-1 font-mono text-xs text-txt-main">
              <span className="truncate pr-2">{item.value || '—'}</span>
              {item.copyable && item.value && (
                <button
                  type="button"
                  onClick={() => handleCopy(item.label, item.value, item.label)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-txt-sub transition-colors hover:bg-[var(--bg)] hover:text-txt-main cursor-pointer"
                  aria-label={`Copy ${item.label}`}
                  title={`Copy ${item.label}`}
                >
                  {copiedKey === item.label ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {timestamps.length > 0 && (
          <dl className="space-y-2 border-t border-[var(--border)]/70 pt-3.5 text-xs text-txt-sub">
            {timestamps.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center gap-2">
                <dt>{t.label}</dt>
                <dd className="font-mono font-semibold text-txt-main">
                  {t.value ? new Date(t.value).toLocaleDateString('en-IN') : '—'}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 5. ProfileQuickLinksCard
// ─────────────────────────────────────────────

export interface QuickLinkItem {
  href: string;
  label: string;
}

export interface ProfileQuickLinksCardProps {
  title?: string;
  links: QuickLinkItem[];
}

export function ProfileQuickLinksCard({
  title = 'Related settings',
  links,
}: ProfileQuickLinksCardProps) {
  return (
    <section className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-txt-sub">
        {title}
      </h3>
      <nav className="-mx-2 space-y-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex min-h-11 items-center justify-between rounded-xl px-3 text-[14px] font-bold text-txt-main transition-colors hover:bg-[var(--surface-subtle)]"
          >
            <span>{link.label}</span>
            <ExternalLink className="h-3.5 w-3.5 text-txt-sub" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
