import { defineAuth } from '@aws-amplify/backend';

/**
 * One owner account signs in with email + password. Self sign-up is disabled in
 * backend.ts (allowAdminCreateUserOnly), so the owner is created from the
 * Amplify console / Cognito, never from the website.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
