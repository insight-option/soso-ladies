import type { Dictionary } from '@/i18n/dictionaries';

type NavKey = keyof Pick<Dictionary['nav'], 'home' | 'services' | 'offers' | 'about' | 'contact'>;

/** Public navigation, in display order. Paths are unprefixed. */
export const navItems: ReadonlyArray<{ key: NavKey; path: string }> = [
  { key: 'home', path: '/' },
  { key: 'services', path: '/services' },
  { key: 'offers', path: '/offers' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
];

/** `current` is an unprefixed path; sub-pages keep their section active. */
export function isActivePath(current: string, path: string): boolean {
  if (path === '/') return current === '/';
  return current === path || current.startsWith(`${path}/`);
}
