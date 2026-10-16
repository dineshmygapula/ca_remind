'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Pencil,
  Plus,
  AlertCircle,
  X,
  Loader2,
  Check,
  Mail,
  MessageSquare,
  Phone,
  Bell,
  Copy,
  Info,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import {
  getMessageTemplateById,
  createMessageTemplate,
  updateMessageTemplate,
} from '@/services/messageTemplateService';
import {
  CreateMessageTemplateDto,
  UpdateMessageTemplateDto,
  Templates,
  ChannelType,
} from '@/types/messageTemplate.types';
import {
  CHANNEL_OPTIONS,
  REMINDER_TYPE_OPTIONS,
  BUSINESS_CATEGORY_OPTIONS,
  COMMON_PLACEHOLDERS,
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_WHATSAPP_TEMPLATE,
  DEFAULT_SMS_TEMPLATE,
  DEFAULT_INAPP_TEMPLATE,
} from '@/constants/messageTemplateConstants';

export interface TemplateFormDrawerProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  templateId?: string | null;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  channels: ChannelType[];
  reminderType: string;
  businessCategory: string;
  isActive: boolean;

  // Email
  emailSubject: string;
  emailBody: string;

  // WhatsApp
  whatsappBody: string;

  // SMS
  smsBody: string;

  // In-App
  inAppBody: string;

  selectedPlaceholders: string[];
}

const DEFAULT_FORM: FormData = {
  name: '',
  channels: ['email', 'whatsapp'],
  reminderType: 'GST',
  businessCategory: 'COMPLIANCE',
  isActive: true,
  emailSubject: DEFAULT_EMAIL_TEMPLATE.subject,
  emailBody: DEFAULT_EMAIL_TEMPLATE.body,
  whatsappBody: DEFAULT_WHATSAPP_TEMPLATE.body,
  smsBody: DEFAULT_SMS_TEMPLATE.body,
  inAppBody: DEFAULT_INAPP_TEMPLATE.body,
  selectedPlaceholders: ['CLIENTNAME', 'BUSINESSNAME', 'DUEDATE', 'SERVICETYPE'],
};

export default function TemplateFormDrawer({
  open,
  onClose,
  businessId,
  templateId,
  onSuccess,
}: TemplateFormDrawerProps) {
  const mode = templateId ? 'edit' : 'create';

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [activeChannelTab, setActiveChannelTab] = useState<ChannelType>('email');
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

  // Track active input focus for inserting placeholders
  const activeInputRef = useRef<'emailSubject' | 'emailBody' | 'whatsappBody' | 'smsBody' | 'inAppBody'>('emailBody');

  const setField = <K extends keyof FormData>(field: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && templateId && businessId) {
      loadTemplate(templateId);
    } else {
      setForm(DEFAULT_FORM);
      setActiveChannelTab('email');
      setError('');
    }
  }, [open, templateId, businessId, mode]);

  const loadTemplate = async (id: string) => {
    try {
      setFetching(true);
      setError('');
      const data = await getMessageTemplateById(businessId, id);

      const ch = (data.channels || []) as ChannelType[];
      const firstCh = ch[0] || 'email';

      setForm({
        name: data.name || '',
        channels: ch,
        reminderType: data.reminder_type || 'GENERAL',
        businessCategory: data.businessCategory || 'GENERAL',
        isActive: data.isActive ?? true,
        emailSubject: data.templates?.email?.subject || DEFAULT_EMAIL_TEMPLATE.subject,
        emailBody: data.templates?.email?.body || DEFAULT_EMAIL_TEMPLATE.body,
        whatsappBody: data.templates?.whatsapp?.body || DEFAULT_WHATSAPP_TEMPLATE.body,
        smsBody: data.templates?.sms?.body || DEFAULT_SMS_TEMPLATE.body,
        inAppBody: data.templates?.in_app?.body || DEFAULT_INAPP_TEMPLATE.body,
        selectedPlaceholders: data.placeholders || [],
      });
      setActiveChannelTab(firstCh);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load template details');
    } finally {
      setFetching(false);
    }
  };

  const toggleChannel = (channel: ChannelType) => {
    const exists = form.channels.includes(channel);
    let newChannels: ChannelType[];
    if (exists) {
      if (form.channels.length === 1) {
        setError('At least one delivery channel must remain selected');
        return;
      }
      newChannels = form.channels.filter((c) => c !== channel);
      if (activeChannelTab === channel) {
        setActiveChannelTab(newChannels[0] || 'email');
      }
    } else {
      newChannels = [...form.channels, channel];
      setActiveChannelTab(channel);
    }
    setError('');
    setField('channels', newChannels);
  };

  const insertPlaceholder = (phValue: string) => {
    const token = `[${phValue}]`;
    const targetKey = activeInputRef.current;
    const currentVal = form[targetKey] || '';
    setField(targetKey, currentVal + (currentVal ? ' ' : '') + token);

    // Also add to selectedPlaceholders if not present
    if (!form.selectedPlaceholders.includes(phValue)) {
      setField('selectedPlaceholders', [...form.selectedPlaceholders, phValue]);
    }

    setCopiedPlaceholder(phValue);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Template name is required');
      return;
    }
    if (form.channels.length === 0) {
      setError('Select at least one delivery channel');
      return;
    }
    if (form.channels.includes('email') && !form.emailSubject.trim()) {
      setError('Email subject is required for email delivery');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const templates: Templates = {};
      if (form.channels.includes('email')) {
        templates.email = {
          subject: form.emailSubject,
          body: form.emailBody,
        };
      }
      if (form.channels.includes('whatsapp')) {
        templates.whatsapp = {
          body: form.whatsappBody,
        };
      }
      if (form.channels.includes('sms')) {
        templates.sms = {
          body: form.smsBody,
        };
      }
      if (form.channels.includes('in_app')) {
        templates.in_app = {
          body: form.inAppBody,
        };
      }

      if (mode === 'create') {
        const dto: CreateMessageTemplateDto = {
          name: form.name.trim(),
          templates,
          placeholders: form.selectedPlaceholders,
          channels: form.channels,
          reminder_type: form.reminderType as CreateMessageTemplateDto['reminder_type'],
          businessCategory: form.businessCategory as CreateMessageTemplateDto['businessCategory'],
          isActive: form.isActive,
        };
        await createMessageTemplate(businessId, dto);
      } else if (templateId) {
        const dto: UpdateMessageTemplateDto = {
          name: form.name.trim(),
          templates,
          placeholders: form.selectedPlaceholders,
          channels: form.channels,
          reminder_type: form.reminderType as UpdateMessageTemplateDto['reminder_type'],
          businessCategory: form.businessCategory,
          isActive: form.isActive,
        };
        await updateMessageTemplate(businessId, templateId, dto);
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title=""
      width="lg"
      customHeader={
        <div className="flex items-center justify-between w-full px-6 py-5 bg-[#0B1528] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F59E0B] text-slate-900 shrink-0 shadow-xs">
              {mode === 'edit' ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                {mode === 'edit' ? 'Update Template' : 'New Template'}
              </p>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                {mode === 'edit' ? form.name || 'Edit template' : 'Create notification template'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-divider py-2.5 px-6 text-sm font-semibold text-txt-main bg-surface transition-colors hover:bg-bg cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
            ) : (
              <Check className="h-4 w-4 text-slate-900" />
            )}
            <span>{mode === 'edit' ? 'Save changes' : 'Create template'}</span>
          </button>
        </div>
      }
    >
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
          <p className="text-sm font-semibold text-txt-main">Loading template details...</p>
          <p className="text-xs text-txt-sub">Please wait while we retrieve the content.</p>
        </div>
      ) : (
        <div className="space-y-5 py-2">
          {error && (
            <div role="alert" className="alert alert-error rounded-xl py-3 px-4 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1 font-medium">{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Section 1: Basic Information ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-txt-main">Template Information</h3>
            </div>

            {/* Template Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-txt-main">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. GST Filing Due Reminder"
                className="w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">Reminder Type</label>
                <select
                  value={form.reminderType}
                  onChange={(e) => setField('reminderType', e.target.value)}
                  className="w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                >
                  {REMINDER_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-surface text-txt-main">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">Business Category</label>
                <select
                  value={form.businessCategory}
                  onChange={(e) => setField('businessCategory', e.target.value)}
                  className="w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                >
                  {BUSINESS_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-surface text-txt-main">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-divider">
              <div>
                <p className="text-xs font-bold text-txt-main">Active Status</p>
                <p className="text-[11px] text-txt-sub">Enable or disable this template across reminders</p>
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setField('isActive', !form.isActive)}
              >
                <div
                  className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                    form.isActive ? 'bg-[#14224D]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                      form.isActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
                <span className={`text-xs font-semibold ${form.isActive ? 'text-[#059669]' : 'text-txt-sub'}`}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Delivery Channels ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-bold text-txt-main">Delivery Channels</h3>
            </div>
            <p className="text-xs text-txt-sub">
              Select which communication channels this message template supports:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHANNEL_OPTIONS.map((ch) => {
                const isSelected = form.channels.includes(ch.value as ChannelType);
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => toggleChannel(ch.value as ChannelType)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#F59E0B] bg-amber-50/50 dark:bg-amber-950/20 text-txt-main shadow-xs font-semibold ring-1 ring-[#F59E0B]'
                        : 'border-divider bg-bg/50 text-txt-sub hover:bg-bg hover:text-txt-main'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ch.icon}</span>
                      <span className="text-xs font-bold">{ch.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section 3: Placeholders & Message Content ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-bold text-txt-main">Placeholders &amp; Content</h3>
            </div>

            {/* Placeholders Toolbar */}
            <div className="p-3 rounded-xl bg-bg border border-divider space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-txt-main flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Click to insert placeholder:
                </span>
                {copiedPlaceholder && (
                  <span className="text-[11px] font-bold text-[#059669] animate-pulse">
                    Inserted [{copiedPlaceholder}]!
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {COMMON_PLACEHOLDERS.map((ph) => (
                  <button
                    key={ph.value}
                    type="button"
                    onClick={() => insertPlaceholder(ph.value)}
                    title={ph.description}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium bg-surface hover:bg-amber-50 dark:hover:bg-amber-950/30 text-txt-main hover:text-amber-700 border border-divider hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
                  >
                    +[{ph.value}]
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Tabs */}
            <div className="flex items-center gap-1 border-b border-divider pb-2 overflow-x-auto">
              {form.channels.map((ch) => {
                const isActive = activeChannelTab === ch;
                const opt = CHANNEL_OPTIONS.find((c) => c.value === ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setActiveChannelTab(ch)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-navy text-white shadow-xs'
                        : 'text-txt-sub hover:text-txt-main hover:bg-bg'
                    }`}
                  >
                    <span>{opt?.icon}</span>
                    <span>{opt?.label || ch}</span>
                  </button>
                );
              })}
            </div>

            {/* Channel Editor */}
            {activeChannelTab === 'email' && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-txt-main">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.emailSubject}
                    onFocus={() => {
                      activeInputRef.current = 'emailSubject';
                    }}
                    onChange={(e) => setField('emailSubject', e.target.value)}
                    placeholder="e.g. Reminder: [SERVICETYPE] Filing Due on [DUEDATE]"
                    className="w-full h-10 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none transition-all font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-txt-main">Email Message Body</label>
                  <textarea
                    rows={6}
                    value={form.emailBody}
                    onFocus={() => {
                      activeInputRef.current = 'emailBody';
                    }}
                    onChange={(e) => setField('emailBody', e.target.value)}
                    placeholder="Enter email content..."
                    className="w-full rounded-xl border border-divider bg-bg/50 p-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeChannelTab === 'whatsapp' && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-txt-main">WhatsApp Message</label>
                    <span className="text-[11px] text-txt-sub">Supports *bold*, _italics_</span>
                  </div>
                  <textarea
                    rows={7}
                    value={form.whatsappBody}
                    onFocus={() => {
                      activeInputRef.current = 'whatsappBody';
                    }}
                    onChange={(e) => setField('whatsappBody', e.target.value)}
                    placeholder="Enter WhatsApp template text..."
                    className="w-full rounded-xl border border-divider bg-bg/50 p-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeChannelTab === 'sms' && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-txt-main">SMS Message</label>
                    <span className="text-[11px] text-txt-sub font-mono">
                      {form.smsBody.length} characters (approx {Math.ceil(form.smsBody.length / 160) || 1} SMS)
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={form.smsBody}
                    onFocus={() => {
                      activeInputRef.current = 'smsBody';
                    }}
                    onChange={(e) => setField('smsBody', e.target.value)}
                    placeholder="Enter SMS content..."
                    className="w-full rounded-xl border border-divider bg-bg/50 p-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeChannelTab === 'in_app' && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-txt-main">In-App Notification Text</label>
                  <textarea
                    rows={4}
                    value={form.inAppBody}
                    onFocus={() => {
                      activeInputRef.current = 'inAppBody';
                    }}
                    onChange={(e) => setField('inAppBody', e.target.value)}
                    placeholder="Enter in-app alert text..."
                    className="w-full rounded-xl border border-divider bg-bg/50 p-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
