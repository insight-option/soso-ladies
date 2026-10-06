'use client';

import { Icon, type IconName } from '@/components/ui/Icon';
import type { AdminSection } from './AdminShell';
import { useStore } from './store';
import { t } from './strings';

const CONTACT_FIELDS = ['addressAr', 'hoursAr', 'instagramHandle', 'email', 'mapUrl'] as const;

export function Dashboard({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const { services, offers, settings } = useStore();
  const visibleServices = services.filter((s) => s.published !== false).length;
  const visibleOffers = offers.filter((o) => o.published !== false).length;
  const contactFilled = CONTACT_FIELDS.filter((key) => settings?.[key]?.trim()).length;

  const cards: Array<{ section: AdminSection; icon: IconName; title: string; value: string }> = [
    {
      section: 'services',
      icon: 'sparkles',
      title: t.dashboard.services,
      value: services.length ? t.dashboard.visibleOf(visibleServices, services.length) : t.dashboard.notImported,
    },
    {
      section: 'offers',
      icon: 'tag',
      title: t.dashboard.offers,
      value: offers.length ? t.dashboard.visibleOf(visibleOffers, offers.length) : t.dashboard.noOffers,
    },
    {
      section: 'contact',
      icon: 'mapPin',
      title: t.dashboard.contact,
      value: t.dashboard.contactFilled(contactFilled, CONTACT_FIELDS.length),
    },
    {
      section: 'media',
      icon: 'video',
      title: t.dashboard.media,
      value: settings?.heroVideoPath ? t.dashboard.customVideo : t.dashboard.defaultVideo,
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[2rem] leading-tight sm:text-[2.25rem]">{t.dashboard.title}</h1>
        <p className="mt-1 text-muted">{t.dashboard.subtitle}</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.section}>
            <button
              type="button"
              onClick={() => onNavigate(card.section)}
              className="group flex w-full items-center gap-4 rounded-card bg-white p-5 text-start shadow-soft ring-1 ring-line/70 transition-shadow hover:shadow-lift"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blush text-magenta">
                <Icon name={card.icon} className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl text-plum">{card.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{card.value}</span>
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-magenta">
                {t.dashboard.manage}
                <Icon name="chevron" className="size-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex items-start gap-2 rounded-2xl bg-blush/70 p-4 text-sm text-plum">
        <Icon name="info" className="mt-0.5 size-4 shrink-0 text-magenta" />
        {t.dashboard.note}
      </p>
    </>
  );
}
