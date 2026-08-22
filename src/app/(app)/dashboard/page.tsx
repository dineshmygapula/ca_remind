'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Clock,
  CalendarClock,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { getTasks } from '@/services/taskService';
import { TaskListItem } from '@/types/task.types';
import {
  calculateTaskSummary,
  TaskSummaryCounts,
} from '@/utils/taskSummary';
import TaskSummaryCard from '@/components/dashboard/TaskSummaryCard';

export default function DashboardPage() {
  const { businessId } = useAuth();
  const router = useRouter();

  // ─── State ─────────────────────────────────────────────
  const [summary, setSummary] = useState<TaskSummaryCounts>({
    overdue: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    todayCompleted: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Fetch Tasks ───────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError('');

      const taskArray: TaskListItem[] = await getTasks(businessId);
      setSummary(calculateTaskSummary(taskArray));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [businessId, fetchTasks]);

  // ─── Handlers ──────────────────────────────────────────
  const handleCardClick = (filter: string) => {
    router.push(`/tasks?filter=${filter}`);
  };

  // ─── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Loading dashboard data...
          </span>
        </div>
      </div>
    );
  }

  // ─── Card Config ───────────────────────────────────────
  // Icon colors pulled from the same palette (navy + gold) with two
  // semantic accents (rose for overdue, emerald for completed) so the
  // grid still reads as one cohesive set instead of four random hues.
  const summaryCards = [
    {
      filter: 'overdue',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      count: summary.overdue,
      label: 'Over Due',
      iconBgColor: 'rgba(225, 29, 72, 0.10)',
    },
    {
      filter: 'today',
      icon: <Clock className="w-5 h-5 text-[var(--accent)]" />,
      count: summary.today,
      label: 'Today',
      sublabel: `${summary.today} task${summary.today !== 1 ? 's' : ''}`,
      iconBgColor: 'rgba(201, 162, 39, 0.12)',
    },
    {
      filter: 'upcoming',
      icon: <CalendarClock className="w-5 h-5 text-[var(--primary)] dark:text-[var(--accent)]" />,
      count: summary.upcoming,
      label: 'Upcoming',
      iconBgColor: 'rgba(27, 42, 74, 0.08)',
    },
    {
      filter: 'completed',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      count: summary.completed,
      label: 'Completed',
      iconBgColor: 'rgba(5, 150, 105, 0.10)',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--heading)] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">
            Get a quick overview of your tasks and compliance activities
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl mb-6 flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="rounded-full p-1 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {summaryCards.map(({ filter, icon, count, label, sublabel, iconBgColor }) => (
            <TaskSummaryCard
              key={filter}
              icon={icon}
              count={count}
              label={label}
              sublabel={sublabel}
              iconBgColor={iconBgColor}
              onClick={() => handleCardClick(filter)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}