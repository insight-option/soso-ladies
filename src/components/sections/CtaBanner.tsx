import { CallButton, WhatsAppButton } from '@/components/cta/ContactLinks';
import { Icon } from '@/components/ui/Icon';
import type { Dictionary } from '@/i18n/dictionaries';

/** Closing call to action shown at the end of most pages. */
export function CtaBanner({
  dict,
  title = dict.ctaBanner.title,
  text = dict.ctaBanner.text,
  whatsappMessage,
}: {
  dict: Dictionary;
  title?: string;
  text?: string;
  /** Prefilled WhatsApp message (e.g. the service on a detail page). */
  whatsappMessage?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="container-page mt-16 sm:mt-24">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-blush px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14">
        <Icon
          name="lotus"
          className="pointer-events-none absolute -end-6 -bottom-8 size-44 text-blush-deep sm:size-56"
        />
        <div className="relative max-w-xl">
          <h2 id="cta-title" className="text-[1.875rem] leading-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted sm:text-lg">{text}</p>
        </div>
        <div className="relative mt-7 grid gap-3 min-[400px]:grid-cols-2 sm:flex lg:mt-0 lg:shrink-0">
          <WhatsAppButton
            label={dict.common.whatsapp}
            newTabHint={dict.common.opensInNewTab}
            message={whatsappMessage}
            full
            className="sm:w-auto sm:px-5"
          />
          <CallButton label={dict.common.callNow} full className="sm:w-auto sm:px-5" />
        </div>
      </div>
    </section>
  );
}
