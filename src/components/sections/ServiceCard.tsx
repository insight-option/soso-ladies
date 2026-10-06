import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { MediaImage } from '@/components/ui/MediaImage';
import type { Locale } from '@/i18n/config';
import { localizePath } from '@/i18n/routes';
import type { Service } from '@/lib/content';

const cardClass =
  'group relative h-full overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-line/70 transition-shadow duration-300 hover:shadow-lift has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-magenta';
// The heading link stretches over the whole card.
const stretchedLink = 'after:absolute after:inset-0 after:content-[""] focus-visible:outline-none';
const zoom = 'transition-transform duration-700 ease-soft group-hover:scale-[1.04]';

/** Vertical card with a 4:5 photo (Home and "other services" grids). */
export function ServiceCard({
  service,
  locale,
  sizes,
  headingLevel: Heading = 'h3',
}: {
  service: Service;
  locale: Locale;
  sizes: string;
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
        <Heading className="text-[1.0625rem] leading-snug sm:text-xl">
          <Link href={localizePath(locale, `/services/${service.slug}`)} className={stretchedLink}>
            {service.name[locale]}
          </Link>
        </Heading>
        {service.summary[locale] ? (
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] text-muted sm:text-sm">{service.summary[locale]}</p>
        ) : null}
        <span
          aria-hidden="true"
          className="mt-auto flex justify-end pt-3 sm:pt-4"
        >
          <span className="grid size-8 place-items-center rounded-full bg-magenta text-white transition-colors group-hover:bg-magenta-hover sm:size-9">
            <Icon name="arrow" className="size-4" />
          </span>
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
          <p className="mt-1.5 text-sm text-muted sm:text-[0.9375rem]">{service.summary[locale]}</p>
        ) : null}
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-magenta"
        >
          {detailsLabel}
          <Icon name="arrow" className="size-4" />
        </span>
      </div>
    </article>
  );
}
