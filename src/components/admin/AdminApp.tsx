'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { AdminShell } from './AdminShell';
import { authVocabularyAr } from './auth-vocabulary';
import { FeedbackProvider } from './feedback';
import { AdminDataProvider, type SeedService } from './store';
import { t } from './strings';

let configured = false;

function configureAmplify(outputs: Record<string, unknown>) {
  if (configured) return;
  Amplify.configure(outputs as Parameters<typeof Amplify.configure>[0]);
  I18n.putVocabularies({ ar: authVocabularyAr });
  I18n.setLanguage('ar');
  configured = true;
}

function AuthHeader() {
  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-2 text-center">
      <Logo alt={t.siteName} className="h-28" sizes="85px" preload />
      <p className="mt-4 font-display text-2xl text-plum">{t.appTitle}</p>
      <p className="mt-1 text-sm text-muted">{t.auth.subtitle}</p>
    </div>
  );
}

const authComponents = { Header: AuthHeader };

const formFields = {
  signIn: {
    username: { label: authVocabularyAr.Email, placeholder: t.auth.emailPlaceholder },
  },
};

/**
 * Owner-only admin: Amplify Authenticator (sign-up hidden; the account is created
 * by an administrator), then the content manager once signed in.
 */
export function AdminApp({
  outputs,
  seedServices,
  phoneDisplay,
}: {
  outputs: Record<string, unknown>;
  seedServices: SeedService[];
  phoneDisplay: string;
}) {
  useState(() => configureAmplify(outputs));

  return (
    <Authenticator hideSignUp components={authComponents} formFields={formFields}>
      {({ signOut, user }) => (
        <FeedbackProvider>
          <AdminDataProvider seedServices={seedServices} phoneDisplay={phoneDisplay}>
            <AdminShell email={user?.signInDetails?.loginId} signOut={() => signOut?.()} />
          </AdminDataProvider>
        </FeedbackProvider>
      )}
    </Authenticator>
  );
}
