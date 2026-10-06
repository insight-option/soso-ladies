import { preload } from 'react-dom';
import { CallButton, WhatsAppButton } from '@/components/cta/ContactLinks';
import { HeroVideo } from '@/components/sections/HeroVideo';
import type { Dictionary } from '@/i18n/dictionaries';
import type { SiteSettings } from '@/lib/content';

export function Hero({ dict, video }: { dict: Dictionary; video: SiteSettings['heroVideo'] }) {
  // The poster is the first thing painted in the video frame (LCP candidate).
  if (video.poster) preload(video.poster, { as: 'image', fetchPriority: 'high' });

  return (
    <section aria-labelledby="hero-title">
      <div className="container-page grid items-center gap-7 pt-6 pb-10 sm:gap-10 sm:pt-12 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-14 lg:pt-14 lg:pb-16">
        <div className="max-w-xl">
          <p className="eyebrow">{dict.hero.eyebrow}</p>
          {/* Two lines visually; the space keeps "جمالك، شغفنا" / "Your Beauty, Our Passion" intact
              for screen readers, copy/paste and search engines. */}
          <h1
            id="hero-title"
            className="mt-4 text-[2.5rem] leading-[1.08] min-[400px]:text-5xl sm:mt-5 sm:text-6xl lg:text-[4.25rem]"
          >
            <span className="block">{dict.hero.titleLine1}</span>{' '}
            <span className="block text-magenta">{dict.hero.titleLine2}</span>
          </h1>
          <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-muted sm:mt-5 sm:text-xl">
            {dict.hero.subtitle}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <WhatsAppButton
              label={dict.common.whatsapp}
              newTabHint={dict.common.opensInNewTab}
              size="md"
              full
              className="sm:h-13 sm:w-auto sm:px-7 sm:text-base"
            />
            <CallButton
              label={dict.common.callNow}
              size="md"
              full
              className="sm:h-13 sm:w-auto sm:px-7 sm:text-base"
            />
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -end-2 -bottom-3 start-6 top-6 rounded-[2rem] bg-blush sm:-end-4 sm:-bottom-4 sm:start-10 sm:top-10"
          />
          <div className="relative">
            <HeroVideo
              mp4={video.mp4}
              webm={video.webm}
              poster={video.poster}
              label={dict.hero.videoLabel}
              playLabel={dict.hero.playVideo}
              pauseLabel={dict.hero.pauseVideo}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
