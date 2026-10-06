import { WhatsAppButton } from '@/components/cta/ContactLinks';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/i18n/dictionaries';

/** "Beauty, Your Way": salon visit or home service, each with its own WhatsApp CTA. */
export function ServiceModes({ dict }: { dict: Dictionary }) {
  const modes: Array<{
    key: string;
    icon: IconName;
    image: string;
    alt: string;
    title: string;
    text: string;
    message: string;
  }> = [
    {
      key: 'salon',
      icon: 'chair',
      image: '/images/salon-service.webp',
      alt: dict.modes.salonImageAlt,
      title: dict.modes.salonTitle,
      text: dict.modes.salonText,
      message: dict.whatsappMessages.salon,
    },
    {
      key: 'home',
      icon: 'home',
      image: '/images/home-service.webp',
      alt: dict.modes.homeImageAlt,
      title: dict.modes.homeTitle,
      text: dict.modes.homeText,
      message: dict.whatsappMessages.home,
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
              <p className="mt-1.5 mb-5 text-muted">{mode.text}</p>
              <WhatsAppButton
                label={dict.common.whatsapp}
                newTabHint={dict.common.opensInNewTab}
                message={mode.message}
                size="sm"
                className="mt-auto"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
