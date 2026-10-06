import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { MediaImage } from '@/components/ui/MediaImage';
import type { Locale } from '@/i18n/config';
import { localizePath } from '@/i18n/routes';
import type { Service } from '@/lib/content';

// Tailwind v4 `hover:` only applies on devices that can hover, so touch screens
// get no sticky hover state; the lift also respects reduced motion.
const cardClass =
  'group relative h-full overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-line/70 transition-[box-shadow,translate] duration-300 ease-soft hover:shadow-lift motion-safe:hover:-translate-y-1 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-magenta';
// The heading link stretches over the whole card (large touch target).
const stretchedLink = 'after:absolute after:inset-0 after:content-[""] focus-visible:outline-none';
const zoom = 'transition-transform duration-700 ease-soft motion-safe:group-hover:scale-[1.04]';

function DetailsLabel({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-magenta sm:text-sm"
    >
      {label}
      <Icon
        name="arrow"
        className="size-3.5 transition-transform duration-300 sm:size-4 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
      />
    </span>
  );
}

/** Vertical card with a 4:5 photo (Home and "other services" grids). */
export function ServiceCard({
  service,
  locale,
  sizes,
  detailsLabel,
  headingLevel: Heading = 'h3',
}: {
  service: Service;
  locale: Locale;
  sizes: string;
  detailsLabel: string;
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <article className={`${cardClass} flex flex-col`}>
      <MediaImage
        src={service.image}
        alt=""
        icon={service.icon}
        sizes={sizes}
        className="aspect-[4/5]"
        imageClassName={zoom}
      />
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        {/* A fixed two-line summary keeps cards even; rows stretch to equal height. */}
        <Heading className="line-clamp-2 text-[1.0625rem] leading-snug sm:text-xl">
          <Link href={localizePath(locale, `/services/${service.slug}`)} className={stretchedLink}>
            {service.name[locale]}
          </Link>
        </Heading>
        <p className="mt-1 line-clamp-2 min-h-[2lh] text-[0.8125rem] text-muted sm:mt-1.5 sm:text-sm">
          {service.summary[locale]}
        </p>
        <span className="mt-auto pt-3 sm:pt-4">
          <DetailsLabel label={detailsLabel} />
        </span>
      </div>
    </article>
  );
}

/** Horizontal card with a 4:5 thumbnail (Services page). */
export function ServiceRow({
  service,
  locale,
  detailsLabel,
}: {
  service: Service;
  locale: Locale;
  detailsLabel: string;
}) {
  return (
    <article className={`${cardClass} flex gap-4 p-3 sm:gap-5 sm:p-4`}>
      <MediaImage
        src={service.image}
        alt=""
        icon={service.icon}
        sizes="(min-width: 640px) 144px, 112px"
        className="aspect-[4/5] w-28 shrink-0 rounded-2xl sm:w-36"
        imageClassName={zoom}
      />
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h2 className="text-xl leading-snug sm:text-2xl">
          <Link href={localizePath(locale, `/services/${service.slug}`)} className={stretchedLink}>
            {service.name[locale]}
          </Link>
        </h2>
        {service.summary[locale] ? (
          <p className="mt-1.5 line-clamp-3 text-sm text-muted sm:text-[0.9375rem]">{service.summary[locale]}</p>
        ) : null}
        <span className="mt-auto pt-3">
          <DetailsLabel label={detailsLabel} />
        </span>
      </div>
    </article>
  );
}
