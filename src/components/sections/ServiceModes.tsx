import Link from 'next/link';
import { WhatsAppButton } from '@/components/cta/ContactLinks';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { localizePath } from '@/i18n/routes';
import type { Service } from '@/lib/content';

/**
 * "Beauty, Your Way": salon visit or home service, each with its own WhatsApp CTA.
 * The Home card lists only services confirmed as available at home (set in /admin).
 */
export function ServiceModes({ dict, locale, services }: { dict: Dictionary; locale: Locale; services: Service[] }) {
  const homeServices = services.filter((service) => service.availableAtHome === true);
  const modes: Array<{
    key: string;
    icon: IconName;
    image: string;
    alt: string;
    title: string;
    text: string;
    message: string;
    chips: Service[];
  }> = [
    {
      key: 'salon',
      icon: 'chair',
      image: '/images/salon-service.webp',
      alt: dict.modes.salonImageAlt,
      title: dict.modes.salonTitle,
      text: dict.modes.salonText,
      message: dict.whatsappMessages.salon,
      chips: [],
    },
    {
      key: 'home',
      icon: 'home',
      image: '/images/home-service.webp',
      alt: dict.modes.homeImageAlt,
      title: dict.modes.homeTitle,
      text: dict.modes.homeText,
      message: dict.whatsappMessages.home,
      chips: homeServices,
    },
  ];

  return (
    <section aria-labelledby="modes-title" className="container-page">
      <SectionHeading id="modes-title" title={dict.modes.title} subtitle={dict.modes.subtitle} />
      <div className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2 lg:gap-7">
        {modes.map((mode) => (
          <article
            key={mode.key}
            className="flex flex-col overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-line/70"
          >
            <MediaImage
              src={mode.image}
              alt={mode.alt}
              sizes="(min-width: 1216px) 580px, (min-width: 768px) 50vw, 100vw"
              className="aspect-[16/9]"
            />
            <div className="relative flex flex-1 flex-col items-start px-5 pt-9 pb-6 sm:px-7 sm:pb-7">
              <span className="absolute -top-7 start-5 grid size-14 place-items-center rounded-full bg-white text-magenta shadow-soft ring-1 ring-line sm:start-7">
                <Icon name={mode.icon} className="size-7" />
              </span>
              <h3 className="text-2xl">{mode.title}</h3>
              <p className="mt-1.5 text-muted">{mode.text}</p>
              {mode.chips.length > 0 ? (
                <ul aria-label={dict.modes.homeServicesLabel} className="mt-4 flex flex-wrap gap-2">
                  {mode.chips.map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={localizePath(locale, `/services/${service.slug}`)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1.5 text-sm font-medium text-plum transition-colors hover:bg-blush-deep"
                      >
                        <Icon name={service.icon} className="size-4 text-magenta" />
                        {service.name[locale]}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-auto pt-5">
                <WhatsAppButton
                  label={dict.common.whatsapp}
                  newTabHint={dict.common.opensInNewTab}
                  message={mode.message}
                  size="sm"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
