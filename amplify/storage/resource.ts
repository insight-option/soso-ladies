import { defineStorage } from '@aws-amplify/backend';

/** Images and the hero video uploaded from /admin. */
export const storage = defineStorage({
  name: 'sosoMedia',
  access: (allow) => ({
    'media/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});
