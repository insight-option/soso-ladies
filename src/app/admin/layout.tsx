import '../globals.css';
import '@aws-amplify/ui-react/styles.css';
import './admin.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVariables } from '@/fonts';

export const metadata: Metadata = {
  title: 'لوحة التحكم | سوسو صالون نسائي',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fbf7f3',
};

/** Separate root layout: the admin panel is Arabic, right-to-left and never indexed. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <body className="min-h-dvh bg-cream">{children}</body>
    </html>
  );
}
