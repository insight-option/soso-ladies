import type { ReactNode } from 'react';
import { CallLink, PhoneNumber, WhatsAppLink } from '@/components/cta/ContactLinks';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { cx } from '@/lib/cx';
import type { ContactDetails } from '@/lib/contact-details';

type ContactListProps = {
  locale: Locale;
  details: ContactDetails;
  labels: Dictionary['contact'];
  newTabHint: string;
  /** "cards" for the Contact page, "compact" for the footer. */
  variant?: 'cards' | 'compact';
};

type Row = {
  key: string;
  icon: IconName;
  label: string;
  value: ReactNode;
  /** Wraps the row in a link when present. */
  link?: (props: { className: string; children: ReactNode }) => ReactNode;
};

function externalLink(href: string, hint: string) {
  return function ExternalLink({ className, children }: { className: string; children: ReactNode }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span className="sr-only"> {hint}</span>
      </a>
    );
  };
}

/**
 * WhatsApp and phone are always shown; address, hours, Instagram, email and
 * map only appear once real values have been supplied.
 */
export function ContactList({ locale, details, labels, newTabHint, variant = 'cards' }: ContactListProps) {
  const rows: Row[] = [
    {
      key: 'whatsapp',
      icon: 'whatsapp',
      label: labels.whatsapp,
      value: <PhoneNumber />,
      link: ({ className, children }) => (
        <WhatsAppLink className={className}>
          {children}
          <span className="sr-only"> {newTabHint}</span>
        </WhatsAppLink>
      ),
    },
    {
      key: 'call',
      icon: 'phone',
      label: labels.call,
      value: <PhoneNumber />,
      link: ({ className, children }) => <CallLink className={className}>{children}</CallLink>,
    },
  ];

  if (details.address) {
    rows.push({
      key: 'address',
      icon: 'mapPin',
      label: labels.address,
      value: details.address[locale],
      link: details.mapUrl ? externalLink(details.mapUrl, newTabHint) : undefined,
    });
  } else if (details.mapUrl) {
    rows.push({
      key: 'map',
      icon: 'map',
      label: labels.map,
      value: labels.openMap,
      link: externalLink(details.mapUrl, newTabHint),
    });
  }

  if (details.hours) {
    rows.push({ key: 'hours', icon: 'clock', label: labels.hours, value: details.hours[locale] });
  }

  if (details.instagram) {
    rows.push({
      key: 'instagram',
      icon: 'instagram',
      label: labels.instagram,
      value: <bdi dir="ltr">@{details.instagram.handle}</bdi>,
      link: externalLink(details.instagram.url, newTabHint),
    });
  }

  if (details.email) {
    const href = `mailto:${details.email}`;
    rows.push({
      key: 'email',
      icon: 'mail',
      label: labels.email,
      value: <bdi dir="ltr">{details.email}</bdi>,
      link: function EmailLink({ className, children }) {
        return (
          <a href={href} className={className}>
            {children}
          </a>
        );
      },
    });
  }

  const compact = variant === 'compact';

  return (
    <ul className={compact ? 'space-y-3' : 'space-y-3 sm:space-y-4'}>
      {rows.map((row) => {
        const content = (
          <>
            <span
              className={cx(
                'grid shrink-0 place-items-center rounded-full bg-blush text-magenta',
                compact ? 'size-9' : 'size-12',
              )}
            >
              <Icon name={row.icon} className={compact ? 'size-4' : 'size-5'} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cx('block text-muted', compact ? 'text-xs' : 'text-sm')}>{row.label}</span>
              <span
                className={cx(
                  'block break-words whitespace-pre-line',
                  compact ? 'text-sm font-medium text-ink' : 'font-semibold text-plum sm:text-lg',
                )}
              >
                {row.value}
              </span>
            </span>
            {row.link && !compact ? <Icon name="chevron" className="size-5 shrink-0 text-muted/70" /> : null}
          </>
        );

        const className = compact
          ? 'flex items-center gap-3 rounded-lg'
          : cx(
              'flex items-center gap-4 rounded-card bg-white p-4 shadow-soft ring-1 ring-line/70 sm:p-5',
              row.link && 'transition-shadow hover:shadow-lift hover:ring-magenta/25',
            );

        return (
          <li key={row.key}>
            {row.link ? row.link({ className, children: content }) : <div className={className}>{content}</div>}
          </li>
        );
      })}
    </ul>
  );
}
