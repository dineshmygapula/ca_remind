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
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-bg text-txt-sub">
        <Loader2 className="h-9 w-9 animate-spin text-[var(--accent)] mb-3" />
        <span className="text-sm font-medium">Loading user profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        {/* ── Error Banner ── */}
        {error && (
          <div role="alert" className="alert alert-error flex items-center justify-between text-sm shadow-sm">
            <span>{error}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setError('')}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Executive Profile Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--primary)] via-[#1a2d52] to-[#0f172a] p-6 sm:p-8 text-white shadow-xl">
          {/* Decorative glow elements */}
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar circle */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[#fbbf24] text-navy font-extrabold text-2xl shadow-lg border-2 border-white/20">
                {initials}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white" title="Active Account" />
              </div>

              {/* Title & tags */}
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight text-white">{fullName}</h1>
                  <span className="badge badge-sm bg-white/15 text-white border-white/20 font-bold uppercase tracking-wider text-[10px]">
                    {user?.roles || 'Owner'}
                  </span>
                  <span className="badge badge-sm bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-semibold">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-white/70 font-mono flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[var(--accent)]" />
                  {user?.email || 'No email associated'}
                </p>
                <p className="text-[11px] text-white/50 flex items-center gap-1.5 pt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-white/40" />
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '2024'}
                </p>
              </div>
            </div>

            {/* Header Action Button */}
            <div className="flex items-center gap-2 self-start md:self-center">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-sm transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="btn btn-sm btn-ghost text-white/80 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-sm gap-1.5 rounded-xl bg-[var(--accent)] hover:brightness-110 text-navy border-none font-bold shadow-md"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left 2 Columns: Profile Information Form / Cards ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card: Personal Details */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-txt-main">Personal Information</h2>
                    <p className="text-xs text-txt-sub">Your personal details and contact identity</p>
                  </div>
                </div>
                {isEditing && (
                  <span className="badge badge-sm badge-warning font-semibold">Editing Mode</span>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      First Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="input input-bordered input-sm w-full font-medium"
                        required
                      />
                    ) : (
                      <p className="text-sm font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                        {user?.firstName || '—'}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="input input-bordered input-sm w-full font-medium"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                        {user?.lastName || '—'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      Mobile Number
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="input input-bordered input-sm w-full font-mono font-medium pl-8"
                          maxLength={10}
                        />
                        <Phone className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-sub" />
                      </div>
                    ) : (
                      <p className="text-sm font-mono font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-txt-sub" />
                        {user?.mobileNumber || user?.phone || '—'}
                      </p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      Email Address <span className="text-[10px] text-txt-sub/60 normal-case">(Primary)</span>
                    </label>
                    <p className="text-sm font-mono font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-between">
                      <span className="truncate">{user?.email || '—'}</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 ml-1" />
                    </p>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                    Account Username
                  </label>
                  <p className="text-sm font-mono font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                    @{user?.username || user?.email?.split('@')[0] || 'user'}
                  </p>
                </div>
              </form>
            </div>

            {/* Card: Subscription Overview */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-txt-main">Subscription &amp; Plan</h2>
                    <p className="text-xs text-txt-sub">Current active tier and billing cycle</p>
                  </div>
                </div>
                <Link
                  href="/subscription"
                  className="btn btn-ghost btn-xs gap-1 text-[var(--accent)] font-bold hover:underline"
                >
                  Manage Plan &rarr;
                </Link>
              </div>

              {user?.razorpaySubscriptionData ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-txt-sub">Plan Tier</p>
                    <p className="text-sm font-bold text-txt-main mt-0.5">{user.razorpaySubscriptionData.planName || 'Pro Tier'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-txt-sub">Status</p>
                    <span className="badge badge-sm badge-success text-white font-bold mt-1">
                      {user.razorpaySubscriptionData.subscriptionStatus || 'Active'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-txt-sub">Next Renewal</p>
                    <p className="text-sm font-mono font-semibold text-txt-main mt-0.5">
                      {user.razorpaySubscriptionData.nextBillingDate
                        ? new Date(user.razorpaySubscriptionData.nextBillingDate).toLocaleDateString('en-IN')
                        : '—'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[var(--surface-subtle)] to-[var(--surface)] border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                    <div>
                      <p className="text-xs font-bold text-txt-main">Standard Business Workspace</p>
                      <p className="text-[11px] text-txt-sub">Access to all core compliance modules &amp; reminder engines.</p>
                    </div>
                  </div>
                  <Link
                    href="/subscription"
                    className="btn btn-xs rounded-xl bg-navy text-white hover:bg-navy-hover"
                  >
                    View Plans
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Right 1 Column: Account Security & Metadata ── */}
          <div className="space-y-6">
            {/* Card: Account Identification */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                  Account Credentials
                </h3>
              </div>

              <div className="space-y-3">
                {/* User ID with Copy */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-txt-sub mb-1">
                    System User ID
                  </p>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] font-mono text-xs text-txt-main">
                    <span className="truncate pr-2">{user?.id || '—'}</span>
                    <button
                      type="button"
                      onClick={handleCopyUserId}
                      className="btn btn-ghost btn-xs btn-square shrink-0 text-txt-sub hover:text-txt-main"
                      title="Copy User ID"
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-txt-sub mb-1">
                    Assigned Role
                  </p>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-semibold text-txt-main">
                    <KeyRound className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>{user?.roles || 'Owner / Administrator'}</span>
                  </div>
                </div>

                {/* Created / Updated */}
                <div className="pt-2 border-t border-[var(--border)]/60 text-xs text-txt-sub space-y-1.5">
                  <div className="flex justify-between">
                    <span>Account Created</span>
                    <span className="font-mono text-txt-main">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span className="font-mono text-txt-main">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links card */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                Related Workspace Settings
              </h3>
              <div className="space-y-1">
                <Link
                  href="/business-profile"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-subtle)] text-xs font-bold text-txt-main transition-colors"
                >
                  <span>Business &amp; Firm Profile</span>
                  <ExternalLink className="h-3.5 w-3.5 text-txt-sub" />
                </Link>
                <Link
                  href="/staff"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-subtle)] text-xs font-bold text-txt-main transition-colors"
                >
                  <span>Staff &amp; Team Management</span>
                  <ExternalLink className="h-3.5 w-3.5 text-txt-sub" />
                </Link>
                <Link
                  href="/subscription"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-subtle)] text-xs font-bold text-txt-main transition-colors"
                >
                  <span>Billing &amp; Subscription</span>
                  <ExternalLink className="h-3.5 w-3.5 text-txt-sub" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
