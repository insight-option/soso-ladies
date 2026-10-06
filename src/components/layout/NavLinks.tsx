'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stripLocale } from '@/i18n/routes';
import { cx } from '@/lib/cx';
import { isActivePath } from '@/lib/nav';

export type NavLink = { href: string; path: string; label: string };

/** Desktop navigation with the current section highlighted. */
export function NavLinks({ links, label }: { links: NavLink[]; label: string }) {
  const current = stripLocale(usePathname());

  return (
    <nav aria-label={label} className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {links.map((link) => {
          const active = isActivePath(current, link.path);
          return (
            <li key={link.path}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative block rounded-lg px-3.5 py-2 text-[0.9375rem] transition-colors',
                  active ? 'font-semibold text-plum' : 'font-medium text-ink/80 hover:text-plum',
                )}
              >
                {link.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute start-1/2 -bottom-0.5 h-px w-5 -translate-x-1/2 rounded-full bg-magenta/70 rtl:translate-x-1/2"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
