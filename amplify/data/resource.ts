import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Website content managed from /admin. Bilingual fields are suffixed En / Ar.
 * Visitors read as guests through the identity pool (no API key that expires);
 * only the signed-in owner can write.
 */
const schema = a.schema({
  Service: a
    .model({
      slug: a.string().required(),
      nameEn: a.string().required(),
      nameAr: a.string().required(),
      summaryEn: a.string(),
      summaryAr: a.string(),
      introEn: a.string(),
      introAr: a.string(),
      imagePath: a.string(),
      icon: a.string(),
      sortOrder: a.integer(),
      published: a.boolean(),
      // Where the service is offered. Optional with no default: null = not set
      // yet (nothing is shown on the site); set from the admin service form.
      availableAtSalon: a.boolean(),
      availableAtHome: a.boolean(),
    })
    .authorization((allow) => [allow.guest().to(['read']), allow.authenticated()]),

  Offer: a
    .model({
      titleEn: a.string().required(),
      titleAr: a.string().required(),
      descriptionEn: a.string(),
      descriptionAr: a.string(),
      badgeEn: a.string(),
      badgeAr: a.string(),
      priceNow: a.float(),
      priceWas: a.float(),
      serviceSlug: a.string(),
      imagePath: a.string(),
      sortOrder: a.integer(),
      published: a.boolean(),
    })
    .authorization((allow) => [allow.guest().to(['read']), allow.authenticated()]),

  // Singleton: the app always reads/writes the record with id "main".
  SiteSettings: a
    .model({
      addressEn: a.string(),
      addressAr: a.string(),
      hoursEn: a.string(),
      hoursAr: a.string(),
      instagramHandle: a.string(),
      instagramUrl: a.string(),
      email: a.string(),
      mapUrl: a.string(),
      heroVideoPath: a.string(),
      heroPosterPath: a.string(),
    })
    .authorization((allow) => [allow.guest().to(['read']), allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
