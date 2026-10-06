import { defaultLocale, locales, type Locale } from './config';

/**
 * English lives at the root (/services), Arabic under /ar (/ar/services).
 * `path` is always the unprefixed path, starting with "/".
 */
export function localizePath(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Removes a locale prefix from a pathname. Browsers only see /ar/…, but the
 * proxy rewrites English requests to /en/…, which is what renders on the server.
 */
export function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname || '/';
}

/** The same page in another language. */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localizePath(target, stripLocale(pathname));
}
