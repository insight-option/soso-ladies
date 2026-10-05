import Link from 'next/link';
import { WhatsAppButton } from '@/components/cta/ContactLinks';
import { MediaImage } from '@/components/ui/MediaImage';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { localizePath } from '@/i18n/routes';
import type { Offer, Service } from '@/lib/content';

function formatPrice(locale: Locale, value: number, currency: string): string {
  const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  return locale === 'ar' ? `${amount} ${currency}` : `${currency} ${amount}`;
}

export function OfferCard({
  offer,
  service,
  locale,
  dict,
  headingLevel: Heading = 'h3',
}: {
  offer: Offer;
  /** The linked service, when it exists and is published. */
  service?: Service;
  locale: Locale;
  dict: Dictionary;
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-line/70">
      <div className="relative">
        <MediaImage
          src={offer.image}
          alt=""
          icon={service?.icon ?? 'tag'}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3]"
        />
        {offer.badge ? (
          <span className="absolute start-3 top-3 rounded-full bg-magenta px-3 py-1 text-xs font-semibold text-white shadow-soft">
            {offer.badge[locale]}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Heading className="text-xl leading-snug sm:text-[1.375rem]">{offer.title[locale]}</Heading>
        {service ? (
          <Link
            href={localizePath(locale, `/services/${service.slug}`)}
            className="mt-1 self-start rounded text-sm font-medium text-gold-ink hover:text-magenta"
          >
            {service.name[locale]}
          </Link>
        ) : null}
        {offer.description ? (
          <p className="mt-2 text-sm whitespace-pre-line text-muted">{offer.description[locale]}</p>
        ) : null}
        {offer.priceNow !== null ? (
          <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5">
            <span className="sr-only">{dict.offersSection.priceNow}</span>
            <span className="text-xl font-semibold text-magenta">
              {formatPrice(locale, offer.priceNow, dict.common.currency)}
            </span>
            {offer.priceWas !== null && offer.priceWas > offer.priceNow ? (
              <>
                <span className="sr-only">{dict.offersSection.priceWas}</span>
                <s className="text-sm text-muted">{formatPrice(locale, offer.priceWas, dict.common.currency)}</s>
              </>
            ) : null}
          </p>
        ) : null}
        <div className="mt-auto pt-5">
          <WhatsAppButton
            label={dict.offersSection.getOffer}
            newTabHint={dict.common.opensInNewTab}
            size="sm"
            full
          />
        </div>
      </div>
    </article>
  );
}
