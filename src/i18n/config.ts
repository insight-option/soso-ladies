export const locales = ['en', 'ar'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** A string available in every supported language. */
export type Localized = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** BCP 47 tags used for Open Graph and hreflang. */
export const localeTags: Record<Locale, string> = {
  en: 'en_US',
  ar: 'ar_QA',
};
