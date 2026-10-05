import { CallButton, WhatsAppButton } from '@/components/cta/ContactLinks';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Fixed WhatsApp / Call bar on small screens. The body reserves the same
 * height (pb-cta-bar) so it never covers content.
 */
export function MobileCtaBar({ dict }: { dict: Dictionary }) {
  return (
    <aside
      aria-label={dict.common.quickContactLabel}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-8px_24px_-16px_rgb(91_15_58/0.25)] backdrop-blur-md lg:hidden"
    >
      <div className="container-page grid grid-cols-2 gap-3">
        <WhatsAppButton label={dict.common.whatsapp} newTabHint={dict.common.opensInNewTab} full />
        <CallButton label={dict.common.callNow} full />
      </div>
    </aside>
  );
}
