'use client';

import { useRef, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Icon, isIconName, type IconName } from '@/components/ui/Icon';
import { useFeedback } from './feedback';
import { Panel, TextAreaField, TextField, Toggle } from './fields';
import { FormShell } from './FormShell';
import { IconPicker } from './IconPicker';
import { cleanupReplacedImage, commitImage, ImageField, type ImageValue } from './ImageField';
import { removeMedia } from './media-client';
import { must, useStore, useUnsavedChanges, type ServiceRow } from './store';
import { t } from './strings';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

type Draft = {
  nameAr: string;
  nameEn: string;
  slug: string;
  summaryAr: string;
  summaryEn: string;
  introAr: string;
  introEn: string;
  icon: IconName;
  image: ImageValue;
  published: boolean;
  /** Unchecked is saved as false ("off"); null in the database means "not set yet". */
  availableAtSalon: boolean;
  availableAtHome: boolean;
};

type Errors = Partial<Record<keyof Draft, string>>;

function toDraft(row: ServiceRow | null): Draft {
  return {
    nameAr: row?.nameAr ?? '',
    nameEn: row?.nameEn ?? '',
    slug: row?.slug ?? '',
    summaryAr: row?.summaryAr ?? '',
    summaryEn: row?.summaryEn ?? '',
    introAr: row?.introAr ?? '',
    introEn: row?.introEn ?? '',
    icon: isIconName(row?.icon) ? row.icon : 'sparkles',
    image: { path: row?.imagePath ?? null, pending: null },
    published: row?.published !== false,
    availableAtSalon: row?.availableAtSalon === true,
    availableAtHome: row?.availableAtHome === true,
  };
}

function sameDraft(a: Draft, b: Draft): boolean {
  const { image: imageA, ...restA } = a;
  const { image: imageB, ...restB } = b;
  return (
    JSON.stringify(restA) === JSON.stringify(restB) && imageA.path === imageB.path && !imageA.pending === !imageB.pending
  );
}

export function ServiceForm({ initial, onDone }: { initial: ServiceRow | null; onDone: () => void }) {
  const { client, services, setServices } = useStore();
  const { toast } = useFeedback();
  const [initialDraft] = useState(() => toDraft(initial));
  const [draft, setDraft] = useState(initialDraft);
  const [slugEdited, setSlugEdited] = useState(initial !== null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const dirty = !sameDraft(draft, initialDraft);
  // Never saved with availability yet (new, imported or older records).
  const availabilityNotSet =
    (initial?.availableAtSalon ?? null) === null && (initial?.availableAtHome ?? null) === null;
  useUnsavedChanges(dirty && !saving);

  function validate(value: Draft): Errors {
    const errors: Errors = {};
    if (!value.nameAr.trim()) errors.nameAr = t.required;
    if (!value.nameEn.trim()) errors.nameEn = t.required;
    if (!value.summaryAr.trim()) errors.summaryAr = t.required;
    if (!value.summaryEn.trim()) errors.summaryEn = t.required;
    if (!value.slug) errors.slug = t.required;
    else if (!SLUG_PATTERN.test(value.slug)) errors.slug = t.services.slugInvalid;
    else if (services.some((s) => s.slug === value.slug && s.id !== initial?.id)) errors.slug = t.services.slugTaken;
    return errors;
  }

  const errors = submitted ? validate(draft) : {};

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === 'nameEn' && !slugEdited) next.slug = slugify(value as string);
      return next;
    });
  }

  async function save() {
    setSubmitted(true);
    if (Object.keys(validate(draft)).length > 0) {
      toast('error', t.fixErrors);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      const imagePath = await commitImage(draft.image, 'services', draft.slug);
      if (draft.image.pending) uploadedPath = imagePath;
      const fields = {
        slug: draft.slug,
        nameAr: draft.nameAr.trim(),
        nameEn: draft.nameEn.trim(),
        summaryAr: draft.summaryAr.trim(),
        summaryEn: draft.summaryEn.trim(),
        introAr: draft.introAr.trim() || null,
        introEn: draft.introEn.trim() || null,
        icon: draft.icon,
        imagePath,
        published: draft.published,
        availableAtSalon: draft.availableAtSalon,
        availableAtHome: draft.availableAtHome,
      };
      const saved = initial
        ? must(await client.models.Service.update({ id: initial.id, ...fields }))
        : must(await client.models.Service.create({ ...fields, sortOrder: services.length }));
      await cleanupReplacedImage(initial?.imagePath, imagePath);
      setServices((list) =>
        initial ? list.map((item) => (item.id === saved.id ? saved : item)) : [...list, saved],
      );
      toast('success', t.saved);
      onDone();
    } catch (error) {
      console.error('[admin] service save failed', error);
      await removeMedia(uploadedPath);
      toast('error', t.saveFailed);
      setSaving(false);
    }
  }

  return (
    <FormShell
      title={initial ? t.services.editTitle(initial.nameAr) : t.services.newTitle}
      dirty={dirty}
      saving={saving}
      onSubmit={() => void save()}
      onBack={onDone}
      extraActions={
        initial ? (
          <a
            href={`/ar/services/${initial.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
          >
            <Icon name="external" className="size-4" />
            {t.services.preview}
          </a>
        ) : null
      }
    >
      <div ref={formRef} className="space-y-5">
        <Panel>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t.services.nameAr}
              value={draft.nameAr}
              onValueChange={(v) => set('nameAr', v)}
              error={errors.nameAr}
              required
            />
            <TextField
              label={t.services.nameEn}
              value={draft.nameEn}
              onValueChange={(v) => set('nameEn', v)}
              error={errors.nameEn}
              ltr
              required
            />
            <div className="sm:col-span-2">
              <TextField
                label={t.services.slug}
                value={draft.slug}
                onValueChange={(v) => {
                  setSlugEdited(true);
                  set('slug', v.toLowerCase().replace(/\s+/g, '-'));
                }}
                hint={
                  <>
                    {t.services.slugHint}.{' '}
                    {initial && draft.slug !== initial.slug ? (
                      t.services.slugChangeWarning
                    ) : (
                      <>
                        {t.services.slugAddress} <bdi dir="ltr">/services/{draft.slug || '…'}</bdi>
                      </>
                    )}
                  </>
                }
                error={errors.slug}
                ltr
                required
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
            <div className="sm:col-span-2">
              <Toggle checked={draft.published} onChange={(v) => set('published', v)} label={t.publishToggle} />
            </div>
          </div>
        </Panel>

        <Panel title={t.services.whereTitle} description={t.services.whereHint}>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
            <Toggle
              checked={draft.availableAtSalon}
              onChange={(v) => set('availableAtSalon', v)}
              label={t.services.atSalon}
            />
            <Toggle
              checked={draft.availableAtHome}
              onChange={(v) => set('availableAtHome', v)}
              label={t.services.atHome}
            />
          </div>
          {availabilityNotSet ? (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-cream px-3 py-2 text-xs text-muted">
              <Icon name="info" className="mt-px size-4 shrink-0 text-magenta" />
              {t.services.notSetYet}
            </p>
          ) : null}
        </Panel>

        <Panel>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextAreaField
              label={t.services.summaryAr}
              value={draft.summaryAr}
              onValueChange={(v) => set('summaryAr', v)}
              hint={t.services.summaryHint}
              error={errors.summaryAr}
              rows={2}
            />
            <TextAreaField
              label={t.services.summaryEn}
              value={draft.summaryEn}
              onValueChange={(v) => set('summaryEn', v)}
              hint={t.services.summaryHint}
              error={errors.summaryEn}
              rows={2}
              ltr
            />
            <TextAreaField
              label={t.services.introAr}
              value={draft.introAr}
              onValueChange={(v) => set('introAr', v)}
              hint={t.services.introHint}
              optional
              rows={4}
            />
            <TextAreaField
              label={t.services.introEn}
              value={draft.introEn}
              onValueChange={(v) => set('introEn', v)}
              hint={t.services.introHint}
              optional
              rows={4}
              ltr
            />
          </div>
        </Panel>

        <Panel>
          <div className="space-y-6">
            <IconPicker label={t.services.icon} value={draft.icon} onChange={(v) => set('icon', v)} />
            <ImageField
              label={t.services.image}
              hint={t.services.imageHint}
              value={draft.image}
              onChange={(v) => set('image', v)}
              aspect="4/5"
              placeholderIcon={draft.icon}
            />
          </div>
        </Panel>
      </div>
    </FormShell>
  );
}
