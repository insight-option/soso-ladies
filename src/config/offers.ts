import type { Localized } from '@/i18n/config';

export type OfferDefinition = {
  id: string;
  title: Localized;
  description: Localized | null;
  /** Small label on the card, e.g. "Limited Time Offer". */
  badge: Localized | null;
  /** Prices in QAR. Only shown when supplied. */
  priceNow: number | null;
  priceWas: number | null;
  /** Links the offer to a service detail page. */
  serviceSlug: string | null;
  /** Path under /public, or null for the placeholder. */
  image: string | null;
};

/**
 * Real offers only. Empty until the salon supplies one: the Offers page then
 * shows a friendly empty state and the Home page hides its offers section.
 * Offers added from /admin replace this list.
 */
export const offers: OfferDefinition[] = [];
