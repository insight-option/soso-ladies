import type { Localized } from '@/i18n/config';

/**
 * Official salon facts. Phone and WhatsApp are fixed here and are never editable
 * from /admin. Anything not supplied by the salon stays `null`, and the UI hides
 * it until a real value exists (here or in the admin panel).
 */
export const siteConfig = {
  name: { en: 'SOSO Ladies Salon', ar: 'سوسو صالون نسائي' } satisfies Localized,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  city: { en: 'Doha', ar: 'الدوحة' } satisfies Localized,
  countryCode: 'QA',

  phone: {
    /** Human-readable form, always rendered inside <bdi dir="ltr">. */
    display: '+974 3342 8070',
    /** tel: target. */
    tel: '+97433428070',
    /** wa.me target (digits only). */
    whatsapp: '97433428070',
  },

  address: null as Localized | null,
  hours: null as Localized | null,
  instagram: null as { handle: string; url: string } | null,
  email: null as string | null,
  mapUrl: null as string | null,

  heroVideo: {
    mp4: '/video/hero.mp4',
    webm: '/video/hero.webm' as string | null,
    poster: '/video/hero-poster.webp',
  },
} as const;
