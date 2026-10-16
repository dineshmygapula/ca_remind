'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Pencil,
  X,
  Mail,
  MessageSquare,
  Phone,
  Bell,
  CheckCircle,
  Clock,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import { getMessageTemplateById } from '@/services/messageTemplateService';
import { MessageTemplate, ChannelType } from '@/types/messageTemplate.types';

export interface TemplateDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  templateId: string | null;
  businessId: string;
  onEdit: (templateId: string) => void;
}

function getTypeBadgeClass(type?: string) {
  const t = (type || '').toUpperCase();
  if (t === 'GST') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  if (t === 'TDS') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  if (t === 'ITR') return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  if (t === 'ROC') return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  if (t === 'MSME') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

export default function TemplateDetailsDrawer({
  open,
  onClose,
  templateId,
  businessId,
  onEdit,
}: TemplateDetailsDrawerProps) {
  const [template, setTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeChannel, setActiveChannel] = useState<ChannelType>('email');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && templateId && businessId) {
      loadTemplate(templateId);
    }
  }, [open, templateId, businessId]);

  const loadTemplate = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await getMessageTemplateById(businessId, id);
      setTemplate(data);
      if (data.channels && data.channels.length > 0) {
        setActiveChannel(data.channels[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Template Details
                </span>
                {template && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      template.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        template.isActive ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}
                    />
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                {template?.name || 'Message Template'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-divider py-2.5 px-5 text-sm font-semibold text-txt-main bg-surface transition-colors hover:bg-bg cursor-pointer"
          >
            Close
          </button>

          {template && (
            <button
              type="button"
              onClick={() => onEdit(template.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="h-4 w-4 text-slate-900" />
              <span>Edit template</span>
            </button>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
          <p className="text-sm font-semibold text-txt-main">Loading template details...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      ) : !template ? null : (
        <div className="space-y-5 py-2">
          {/* ── Card 1: Template Overview ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-txt-main">Template Overview</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-bg border border-divider/60">
                <span className="text-[11px] font-semibold text-txt-sub uppercase">Reminder Type</span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeBadgeClass(
                      template.reminder_type
                    )}`}
                  >
                    {template.reminder_type || '—'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-bg border border-divider/60">
                <span className="text-[11px] font-semibold text-txt-sub uppercase">Business Category</span>
                <p className="mt-1 text-sm font-semibold text-txt-main capitalize">
                  {template.businessCategory ? template.businessCategory.toLowerCase() : 'General'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-bg border border-divider/60 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-txt-sub uppercase">Channels</span>
                <p className="mt-1 text-xs font-semibold text-txt-main">
                  {template.channels?.map((c) => c.toUpperCase()).join(', ') || 'None'}
                </p>
              </div>
            </div>

            {template.key && (
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-bg border border-divider font-mono text-txt-sub">
                <span>Unique Key:</span>
                <span className="font-bold text-txt-main">{template.key}</span>
              </div>
            )}
          </div>

          {/* ── Card 2: Message Content by Channel ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-txt-main">Channel Message Content</h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  const content =
                    activeChannel === 'email'
                      ? `${template.templates?.email?.subject || ''}\n\n${template.templates?.email?.body || ''}`
                      : activeChannel === 'whatsapp'
                      ? template.templates?.whatsapp?.body || ''
                      : activeChannel === 'sms'
                      ? template.templates?.sms?.body || ''
                      : template.templates?.in_app?.body || '';
                  copyMessage(content);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-divider bg-bg text-xs font-semibold text-txt-main hover:bg-surface transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy message'}</span>
              </button>
            </div>

            {/* Channels tab selector */}
            <div className="flex items-center gap-1.5 border-b border-divider pb-2.5 overflow-x-auto">
              {(template.channels || []).map((ch) => {
                const isSelected = activeChannel === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setActiveChannel(ch)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-navy text-white shadow-xs'
                        : 'text-txt-sub hover:text-txt-main hover:bg-bg'
                    }`}
                  >
                    {ch === 'email' && <Mail className="w-3.5 h-3.5" />}
                    {ch === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                    {ch === 'sms' && <Phone className="w-3.5 h-3.5 text-amber-400" />}
                    {ch === 'in_app' && <Bell className="w-3.5 h-3.5 text-blue-400" />}
                    <span className="capitalize">{ch.replace('_', ' ')}</span>
                  </button>
                );
              })}
            </div>

            {/* Email view */}
            {activeChannel === 'email' && (
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[11px] font-bold text-txt-sub uppercase">Subject</span>
                  <div className="mt-1 p-3 rounded-xl bg-bg border border-divider text-sm font-semibold text-txt-main font-mono">
                    {template.templates?.email?.subject || '—'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-txt-sub uppercase">Body</span>
                  <div className="mt-1 p-4 rounded-xl bg-bg border border-divider text-xs text-txt-main font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {template.templates?.email?.body || 'No email body configured'}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp view */}
            {activeChannel === 'whatsapp' && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-txt-sub uppercase">WhatsApp Message</span>
                <div className="mt-1 p-4 rounded-xl bg-[#0b141a]/5 dark:bg-[#0b141a]/40 border border-emerald-500/20 text-xs text-txt-main font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {template.templates?.whatsapp?.body || 'No WhatsApp template configured'}
                </div>
              </div>
            )}

            {/* SMS view */}
            {activeChannel === 'sms' && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-txt-sub uppercase">SMS Content</span>
                <div className="mt-1 p-4 rounded-xl bg-bg border border-divider text-xs text-txt-main font-mono whitespace-pre-wrap leading-relaxed">
                  {template.templates?.sms?.body || 'No SMS body configured'}
                </div>
              </div>
            )}

            {/* In-App view */}
            {activeChannel === 'in_app' && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-txt-sub uppercase">In-App Notification</span>
                <div className="mt-1 p-4 rounded-xl bg-bg border border-divider text-xs text-txt-main font-mono whitespace-pre-wrap leading-relaxed">
                  {template.templates?.in_app?.body || 'No In-App notification configured'}
                </div>
              </div>
            )}
          </div>

          {/* ── Card 3: Placeholders Configured ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-bold text-txt-main">Placeholders Used</h3>
            </div>

            {template.placeholders && template.placeholders.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {template.placeholders.map((ph) => (
                  <span
                    key={ph}
                    className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-bg border border-divider text-txt-main"
                  >
                    [{ph}]
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-txt-sub">No placeholders attached to this template.</p>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}