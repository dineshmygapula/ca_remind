'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Loader2,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import { V2ReminderDefinition } from '@/types/v2ReminderDefinition.types';
import {
  getV2ReminderDefinitions,
  deleteV2ReminderDefinition,
} from '@/services/reminderDefinitionService';

interface Props {
  open: boolean;
  onClose: () => void;
  taskDefinitionId: string | null;
  taskDefinitionName: string;
  businessId: string;
  preloadedRules?: V2ReminderDefinition[];
  onEditRule: (ruleId: string) => void;
}

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === 'EMAIL') return <Mail className="w-4 h-4 text-blue-500" />;
  if (channel === 'WHATSAPP') return <MessageSquare className="w-4 h-4 text-emerald-500" />;
  return <Bell className="w-4 h-4 text-amber-500" />;
}

function formatOffsetLabel(offsetDays: number) {
  const abs = Math.abs(offsetDays);
  if (offsetDays > 0) return `Sent ${abs} day${abs !== 1 ? 's' : ''} before due date`;
  if (offsetDays === 0) return 'Sent on due date';
  return `Sent ${abs} day${abs !== 1 ? 's' : ''} after due date`;
}

export default function ReminderRulesListDrawer({
  open,
  onClose,
  taskDefinitionId,
  taskDefinitionName,
  businessId,
  preloadedRules,
  onEditRule,
}: Props) {
  const [rules, setRules] = useState<V2ReminderDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    if (!businessId || !taskDefinitionId) return;
    try {
      setLoading(true);
      setError('');
      const all = await getV2ReminderDefinitions(businessId);
      const mine = all.filter((r) => r.taskDefinitionId === taskDefinitionId);
      setRules(mine);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, [businessId, taskDefinitionId]);

  useEffect(() => {
    if (open) {
      if (preloadedRules && preloadedRules.length > 0) {
        setRules(preloadedRules);
      } else {
        fetchRules();
      }
    } else {
      setRules([]);
      setError('');
    }
  }, [open, preloadedRules, fetchRules]);

  const handleDelete = async (ruleId: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(ruleId);
      await deleteV2ReminderDefinition(businessId, ruleId);
      await fetchRules();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Reminder Rules"
      eyebrow={taskDefinitionName}
      width="md"
    >
      <div className="py-2 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text-secondary)]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mb-2" />
            <p className="text-xs font-semibold">Loading reminder rules...</p>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="p-1 hover:bg-rose-100 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!loading && rules.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-subtle)] text-[var(--text-secondary)] mx-auto flex items-center justify-center mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">No reminder rules configured</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">This task rule currently has no automated reminder alerts.</p>
          </div>
        )}

        {!loading && rules.length > 0 && (
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--primary)]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                      Rule {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(rule.id, rule.name)}
                      disabled={deletingId === rule.id}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete rule"
                    >
                      {deletingId === rule.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <ChannelIcon channel={rule.channel} />
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{rule.name}</h4>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-3">
                    {formatOffsetLabel(rule.offsetDays)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Channel: {rule.channel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditRule(rule.id)}
                    className="font-bold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
