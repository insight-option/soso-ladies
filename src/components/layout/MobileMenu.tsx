'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CallButton, PhoneNumber, WhatsAppButton } from '@/components/cta/ContactLinks';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import type { NavLink } from '@/components/layout/NavLinks';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { Locale } from '@/i18n/config';
import { stripLocale } from '@/i18n/routes';
import { cx } from '@/lib/cx';
import { isActivePath } from '@/lib/nav';

type MobileMenuProps = {
  locale: Locale;
  links: NavLink[];
  homeHref: string;
  labels: {
    open: string;
    close: string;
    title: string;
    home: string;
    nav: string;
    language: string;
    whatsapp: string;
    callNow: string;
    newTab: string;
  };
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Full-screen menu for small screens: focus trap, Escape to close, scroll lock. */
export function MobileMenu({ locale, links, homeHref, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = stripLocale(usePathname());
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      toggle?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={labels.open}
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-xl text-plum transition-colors hover:bg-blush"
      >
        <Icon name="menu" className="size-6" />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream"
        >
          <div className="container-page flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line">
            <Link href={homeHref} onClick={close} className="rounded-lg">
              <Logo alt={labels.home} className="h-14" sizes="44px" />
            </Link>
            <button
              type="button"
              aria-label={labels.close}
              onClick={close}
              className="grid size-11 place-items-center rounded-xl text-plum transition-colors hover:bg-blush"
            >
              <Icon name="close" className="size-6" />
            </button>
          </div>

          <nav aria-label={labels.nav} className="container-page flex-1 py-6">
            <ul className="divide-y divide-line">
              {links.map((link) => {
                const active = isActivePath(current, link.path);
                return (
                  <li key={link.path}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'flex items-center justify-between py-4 font-display text-2xl transition-colors',
                        active ? 'text-magenta' : 'text-plum hover:text-magenta',
                      )}
                    >
                      {link.label}
                      <Icon name="chevron" className="size-5 opacity-50" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <LanguageSwitcher locale={locale} label={labels.language} onNavigate={close} className="mt-6 -ms-3" />
          </nav>

          <div className="container-page shrink-0 border-t border-line bg-white/60 pt-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
            <p className="mb-4 text-center text-sm text-muted">
              <PhoneNumber />
            </p>
            <div className="grid grid-cols-2 gap-3">
              <WhatsAppButton label={labels.whatsapp} newTabHint={labels.newTab} full />
              <CallButton label={labels.callNow} full />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
