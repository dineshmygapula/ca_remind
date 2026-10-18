import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import '../globals.css';
import Providers from '@/components/Providers';
import NextTopLoader from 'nextjs-toploader';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'RemindCA | Compliance Automation Platform for CA Firms',
  description:
    'Automated statutory compliance tasks, GST/ITR tracking, and WhatsApp reminder management platform for CA & Accounting firms in India.',
  icons: {
    icon: [
      { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon/favicon-16x16.png' },
      { rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' },
    ],
  },
  manifest: '/manifest.json',
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body
        className={`${manrope.className} min-h-screen bg-[var(--bg)] text-[var(--text-primary)] antialiased transition-colors duration-300`}
      >
        <NextTopLoader
          color="#c9a227"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #c9a227,0 0 5px #c9a227"
          zIndex={1600}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
