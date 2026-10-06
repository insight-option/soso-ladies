'use client';

import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { switchLocalePath } from '@/i18n/routes';
import { cx } from '@/lib/cx';

/**
 * Links to the current page in the other language. A plain link on purpose:
 * switching language changes the root <html lang/dir>, so a full load is right
 * (and avoids cross-locale RSC prefetches through the proxy rewrite).
 */
export function LanguageSwitcher({
  locale,
  label,
  className,
  onNavigate,
}: {
  locale: Locale;
  /** The other language's name, written in that language. */
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const target: Locale = locale === 'en' ? 'ar' : 'en';
  const href = switchLocalePath(usePathname(), target);

  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      onClick={onNavigate}
      className={cx(
        'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-[0.9375rem] font-medium text-plum transition-colors hover:bg-blush',
        className,
      )}
    >
      <Icon name="globe" className="size-[1.125rem] text-magenta" />
      {label}
    </a>
  );
}
