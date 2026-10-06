import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import { format } from '@/i18n/dictionaries';

/** "City, Country" once siteConfig.city is confirmed; null (hidden) until then. */
export function locationLabel(locale: Locale, template: string): string | null {
  if (!siteConfig.city) return null;
  return format(template, { city: siteConfig.city[locale], country: siteConfig.country[locale] });
}
