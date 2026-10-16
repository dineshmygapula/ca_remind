'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertCircle, Clock, CalendarClock, CheckCircle2, Loader2, X,
  ClipboardList, Bell, ChevronRight, Plus, Calendar,
} from 'lucide-react';

import { useWorkspace } from '@/context/WorkspaceContext';
import { getTasks } from '@/services/taskService';
import { getReminders } from '@/services/reminderService';
import { TaskListItem } from '@/types/task.types';
import { Reminder } from '@/types/reminders.types';
import { calculateTaskSummary } from '@/utils/taskSummary';

// ─── Types & date helpers ──────────────────────────────────
type TaskTab = 'All' | 'Over Due' | 'Today' | 'Upcoming' | 'Completed';
const TABS: TaskTab[] = ['All', 'Over Due', 'Today', 'Upcoming', 'Completed'];

type Bucket = 'overdue' | 'today' | 'upcoming';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Classify a due date once instead of calling three helpers per task
function getBucket(dueDate: string, todayStart: number): Bucket {
  const due = startOfDay(new Date(dueDate));
  if (due < todayStart) return 'overdue';
  if (due === todayStart) return 'today';
  return 'upcoming';
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const formatShort = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ─── Summary card ──────────────────────────────────────────
interface SummaryCardProps {
  icon: React.ReactNode;
  ghostIcon: React.ReactNode;
  count: number;
  label: string;
  emptyText: string;
  accentColor: string;
  href: string;
}

function SummaryCard({ icon, ghostIcon, count, label, emptyText, accentColor, href }: SummaryCardProps) {
  return (
    <Link
      href={href}
      className="relative block bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="absolute right-3 bottom-3 opacity-10 text-[var(--border)]">{ghostIcon}</div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl" style={{ backgroundColor: accentColor }} />

      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}18` }}>
          {icon}
        </div>
      </div>

      <span className="block text-3xl font-extrabold text-[var(--heading)] mb-0.5">{count}</span>
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">{label}</p>
      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
        {count === 0 ? emptyText : `${count} task${count !== 1 ? 's' : ''}`}
      </p>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────
export default function DashboardPage() {
  // The private layout guarantees status === 'ready', so businessId is set here
  const { businessId } = useWorkspace();

  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TaskTab>('All');

  // ─── Fetch ───────────────────────────────────────────────
  useEffect(() => {
    if (!businessId) return;
    let cancelled = false; // ignore stale responses if businessId changes

    (async () => {
      setLoading(true);
      setError('');
      try {
        const [taskArray, remindersResp] = await Promise.all([
          getTasks(businessId),
          // Reminders are secondary: the dashboard should still work if they fail
          getReminders(businessId).catch(() => ({ items: [], next_cursor: null })),
        ]);
        if (cancelled) return;
        setTasks(taskArray);
        setReminders((remindersResp.items as Reminder[]).slice(0, 5));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  // ─── Derived data (no extra state) ───────────────────────
  const today = useMemo(() => new Date(), []);
  const summary = useMemo(() => calculateTaskSummary(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    const todayStart = startOfDay(new Date());
    return tasks.filter((t) => {
      switch (activeTab) {
        case 'All': return true;
        case 'Completed': return t.status === 'COMPLETED';
        case 'Over Due': return getBucket(t.dueDate, todayStart) === 'overdue';
        case 'Today': return getBucket(t.dueDate, todayStart) === 'today';
        case 'Upcoming': return getBucket(t.dueDate, todayStart) === 'upcoming';
      }
    });
  }, [tasks, activeTab]);

  const visibleTasks = filteredTasks.slice(0, 5);

  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const dotColor = (t: TaskListItem) => {
    if (t.status === 'COMPLETED') return 'bg-emerald-500';
    const bucket = getBucket(t.dueDate, startOfDay(new Date()));
    if (bucket === 'overdue') return 'bg-rose-500';
    if (bucket === 'today') return 'bg-[var(--accent)]';
    return 'bg-indigo-400';
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--heading)] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5 font-medium">
              Get a quick overview of your tasks and compliance activities
            </p>
          </div>
          <div className="inline-flex items-center gap-2 border border-[var(--border)] rounded-xl px-3.5 py-2 bg-[var(--surface)] text-sm font-semibold text-[var(--text-primary)] shadow-sm self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
            {formatDate(today)}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="rounded-xl flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
            <button type="button" aria-label="Dismiss error" onClick={() => setError('')} className="rounded-full p-1 hover:bg-rose-500/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
            ghostIcon={<CalendarClock className="w-20 h-20" />}
            count={summary.overdue}
            label="Over Due"
            emptyText="No overdue tasks"
            accentColor="#f43f5e"
            href="/tasks?filter=overdue"
          />
          <SummaryCard
            icon={<Clock className="w-5 h-5 text-[var(--accent)]" />}
            ghostIcon={<Clock className="w-20 h-20" />}
            count={summary.today}
            label="Today"
            emptyText="No tasks due today"
            accentColor="#C9A227"
            href="/tasks?filter=today"
          />
          <SummaryCard
            icon={<CalendarClock className="w-5 h-5 text-[var(--primary)]" />}
            ghostIcon={<CalendarClock className="w-20 h-20" />}
            count={summary.upcoming}
            label="Upcoming"
            emptyText="No upcoming tasks"
            accentColor="#6366f1"
            href="/tasks?filter=upcoming"
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            ghostIcon={<CheckCircle2 className="w-20 h-20" />}
            count={summary.completed}
            label="Completed"
            emptyText="No tasks completed"
            accentColor="#10b981"
            href="/tasks?filter=completed"
          />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Tasks at a glance */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--heading)]">Tasks at a Glance</h2>
            </div>

            <div className="flex flex-wrap gap-2" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[var(--primary)] text-white shadow-md'
                      : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--primary)]/40'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8 gap-3">
                <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <ClipboardList className="w-8 h-8 text-[var(--primary)]/40" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">No tasks found</p>
                <p className="text-xs text-[var(--text-secondary)] text-center max-w-[200px]">
                  You're all caught up! No tasks to show at the moment.
                </p>
                <Link
                  href="/tasks"
                  className="mt-1 btn btn-sm bg-[var(--primary)] text-white border-none rounded-xl px-4 flex items-center gap-1.5 hover:opacity-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Task
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {visibleTasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href="/tasks"
                      className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--bg)] -mx-5 px-5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor(task)}`} />
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{task.title}</span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)] shrink-0">
                        {formatShort(task.dueDate)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming reminders */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-indigo-500" />
                </div>
                <h2 className="text-base font-bold text-[var(--heading)]">Upcoming Reminders</h2>
              </div>
              <Link href="/reminders" className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8 gap-3">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">No upcoming reminders</p>
                <p className="text-xs text-[var(--text-secondary)] text-center max-w-[200px]">
                  You don't have any upcoming reminders.
                </p>
                <Link
                  href="/reminders"
                  className="mt-1 btn btn-sm btn-outline border-[var(--border)] text-[var(--primary)] rounded-xl px-4 flex items-center gap-1.5 hover:border-[var(--primary)]/50 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Set Reminder
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {reminders.map((r) => (
                  <li key={r.id}>
                    <Link
                      href="/reminders"
                      className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--bg)] -mx-5 px-5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                            {r.task?.title ?? 'Reminder'}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)]">{r.channel}</p>
                        </div>
                      </div>
                      <span
                        className={`badge badge-sm text-[10px] font-semibold border-0 ${
                          r.status === 'SENT' ? 'bg-emerald-100 text-emerald-700'
                          : r.status === 'FAILED' ? 'bg-rose-100 text-rose-700'
                          : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}