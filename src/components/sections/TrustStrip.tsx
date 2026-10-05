import { Icon, type IconName } from '@/components/ui/Icon';
import type { Dictionary } from '@/i18n/dictionaries';

const items: Array<{ icon: IconName; key: 'professional' | 'quality' | 'home' | 'salon' }> = [
  { icon: 'gem', key: 'professional' },
  { icon: 'lotus', key: 'quality' },
  { icon: 'home', key: 'home' },
  { icon: 'users', key: 'salon' },
];

/** Four reassurance points; hairline separators come from the 1px grid gap. */
export function TrustStrip({ dict, title }: { dict: Dictionary; title?: string }) {
  return (
    <section aria-label={title ? undefined : dict.trust.label} aria-labelledby={title ? 'trust-title' : undefined}>
      {title ? (
        <h2 id="trust-title" className="mb-6 text-[2rem] leading-tight sm:text-[2.5rem]">
          {title}
        </h2>
      ) : null}
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line shadow-soft ring-1 ring-line md:grid-cols-4">
        {items.map((item) => (
          <li key={item.key} className="flex flex-col items-center gap-3 bg-white px-3 py-6 text-center sm:py-7">
            <span className="grid size-12 place-items-center rounded-full bg-blush text-magenta">
              <Icon name={item.icon} className="size-6" />
            </span>
            <span className="text-sm font-medium text-plum sm:text-[0.9375rem]">{dict.trust[item.key]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
