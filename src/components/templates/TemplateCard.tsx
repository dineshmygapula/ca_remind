'use client';

import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, Mail, MessageSquare } from 'lucide-react';
import { MessageTemplate } from '@/types/messageTemplate.types';

interface TemplateCardProps {
  template: MessageTemplate;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string, name: string) => void;
}

export default function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex-1 p-5 pb-3 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-txt-main">{template.name}</h4>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {template.reminder_type}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                  template.isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-txt-sub">
            {template.channels.includes('email') && (
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            {template.channels.includes('whatsapp') && (
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
            )}
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-3 space-y-3">
          {/* Email Preview */}
          {template.templates.email && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-txt-main">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email Template</span>
              </div>
              <div className="bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--border)] text-xs space-y-1">
                <p className="font-semibold text-txt-sub">
                  Subject: <span className="text-txt-main font-normal">{template.templates.email.subject}</span>
                </p>
                <p className="text-txt-sub whitespace-pre-line leading-relaxed font-mono">
                  {expanded
                    ? template.templates.email.body
                    : truncateText(template.templates.email.body, 100)}
                </p>
              </div>
            </div>
          )}

          {/* WhatsApp Preview */}
          {template.templates.whatsapp && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-txt-main">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Template</span>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                <p className="text-txt-sub whitespace-pre-line leading-relaxed font-mono">
                  {expanded
                    ? template.templates.whatsapp.body
                    : truncateText(template.templates.whatsapp.body, 100)}
                </p>
              </div>
            </div>
          )}

          {/* Placeholders */}
          {template.placeholders.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-txt-sub">
                Placeholders ({template.placeholders.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {template.placeholders.slice(0, expanded ? undefined : 3).map((placeholder) => (
                  <span
                    key={placeholder}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--bg)] border border-[var(--border)] text-txt-main"
                  >
                    [{placeholder}]
                  </span>
                ))}
                {!expanded && template.placeholders.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-txt-sub">
                    +{template.placeholders.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-[var(--border)] flex items-center justify-between px-4 py-2.5 bg-[var(--bg)]/50 rounded-b-2xl">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-txt-sub hover:text-txt-main transition-colors cursor-pointer"
        >
          <span>{expanded ? 'Show Less' : 'Read More'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(template.id)}
            title="Edit Template"
            className="p-1.5 rounded-lg text-txt-sub hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(template.id, template.name)}
            title="Delete Template"
            className="p-1.5 rounded-lg text-txt-sub hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}