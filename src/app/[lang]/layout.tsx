import '../globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { MobileCtaBar } from '@/components/cta/MobileCtaBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { siteConfig } from '@/config/site';
import { fontVariables } from '@/fonts';
import { localeDir, locales } from '@/i18n/config';
import { resolveLocale, type LangParams } from '@/i18n/params';
import { getServices, getSettings } from '@/lib/content';
import { beautySalonJsonLd } from '@/lib/seo';

export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fbf7f3',
};

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const { dict } = await resolveLocale(params);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: dict.meta.siteName, template: `%s | ${dict.meta.siteName}` },
    description: dict.meta.defaultDescription,
    applicationName: dict.meta.siteName,
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: LangParams }) {
  const { locale, dict } = await resolveLocale(params);
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const jsonLd = JSON.stringify(beautySalonJsonLd(locale, settings)).replace(/</g, '\\u003c');

  return (
    <html lang={locale} dir={localeDir(locale)} className={fontVariables}>
      <body className="flex min-h-dvh flex-col pb-cta-bar">
        <a
          href="#main"
          className="sr-only rounded-lg bg-white px-4 py-2 font-semibold text-magenta shadow-lift focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
        >
          {dict.common.skipToContent}
        </a>
        <Header locale={locale} dict={dict} />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer locale={locale} dict={dict} services={services} settings={settings} />
        <MobileCtaBar dict={dict} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </body>
    </html>
  );
}
