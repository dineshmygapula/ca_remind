'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  Info,
  ShieldCheck,
  Headphones,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../common/Logo';

const PUBLIC_NAV_ITEMS = [
  { label: 'About App', targetId: 'about-app', icon: Info },
  { label: 'Policies', targetId: 'policies', icon: ShieldCheck },
  { label: 'Talk With Agent', targetId: 'talk-with-agent', icon: Headphones },
  { label: 'Help & Support', targetId: 'help-and-support', icon: HelpCircle },
] as const;

export function PublicHeader() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about-app');

  // Sync dark class on mount & toggle
  useEffect(() => {
    const isDarkStored =
      typeof window !== 'undefined' &&
      (localStorage.getItem('theme') === 'dark' ||
        document.documentElement.classList.contains('dark'));
    if (isDarkStored) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const handleScrollTo = (targetId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      // 80px offset for fixed/sticky header
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md shadow-xs transition-colors duration-300">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="cursor-pointer" aria-label="RemindCA Home">
            <Logo />
          </Link>
          <span className="hidden sm:inline-flex items-center rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--accent-hover)] dark:text-[var(--accent)]">
            CA Automation
          </span>
        </div>

        {/* Desktop Anchor Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {PUBLIC_NAV_ITEMS.map(({ label, targetId, icon: Icon }) => {
            const isActive = activeSection === targetId;
            return (
              <a
                key={targetId}
                href={`#${targetId}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo(targetId);
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-xs dark:bg-[var(--accent)] dark:text-navy'
                    : 'text-txt-sub hover:bg-[var(--border)]/40 hover:text-txt-main'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right CTA / Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-txt-main hover:bg-[var(--border)]/40 transition-colors cursor-pointer"
            title="Toggle Light / Dark mode"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-[var(--accent)]" />
            ) : (
              <Moon className="h-5 w-5 text-[var(--primary)]" />
            )}
          </button>

          {/* Sign In Link */}
          <Link
            href="/login"
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-xs sm:text-sm font-bold text-txt-main transition-colors hover:bg-[var(--border)]/30"
          >
            Sign In
          </Link>

          {/* Start Free Trial CTA */}
          <Link
            href="/signup"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-navy-hover active:scale-98"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Get Started</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 md:hidden items-center justify-center rounded-xl text-txt-main hover:bg-[var(--border)]/40 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1">
            {PUBLIC_NAV_ITEMS.map(({ label, targetId, icon: Icon }) => (
              <a
                key={targetId}
                href={`#${targetId}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo(targetId);
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-txt-main hover:bg-[var(--surface-subtle)] transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--primary)] dark:text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{label}</span>
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-center rounded-xl border border-[var(--border)] text-sm font-bold text-txt-main hover:bg-[var(--surface-subtle)]"
            >
              Sign In to Workspace
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy text-sm font-bold text-white shadow-xs hover:bg-navy-hover"
            >
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
