'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  Tag,
  Clock,
  Edit2,
  Save,
  X,
  Loader2,
  Copy,
  Check,
  Globe,
  FileText,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { getOrganizations } from '@/services/organizationService';
import { getBusinesses, updateBusiness } from '@/services/businessService';
import { Business, BusinessType, UpdateBusinessDto, BusinessAddress } from '@/types/business';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'ACCOUNTS', label: 'Accounting / CA Firm' },
  { value: 'SERVICE', label: 'Professional Services' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'OTHER', label: 'Other' },
];

export default function BusinessProfilePage() {
  const toast = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [orgId, setOrgId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('ACCOUNTS');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [notes, setNotes] = useState('');

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const orgs = await getOrganizations();
      if (!orgs || orgs.length === 0) {
        setError('No organization found.');
        return;
      }

      const organizationId = orgs[0].id;
      setOrgId(organizationId);

      const businesses = await getBusinesses(organizationId);
      if (!businesses || businesses.length === 0) {
        setError('No business found.');
        return;
      }

      const biz = businesses[0];
      setBusiness(biz);

      // Pre-fill form state
      setName(biz.name || '');
      setPhone(biz.phone || '');
      setBusinessType((biz.businessType as BusinessType) || 'ACCOUNTS');
      setOwnerName(biz.ownerName || biz.settings?.uiConfig?.ownerName || '');
      setEmail(biz.email || biz.settings?.uiConfig?.email || '');
      setLine1(biz.address?.line1 || '');
      setArea(biz.address?.area || '');
      setCity(biz.address?.city || '');
      setState(biz.address?.state || '');
      setPincode(biz.address?.pincode || '');
      setCountry(biz.address?.country || 'India');
      setNotes(biz.notes || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load business profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const handleCopyBizId = () => {
    if (!business?.id) return;
    navigator.clipboard.writeText(business.id);
    setCopiedId(true);
    toast.success('Business ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (business) {
      setName(business.name || '');
      setPhone(business.phone || '');
      setBusinessType((business.businessType as BusinessType) || 'ACCOUNTS');
      setOwnerName(business.ownerName || business.settings?.uiConfig?.ownerName || '');
      setEmail(business.email || business.settings?.uiConfig?.email || '');
      setLine1(business.address?.line1 || '');
      setArea(business.address?.area || '');
      setCity(business.address?.city || '');
      setState(business.address?.state || '');
      setPincode(business.address?.pincode || '');
      setCountry(business.address?.country || 'India');
      setNotes(business.notes || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !orgId) return;

    if (!name.trim()) {
      toast.error('Business name is required');
      return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone.trim())) {
      toast.error('Phone number must be a valid 10-digit number');
      return;
    }

    try {
      setSaving(true);

      const addressPayload: BusinessAddress = {
        type: 'COMMUNICATION',
        line1: line1.trim() || undefined,
        area: area.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
        country: country.trim() || undefined,
      };

      const dto: UpdateBusinessDto = {
        name: name.trim(),
        phone: phone.trim(),
        businessType,
        address: addressPayload,
        notes: notes.trim() || undefined,
        uiConfig: {
          ownerName: ownerName.trim() || undefined,
          email: email.trim() || undefined,
        },
      };

      const updated = await updateBusiness(orgId, business.id, dto);
      setBusiness(updated);
      setIsEditing(false);
      toast.success('Business profile updated successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update business profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-bg text-txt-sub">
        <Loader2 className="h-9 w-9 animate-spin text-[var(--accent)] mb-3" />
        <span className="text-sm font-medium">Loading business profile...</span>
      </div>
    );
  }

  const initial = (business?.name?.[0] || 'B').toUpperCase();
  const addressFormatted = [line1, area, city, state, pincode, country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        {/* Error Alert */}
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

        {/* ── Executive Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--primary)] via-[#1a2d52] to-[#0f172a] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar / Brand Icon */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[#fbbf24] text-navy font-black text-2xl shadow-lg border-2 border-white/20">
                {initial}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white" title="Active Business" />
              </div>

              {/* Title & tags */}
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    {business?.name || 'Business Firm'}
                  </h1>
                  <span className="badge badge-sm bg-white/15 text-white border-white/20 font-bold uppercase tracking-wider text-[10px]">
                    {business?.businessType || 'Accounts'}
                  </span>
                  <span className="badge badge-sm bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-semibold">
                    {business?.isActive ? 'Active Firm' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-white/70 font-mono flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[var(--accent)]" />
                  {business?.phone || 'No phone registered'}
                </p>
                <p className="text-[11px] text-white/50 flex items-center gap-1.5 pt-0.5">
                  <Clock className="h-3.5 w-3.5 text-white/40" />
                  Timezone: {business?.settings?.timezone || 'Asia/Kolkata'} · Locale: {business?.settings?.locale || 'en-IN'}
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
                  Edit Firm Details
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
          {/* ── Left 2 Columns: Firm Details & Address ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card: Firm Overview */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-txt-main">Firm Overview &amp; Identity</h2>
                    <p className="text-xs text-txt-sub">Core registered details and category</p>
                  </div>
                </div>
                {isEditing && (
                  <span className="badge badge-sm badge-warning font-semibold">Editing Mode</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      Firm / Business Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter business name"
                        className="input input-bordered input-sm w-full font-medium"
                        required
                      />
                    ) : (
                      <p className="text-sm font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                        {business?.name || '—'}
                      </p>
                    )}
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      Business Category
                    </label>
                    {isEditing ? (
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                        className="select select-bordered select-sm w-full font-medium"
                      >
                        {BUSINESS_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                        {BUSINESS_TYPE_OPTIONS.find((o) => o.value === business?.businessType)?.label || business?.businessType || '—'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Owner Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      Firm Owner / Managing Partner
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. CA Ramesh Sharma"
                        className="input input-bordered input-sm w-full font-medium"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-txt-sub" />
                        {ownerName || '—'}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                      Official Contact Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="input input-bordered input-sm w-full font-mono font-medium"
                        maxLength={10}
                      />
                    ) : (
                      <p className="text-sm font-mono font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-txt-sub" />
                        {business?.phone || '—'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                    Official Support / Notification Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. office@remindca.com"
                      className="input input-bordered input-sm w-full font-mono font-medium"
                    />
                  ) : (
                    <p className="text-sm font-mono font-semibold text-txt-main py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-txt-sub" />
                      {email || '—'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card: Registered Address */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-txt-main">Operating Office &amp; Address</h2>
                    <p className="text-xs text-txt-sub">Communication and registered office coordinates</p>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="Suite, Street, Building"
                      className="input input-bordered input-sm w-full font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                        Area / Locality
                      </label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="Area name"
                        className="input input-bordered input-sm w-full font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="input input-bordered input-sm w-full font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="input input-bordered input-sm w-full font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Pincode"
                        className="input input-bordered input-sm w-full font-mono font-medium"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="input input-bordered input-sm w-full font-medium"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] text-sm text-txt-main">
                  {addressFormatted ? (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-medium">{addressFormatted}</p>
                    </div>
                  ) : (
                    <p className="text-txt-sub italic text-xs">No address configured. Click Edit Firm Details to set your location.</p>
                  )}
                </div>
              )}
            </div>

            {/* Card: Notes & Internal Info */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                <FileText className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                  Firm Bio &amp; Internal Notes
                </h3>
              </div>

              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any internal remarks or firm description..."
                  className="textarea textarea-bordered w-full rounded-2xl font-medium text-sm min-h-24"
                />
              ) : (
                <p className="text-xs text-txt-main whitespace-pre-wrap leading-relaxed">
                  {notes || <span className="text-txt-sub italic">No notes added.</span>}
                </p>
              )}
            </div>
          </div>

          {/* ── Right 1 Column: Credentials & Workspace Meta ── */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                  Workspace Identifiers
                </h3>
              </div>

              <div className="space-y-3">
                {/* Business ID */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-txt-sub mb-1">
                    Business Entity ID
                  </p>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] font-mono text-xs text-txt-main">
                    <span className="truncate pr-2">{business?.id || '—'}</span>
                    <button
                      type="button"
                      onClick={handleCopyBizId}
                      className="btn btn-ghost btn-xs btn-square shrink-0 text-txt-sub hover:text-txt-main"
                      title="Copy Business ID"
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Organization ID */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-txt-sub mb-1">
                    Organization ID
                  </p>
                  <p className="p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] font-mono text-xs text-txt-main truncate">
                    {orgId || business?.organizationId || '—'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border)]/60 text-xs text-txt-sub space-y-1.5">
                  <div className="flex justify-between">
                    <span>Created Date</span>
                    <span className="font-mono text-txt-main">
                      {business?.createdAt ? new Date(business.createdAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span className="font-mono text-txt-main">
                      {business?.updatedAt ? new Date(business.updatedAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-sub mb-1">
                Related Workspace Settings
              </h3>
              <div className="space-y-1">
                <Link
                  href="/user-profile"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-subtle)] text-xs font-bold text-txt-main transition-colors"
                >
                  <span>User Profile &amp; Account</span>
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