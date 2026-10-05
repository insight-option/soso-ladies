'use client';

import { useRef, useState } from 'react';
import { ContactList } from '@/components/cta/ContactList';
import { Icon } from '@/components/ui/Icon';
import { localeDir, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { cx } from '@/lib/cx';
import { siteConfig } from '@/config/site';
import { emailAddress, httpsUrl, toContactDetails } from '@/lib/contact-details';
import { useFeedback } from './feedback';
import { Panel, TextAreaField, TextField } from './fields';
import { FormShell } from './FormShell';
import { useStore, useUnsavedChanges } from './store';
import { t } from './strings';

const FIELDS = [
  'addressAr',
  'addressEn',
  'hoursAr',
  'hoursEn',
  'instagramHandle',
  'instagramUrl',
  'email',
  'mapUrl',
] as const;

type Draft = Record<(typeof FIELDS)[number], string>;
type Errors = Partial<Record<keyof Draft, string>>;

function validate(draft: Draft): Errors {
  const errors: Errors = {};
  if (draft.email.trim() && !emailAddress(draft.email)) errors.email = t.contact.invalidEmail;
  if (draft.instagramUrl.trim() && !httpsUrl(draft.instagramUrl)) errors.instagramUrl = t.contact.invalidUrl;
  if (draft.mapUrl.trim() && !httpsUrl(draft.mapUrl)) errors.mapUrl = t.contact.invalidUrl;
  const handle = draft.instagramHandle.trim().replace(/^@/, '');
  if (handle && !/^[A-Za-z0-9._]{1,30}$/.test(handle)) errors.instagramHandle = t.contact.invalidHandle;
  return errors;
}

/** Optional contact details with a live preview of the public Contact page. */
export function ContactSettings() {
  const { settings, saveSettings, phoneDisplay } = useStore();
  const { toast } = useFeedback();
  const [saved, setSaved] = useState<Draft>(() =>
    Object.fromEntries(FIELDS.map((key) => [key, settings?.[key] ?? ''])) as Draft,
  );
  const [draft, setDraft] = useState(saved);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<Locale>('ar');
  const formRef = useRef<HTMLDivElement>(null);

  const dirty = FIELDS.some((key) => draft[key] !== saved[key]);
  useUnsavedChanges(dirty && !saving);
  const errors = submitted ? validate(draft) : {};
  const set = (key: keyof Draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    setSubmitted(true);
    if (Object.keys(validate(draft)).length > 0) {
      toast('error', t.fixErrors);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    try {
      const fields = Object.fromEntries(FIELDS.map((key) => [key, draft[key].trim() || null]));
      await saveSettings({ ...fields, instagramHandle: fields.instagramHandle?.replace(/^@/, '') ?? null });
      const normalized = Object.fromEntries(FIELDS.map((key) => [key, draft[key].trim()])) as Draft;
      setSaved(normalized);
      setDraft(normalized);
      setSubmitted(false);
      toast('success', t.saved);
    } catch (error) {
      console.error('[admin] contact save failed', error);
      toast('error', t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  const previewDict = getDictionary(previewLocale);

  return (
    <FormShell title={t.contact.title} subtitle={t.contact.subtitle} dirty={dirty} saving={saving} onSubmit={() => void save()}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div ref={formRef} className="space-y-5">
          <Panel title={t.contact.fixed} description={t.contact.fixedHint}>
            <p className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3 font-semibold text-plum">
              <Icon name="phone" className="size-5 text-magenta" />
              <bdi dir="ltr">{phoneDisplay}</bdi>
            </p>
          </Panel>

          <Panel>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextAreaField label={t.contact.addressAr} value={draft.addressAr} onValueChange={set('addressAr')} rows={2} optional />
              <TextAreaField label={t.contact.addressEn} value={draft.addressEn} onValueChange={set('addressEn')} rows={2} optional ltr />
              <TextAreaField
                label={t.contact.hoursAr}
                value={draft.hoursAr}
                onValueChange={set('hoursAr')}
                hint={t.contact.hoursHint}
                rows={3}
                optional
              />
              <TextAreaField label={t.contact.hoursEn} value={draft.hoursEn} onValueChange={set('hoursEn')} rows={3} optional ltr />
            </div>
          </Panel>

          <Panel>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label={t.contact.instagramHandle}
                value={draft.instagramHandle}
                onValueChange={set('instagramHandle')}
                hint={t.contact.instagramHandleHint}
                error={errors.instagramHandle}
                autoCapitalize="none"
                spellCheck={false}
                optional
                ltr
              />
              <TextField
                label={t.contact.instagramUrl}
                value={draft.instagramUrl}
                onValueChange={set('instagramUrl')}
                error={errors.instagramUrl}
                type="url"
                placeholder="https://www.instagram.com/…"
                optional
                ltr
              />
              <TextField
                label={t.contact.email}
                value={draft.email}
                onValueChange={set('email')}
                error={errors.email}
                type="email"
                autoComplete="email"
                optional
                ltr
              />
              <TextField
                label={t.contact.mapUrl}
                value={draft.mapUrl}
                onValueChange={set('mapUrl')}
                hint={t.contact.mapHint}
                error={errors.mapUrl}
                type="url"
                placeholder="https://maps.app.goo.gl/…"
                optional
                ltr
              />
            </div>
          </Panel>
        </div>

        <aside aria-labelledby="contact-preview-title" className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-card bg-blush/60 p-4 ring-1 ring-line sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="contact-preview-title" className="text-lg">
                {t.contact.preview}
              </h2>
              <div className="flex rounded-xl bg-white p-1 ring-1 ring-line" role="group" aria-label={t.contact.preview}>
                {(['ar', 'en'] as const).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    aria-pressed={previewLocale === locale}
                    onClick={() => setPreviewLocale(locale)}
                    className={cx(
                      'rounded-lg px-3 py-1 text-xs font-semibold',
                      previewLocale === locale ? 'bg-magenta text-white' : 'text-plum hover:bg-blush',
                    )}
                  >
                    {locale === 'ar' ? t.contact.previewArabic : t.contact.previewEnglish}
                  </button>
                ))}
              </div>
            </div>
            <div lang={previewLocale} dir={localeDir(previewLocale)} className="rounded-2xl bg-cream p-4">
              <p className="mb-4 font-display text-2xl text-plum">{previewDict.contact.title}</p>
              <ContactList
                locale={previewLocale}
                details={toContactDetails(draft, siteConfig)}
                labels={previewDict.contact}
                newTabHint={previewDict.common.opensInNewTab}
              />
            </div>
          </div>
        </aside>
      </div>
    </FormShell>
  );
}
