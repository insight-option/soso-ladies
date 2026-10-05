'use client';

import { generateClient } from 'aws-amplify/data';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';
import type { Schema } from '@amplify/data/resource';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from './fields';
import { t } from './strings';

export type ServiceRow = Schema['Service']['type'];
export type OfferRow = Schema['Offer']['type'];
export type SettingsRow = Schema['SiteSettings']['type'];
export type DataClient = ReturnType<typeof generateClient<Schema>>;

/** A built-in service from src/config, ready to import into the database. */
export type SeedService = {
  slug: string;
  nameEn: string;
  nameAr: string;
  summaryEn: string;
  summaryAr: string;
  introEn: string;
  introAr: string;
  imagePath: string | null;
  icon: string;
};

export const SETTINGS_ID = 'main';

export type SettingsFields = Partial<Omit<SettingsRow, 'id' | 'createdAt' | 'updatedAt'>>;

type Store = {
  client: DataClient;
  services: ServiceRow[];
  offers: OfferRow[];
  settings: SettingsRow | null;
  setServices: Dispatch<SetStateAction<ServiceRow[]>>;
  setOffers: Dispatch<SetStateAction<OfferRow[]>>;
  setSettings: Dispatch<SetStateAction<SettingsRow | null>>;
  /** Creates or updates the singleton settings record. */
  saveSettings: (fields: SettingsFields) => Promise<SettingsRow>;
  seedServices: SeedService[];
  phoneDisplay: string;
  /** True while a form has unsaved changes (checked before navigating away). */
  dirtyRef: RefObject<boolean>;
};

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside <AdminDataProvider>');
  return value;
}

type GraphQLResult<T> = { data: T; errors?: ReadonlyArray<{ message: string }> };

/** Throws on GraphQL errors or an empty result. */
export function must<T>(result: GraphQLResult<T | null>): T {
  if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join('; '));
  if (result.data == null) throw new Error('Empty response');
  return result.data;
}

async function listAll<T>(
  fetchPage: (nextToken: string | null | undefined) => Promise<GraphQLResult<T[]> & { nextToken?: string | null }>,
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const page = await fetchPage(nextToken);
    if (page.errors?.length) throw new Error(page.errors.map((e) => e.message).join('; '));
    items.push(...page.data);
    nextToken = page.nextToken;
  } while (nextToken);
  return items;
}

export function bySortOrder<T extends { sortOrder?: number | null }>(a: T, b: T) {
  return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
}

/** Loads all admin content once after sign-in and shares it with every section. */
export function AdminDataProvider({
  seedServices,
  phoneDisplay,
  client: injectedClient,
  children,
}: {
  seedServices: SeedService[];
  phoneDisplay: string;
  /** Optional data client (e.g. an in-memory one for UI previews); defaults to Amplify. */
  client?: DataClient;
  children: ReactNode;
}) {
  const client = useMemo(() => injectedClient ?? generateClient<Schema>(), [injectedClient]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const dirtyRef = useRef(false);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listAll((nextToken) => client.models.Service.list({ limit: 1000, nextToken })),
      listAll((nextToken) => client.models.Offer.list({ limit: 1000, nextToken })),
      client.models.SiteSettings.get({ id: SETTINGS_ID }),
    ]).then(
      ([serviceRows, offerRows, settingsResult]) => {
        if (cancelled) return;
        if (settingsResult.errors?.length) {
          console.error('[admin] settings load failed', settingsResult.errors);
          setStatus('error');
          return;
        }
        setServices([...serviceRows].sort(bySortOrder));
        setOffers([...offerRows].sort(bySortOrder));
        setSettings(settingsResult.data);
        setStatus('ready');
      },
      (error: unknown) => {
        if (cancelled) return;
        console.error('[admin] load failed', error);
        setStatus('error');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [client, attempt]);

  const saveSettings = useCallback(
    async (fields: SettingsFields) => {
      const saved = settings
        ? must(await client.models.SiteSettings.update({ id: SETTINGS_ID, ...fields }))
        : must(await client.models.SiteSettings.create({ id: SETTINGS_ID, ...fields }));
      setSettings(saved);
      return saved;
    },
    [client, settings],
  );

  if (status !== 'ready') {
    return (
      <div className="grid min-h-[50vh] place-items-center p-6 text-center">
        {status === 'loading' ? (
          <p className="flex items-center gap-3 text-muted" role="status">
            <Spinner className="size-5 text-magenta" />
            {t.loading}
          </p>
        ) : (
          <div role="alert" className="max-w-sm">
            <Icon name="alert" className="mx-auto size-8 text-magenta" />
            <p className="mt-3 text-muted">{t.loadError}</p>
            <button
              type="button"
              onClick={() => {
                setStatus('loading');
                setAttempt((n) => n + 1);
              }}
              className={buttonClasses({ size: 'sm', className: 'mt-5' })}
            >
              {t.retry}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <StoreContext.Provider
      value={{
        client,
        services,
        offers,
        settings,
        setServices,
        setOffers,
        setSettings,
        saveSettings,
        seedServices,
        phoneDisplay,
        dirtyRef,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

/** Keeps the shell informed about unsaved changes and warns before leaving the page. */
export function useUnsavedChanges(dirty: boolean) {
  const { dirtyRef } = useStore();

  useEffect(() => {
    dirtyRef.current = dirty;
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      dirtyRef.current = false;
    };
  }, [dirty, dirtyRef]);
}
