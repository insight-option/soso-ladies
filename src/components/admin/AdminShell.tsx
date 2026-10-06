'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { cx } from '@/lib/cx';
import { ContactSettings } from './ContactSettings';
import { Dashboard } from './Dashboard';
import { useFeedback } from './feedback';
import { MediaManager } from './MediaManager';
import { OffersManager } from './OffersManager';
import { ServicesManager } from './ServicesManager';
import { useStore } from './store';
import { t } from './strings';

const sections = [
  { id: 'dashboard', icon: 'dashboard', label: t.nav.dashboard },
  { id: 'services', icon: 'sparkles', label: t.nav.services },
  { id: 'offers', icon: 'tag', label: t.nav.offers },
  { id: 'contact', icon: 'mapPin', label: t.nav.contact },
  { id: 'media', icon: 'video', label: t.nav.media },
] as const satisfies ReadonlyArray<{ id: string; icon: IconName; label: string }>;

export type AdminSection = (typeof sections)[number]['id'];

function isSection(value: string): value is AdminSection {
  return sections.some((section) => section.id === value);
}

// The current section lives in the URL hash (#services) so refresh/back work.
function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}
const getHash = () => window.location.hash.slice(1);
const getServerHash = () => '';

export function AdminShell({ email, signOut }: { email?: string; signOut: () => void }) {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  const current: AdminSection = isSection(hash) ? hash : 'dashboard';
  const { dirtyRef } = useStore();
  const { confirm } = useFeedback();

  async function canLeave() {
    if (!dirtyRef.current) return true;
    return confirm({
      title: t.unsavedTitle,
      message: t.unsavedMessage,
      confirmLabel: t.discard,
      cancelLabel: t.keepEditing,
    });
  }

  async function navigate(section: AdminSection) {
    if (section === current || !(await canLeave())) return;
    dirtyRef.current = false;
    window.location.hash = section;
    window.scrollTo({ top: 0 });
    document.getElementById('admin-main')?.focus({ preventScroll: true });
  }

  async function logout() {
    if (!(await canLeave())) return;
    dirtyRef.current = false;
    signOut();
  }

  const content: Record<AdminSection, ReactNode> = {
    dashboard: <Dashboard onNavigate={(section) => void navigate(section)} />,
    services: <ServicesManager />,
    offers: <OffersManager />,
    contact: <ContactSettings />,
    media: <MediaManager />,
  };

  const navButton = (section: (typeof sections)[number], variant: 'side' | 'tab') => {
    const active = section.id === current;
    return (
      <button
        type="button"
        onClick={() => void navigate(section.id)}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'flex items-center transition-colors',
          variant === 'side'
            ? cx(
                'w-full gap-3 rounded-xl px-3.5 py-3 text-[0.9375rem] font-medium',
                active ? 'bg-blush text-magenta' : 'text-ink hover:bg-cream hover:text-magenta',
              )
            : cx(
                'h-full flex-1 flex-col justify-center gap-1 px-0.5 text-[0.6875rem] font-medium',
                active ? 'text-magenta' : 'text-muted',
              ),
        )}
      >
        <span
          className={cx(
            'grid place-items-center rounded-full',
            variant === 'tab' && 'h-7 w-12',
            variant === 'tab' && active && 'bg-blush',
          )}
        >
          <Icon name={section.icon} className="size-5" />
        </span>
        <span className="truncate">{section.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-dvh lg:ps-72">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-72 flex-col border-e border-line bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-line px-6 py-5">
          <Logo alt={t.siteName} className="h-16" sizes="50px" />
          <div>
            <p className="font-display text-lg text-plum">{t.appTitle}</p>
            {email ? (
              <p className="max-w-40 truncate text-xs text-muted" dir="ltr">
                {email}
              </p>
            ) : null}
          </div>
        </div>
        <nav aria-label={t.nav.label} className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>{navButton(section, 'side')}</li>
            ))}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-line p-4">
          <a
            href="/ar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[0.9375rem] text-ink hover:bg-cream hover:text-magenta"
          >
            <Icon name="external" className="size-5" />
            {t.viewSite}
          </a>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[0.9375rem] text-ink hover:bg-cream hover:text-magenta"
          >
            <Icon name="logout" className="size-5 rtl:-scale-x-100" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-cream/95 px-4 backdrop-blur lg:hidden">
        <Logo alt={t.siteName} className="h-11" sizes="34px" />
        <p className="flex-1 truncate font-display text-lg text-plum">{t.appTitle}</p>
        <a
          href="/ar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.viewSite}
          className="grid size-10 place-items-center rounded-xl text-plum hover:bg-blush"
        >
          <Icon name="external" className="size-5" />
        </a>
        <button
          type="button"
          onClick={() => void logout()}
          aria-label={t.logout}
          className="grid size-10 place-items-center rounded-xl text-plum hover:bg-blush"
        >
          <Icon name="logout" className="size-5 rtl:-scale-x-100" />
        </button>
      </header>

      <main
        id="admin-main"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] outline-none sm:px-6 lg:px-10 lg:pt-10 lg:pb-12"
      >
        {content[current]}
      </main>

      {/* Mobile bottom tabs */}
      <nav
        aria-label={t.nav.label}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="flex h-16">
          {sections.map((section) => (
            <li key={section.id} className="flex flex-1">
              {navButton(section, 'tab')}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
