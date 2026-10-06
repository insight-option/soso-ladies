import { WhatsAppButton } from '@/components/cta/ContactLinks';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MediaImage } from '@/components/ui/MediaImage';
import type { Dictionary } from '@/i18n/dictionaries';

/** "Salon Service" and "Home Service" cards on the Home page. */
export function ServiceModes({ dict }: { dict: Dictionary }) {
  const modes: Array<{ key: string; icon: IconName; image: string; alt: string; title: string; text: string }> = [
    {
      key: 'salon',
      icon: 'chair',
      image: '/images/salon-service.webp',
      alt: dict.modes.salonImageAlt,
      title: dict.modes.salonTitle,
      text: dict.modes.salonText,
    },
    {
      key: 'home',
      icon: 'home',
      image: '/images/home-service.webp',
      alt: dict.modes.homeImageAlt,
      title: dict.modes.homeTitle,
      text: dict.modes.homeText,
    },
  ];

  return (
    <section aria-labelledby="modes-title" className="container-page">
      <h2 id="modes-title" className="sr-only">
        {dict.modes.title}
      </h2>
      <div className="grid gap-5 md:grid-cols-2 lg:gap-7">
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
