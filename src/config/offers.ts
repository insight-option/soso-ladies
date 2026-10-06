/**
 * Static offers, in the same shape the salon would supply them. Only real
 * offers go here — never invent prices. An empty list (or no active offer)
 * shows the "New offers coming soon" state on /offers and hides the Home
 * section. Offers created in /admin replace this list.
 */
export type OfferData = {
  id: string;
  /** Anchor on the Offers page: /offers#<slug>. Lowercase letters, digits and dashes. */
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  /** Path under /public (e.g. /images/offers/glow.webp); omit for the placeholder. */
  image?: string;
  /** Prices in QAR, shown only when supplied. */
  originalPrice?: number;
  offerPrice?: number;
  /** Small label on the card, e.g. "Limited time". */
  badgeAr?: string;
  badgeEn?: string;
  /** Slug of the related service (links the card to /services/<slug>). */
  service?: string;
  isActive: boolean;
};

export const offers: OfferData[] = [];
