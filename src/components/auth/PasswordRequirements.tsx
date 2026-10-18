'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Check, Dot } from 'lucide-react';

const RULES = [
  { key: 'minLength', label: '8+ chars', test: (p: string) => p.length >= 8 },
  { key: 'hasUpper', label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'hasNumber', label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { key: 'hasSpecial', label: 'Symbol (!@#$)', test: (p: string) => /[!@#$%^&*]/.test(p) },
] as const;

export function PasswordRequirements({ name = 'password' }: { name?: string }) {
  const { control } = useFormContext();
  const password: string = useWatch({ control, name }) || '';

  // Don't render a heavy block when empty
  if (!password) {
    return (
      <p className="mt-1 text-[11.5px] text-[var(--text-secondary)]">
        Must be at least 8 characters with an uppercase letter, number, and symbol.
      </p>
    );
  }

  const passedCount = RULES.filter((r) => r.test(password)).length;
  const isComplete = passedCount === RULES.length;

  return (
    <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
      {/* Sleek mini strength progress meter */}
      <div className="flex gap-1.5 h-1 w-full">
        {RULES.map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              idx < passedCount
                ? isComplete
                  ? 'bg-emerald-500'
                  : passedCount > 2
                  ? 'bg-amber-500'
                  : 'bg-rose-400'
                : 'bg-[var(--border)]'
            }`}
          />
        ))}
      </div>

      {/* Subtle micro check tags */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
        {RULES.map((rule) => {
          const valid = rule.test(password);
          return (
            <span
              key={rule.key}
              className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                valid
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-[var(--text-secondary)]/70'
              }`}
            >
              {valid ? (
                <Check className="h-3 w-3 text-emerald-500 stroke-[2.5]" />
              ) : (
                <Dot className="h-3 w-3 text-[var(--text-secondary)]/50" />
              )}
              <span>{rule.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}