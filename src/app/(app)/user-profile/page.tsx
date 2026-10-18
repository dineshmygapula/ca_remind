'use client';

import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CreditCard,
  Edit2,
  Save,
  X,
  Loader2,
  Copy,
  Check,
  Sparkles,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { getCurrentUser, updateUser } from '@/services/userService';
import { User, UpdateUserDto } from '@/types/user';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import UserProfileSkeleton from '@/components/common/UserProfileSkeleton';

// Shared style tokens for this page
const labelCls = "block mb-2 text-[13.5px] font-bold text-txt-main";
const inputCls =
  "w-full h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-[15px] font-semibold text-txt-main " +
  "placeholder:text-txt-sub/70 outline-none transition-colors hover:border-txt-sub " +
  "focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";
const valueCls =
  "flex items-center gap-2.5 min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 text-[15px] font-semibold text-txt-main";
const cardCls = "rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6";
const cardHeadCls = "flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border)]";

export default function UserProfilePage() {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCurrentUser();
      setUser(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setPhone(data.mobileNumber || data.phone || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success('User ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.mobileNumber || user.phone || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone.trim())) {
      toast.error('Mobile number must be a valid 10-digit number');
      return;
    }

    try {
      setSaving(true);
      const dto: UpdateUserDto = {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
      };

      const updated = await updateUser(dto);
      setUser(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User';
  const initials = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase() +
    (user?.lastName?.[0] || '').toUpperCase();

  if (loading) {
    return <UserProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-bg py-10">
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 sm:px-6">
        {/* ── Error Banner ── */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 py-3 pl-4 pr-2 text-red-700"
          >
            <span className="pt-1.5 text-sm">{error}</span>
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-red-100"
              onClick={() => setError('')}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Page header ── */}
        <div>
          <h1 className="text-3xl sm:text-[34px] leading-tight font-extrabold tracking-tight text-[var(--heading)]">
            Profile
          </h1>
          <p className="mt-1.5 text-base text-txt-sub">
            Manage your personal details, plan and account information.
          </p>
        </div>

        {/* ── Profile hero ── */}
        <section className="relative overflow-hidden rounded-[20px] bg-[var(--primary)] p-6 sm:p-8 text-white">
          <svg
            aria-hidden="true"
            width="520"
            height="520"
            viewBox="0 0 760 760"
            fill="none"
            className="pointer-events-none absolute -right-40 -top-40"
          >
            <circle cx="380" cy="380" r="370" stroke="#F2B63F" strokeOpacity=".16" strokeWidth="2" />
            <circle cx="380" cy="380" r="270" stroke="#fff" strokeOpacity=".08" strokeWidth="2" />
            <circle cx="380" cy="380" r="170" stroke="#F2B63F" strokeOpacity=".12" strokeWidth="2" />
          </svg>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-extrabold text-navy">
                {initials}
                <span
                  className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-[var(--primary)] bg-emerald-400"
                  title="Active account"
                />
              </div>

              {/* Name & tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">{fullName}</h2>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {user?.roles || 'Owner'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
                <p className="flex items-center gap-2 font-mono text-sm text-white/80">
                  <Mail className="h-4 w-4 text-[var(--accent)]" />
                  {user?.email || 'No email associated'}
                </p>
                <p className="flex items-center gap-2 text-[13px] text-white/65">
                  <Calendar className="h-4 w-4" />
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '2024'}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 self-start md:self-center">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition-colors hover:bg-white/20"
                >
                  <Edit2 className="h-4 w-4 text-[var(--accent)]" />
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="h-12 rounded-[14px] px-5 text-sm font-bold text-white/85 transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={saving}
                    className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[var(--accent)] px-5 text-sm font-extrabold text-navy transition-[filter] hover:brightness-105 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save changes
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Left two columns ── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal information */}
            <section className={cardCls} aria-labelledby="personal-heading">
              <div className={cardHeadCls}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                    <UserIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 id="personal-heading" className="text-[17px] font-extrabold tracking-tight text-txt-main">
                      Personal information
                    </h3>
                    <p className="text-sm text-txt-sub">Your personal details and contact identity</p>
                  </div>
                </div>
                {isEditing && (
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700">
                    Editing
                  </span>
                )}
              </div>

              <form id="profile-form" onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* First name */}
                  <div>
                    <label htmlFor="firstName" className={labelCls}>
                      First name <span className="text-red-600">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className={inputCls}
                        required
                      />
                    ) : (
                      <p className={valueCls}>{user?.firstName || '—'}</p>
                    )}
                  </div>

                  {/* Last name */}
                  <div>
                    <label htmlFor="lastName" className={labelCls}>Last name</label>
                    {isEditing ? (
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className={inputCls}
                      />
                    ) : (
                      <p className={valueCls}>{user?.lastName || '—'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Mobile number */}
                  <div>
                    <label htmlFor="phone" className={labelCls}>Mobile number</label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-sub" />
                        <input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className={`${inputCls} pl-11 font-mono`}
                          maxLength={10}
                        />
                      </div>
                    ) : (
                      <p className={`${valueCls} font-mono`}>
                        <Phone className="h-4 w-4 text-txt-sub" />
                        {user?.mobileNumber || user?.phone || '—'}
                      </p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <span className={labelCls}>
                      Email address <span className="font-medium text-txt-sub">(primary, cannot be changed)</span>
                    </span>
                    <p className={`${valueCls} justify-between font-mono`}>
                      <span className="truncate">{user?.email || '—'}</span>
                      <ShieldCheck className="ml-1 h-4 w-4 shrink-0 text-emerald-600" />
                    </p>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <span className={labelCls}>Account username</span>
                  <p className={`${valueCls} font-mono`}>
                    @{user?.username || user?.email?.split('@')[0] || 'user'}
                  </p>
                </div>
              </form>
            </section>

            {/* Subscription */}
            <section className={cardCls} aria-labelledby="plan-heading">
              <div className={cardHeadCls}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 id="plan-heading" className="text-[17px] font-extrabold tracking-tight text-txt-main">
                      Subscription &amp; plan
                    </h3>
                    <p className="text-sm text-txt-sub">Current active tier and billing cycle</p>
                  </div>
                </div>
                <Link
                  href="/subscription"
                  className="inline-flex min-h-11 shrink-0 items-center px-1 text-sm font-bold text-[var(--primary)] hover:underline"
                >
                  Manage plan &rarr;
                </Link>
              </div>

              {user?.razorpaySubscriptionData ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <p className="text-[13px] font-semibold text-txt-sub">Plan tier</p>
                    <p className="mt-1 text-base font-extrabold text-txt-main">
                      {user.razorpaySubscriptionData.planName || 'Pro Tier'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <p className="text-[13px] font-semibold text-txt-sub">Status</p>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {user.razorpaySubscriptionData.subscriptionStatus || 'Active'}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <p className="text-[13px] font-semibold text-txt-sub">Next renewal</p>
                    <p className="mt-1 font-mono text-base font-semibold text-txt-main">
                      {user.razorpaySubscriptionData.nextBillingDate
                        ? new Date(user.razorpaySubscriptionData.nextBillingDate).toLocaleDateString('en-IN')
                        : '—'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-navy">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[15px] font-extrabold text-txt-main">Standard business workspace</p>
                      <p className="text-sm text-txt-sub">Access to all core compliance modules &amp; reminder engines.</p>
                    </div>
                  </div>
                  <Link
                    href="/subscription"
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-navy px-5 text-sm font-bold text-white hover:bg-navy-hover"
                  >
                    View plans
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6">
            {/* Account credentials */}
            <section className={cardCls} aria-labelledby="creds-heading">
              <div className={`${cardHeadCls} justify-start`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--primary)]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 id="creds-heading" className="text-[17px] font-extrabold tracking-tight text-txt-main">
                  Account details
                </h3>
              </div>

              <div className="space-y-4">
                {/* User ID with copy */}
                <div>
                  <p className="mb-2 text-[13.5px] font-bold text-txt-main">System user ID</p>
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] py-1 pl-4 pr-1 font-mono text-sm text-txt-main">
                    <span className="truncate pr-2">{user?.id || '—'}</span>
                    <button
                      type="button"
                      onClick={handleCopyUserId}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-txt-sub transition-colors hover:bg-[var(--bg)] hover:text-txt-main"
                      aria-label="Copy user ID"
                      title="Copy user ID"
                    >
                      {copiedId ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <p className="mb-2 text-[13.5px] font-bold text-txt-main">Assigned role</p>
                  <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 text-[15px] font-semibold text-txt-main">
                    <KeyRound className="h-4 w-4 text-[var(--primary)]" />
                    <span>{user?.roles || 'Owner / Administrator'}</span>
                  </div>
                </div>

                {/* Created / updated */}
                <dl className="space-y-2.5 border-t border-[var(--border)] pt-4 text-sm text-txt-sub">
                  <div className="flex justify-between gap-3">
                    <dt>Account created</dt>
                    <dd className="font-mono font-semibold text-txt-main">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Last updated</dt>
                    <dd className="font-mono font-semibold text-txt-main">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-IN') : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Quick links */}
            <section className={cardCls} aria-labelledby="links-heading">
              <h3 id="links-heading" className="mb-3 text-[17px] font-extrabold tracking-tight text-txt-main">
                Related settings
              </h3>
              <nav className="-mx-2 space-y-0.5">
                {[
                  { href: '/business-profile', label: 'Business & firm profile' },
                  { href: '/staff', label: 'Staff & team management' },
                  { href: '/subscription', label: 'Billing & subscription' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex min-h-12 items-center justify-between rounded-xl px-3 text-[15px] font-bold text-txt-main transition-colors hover:bg-[var(--surface-subtle)]"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="h-4 w-4 text-txt-sub" />
                  </Link>
                ))}
              </nav>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}