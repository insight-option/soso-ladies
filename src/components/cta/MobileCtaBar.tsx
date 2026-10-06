import { CallButton, WhatsAppButton } from '@/components/cta/ContactLinks';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Compact WhatsApp / Call bar fixed to the bottom on small screens. The body
 * reserves the same height (pb-cta-bar) so it never covers content.
 */
export function MobileCtaBar({ dict }: { dict: Dictionary }) {
  return (
    <aside
      aria-label={dict.common.quickContactLabel}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-cream/95 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-8px_24px_-18px_rgb(91_15_58/0.3)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5">
        <WhatsAppButton
          label={dict.common.whatsapp}
          newTabHint={dict.common.opensInNewTab}
          size="compact"
          full
        />
        <CallButton label={dict.common.callNow} size="compact" full />
      </div>
    </aside>
  );
}
