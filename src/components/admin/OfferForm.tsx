'use client';

import { useRef, useState } from 'react';
import { isIconName } from '@/components/ui/Icon';
import { useFeedback } from './feedback';
import { Panel, SelectField, TextAreaField, TextField, Toggle } from './fields';
import { FormShell } from './FormShell';
import { cleanupReplacedImage, commitImage, ImageField, type ImageValue } from './ImageField';
import { removeMedia } from './media-client';
import { must, useStore, useUnsavedChanges, type OfferRow } from './store';
import { t } from './strings';

type Draft = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  badgeAr: string;
  badgeEn: string;
  priceNow: string;
  priceWas: string;
  serviceSlug: string;
  image: ImageValue;
  published: boolean;
};

type Errors = Partial<Record<keyof Draft, string>>;

function toDraft(row: OfferRow | null): Draft {
  return {
    titleAr: row?.titleAr ?? '',
    titleEn: row?.titleEn ?? '',
    descriptionAr: row?.descriptionAr ?? '',
    descriptionEn: row?.descriptionEn ?? '',
    badgeAr: row?.badgeAr ?? '',
    badgeEn: row?.badgeEn ?? '',
    priceNow: row?.priceNow != null ? String(row.priceNow) : '',
    priceWas: row?.priceWas != null ? String(row.priceWas) : '',
    serviceSlug: row?.serviceSlug ?? '',
    image: { path: row?.imagePath ?? null, pending: null },
    published: row?.published !== false,
  };
}

function sameDraft(a: Draft, b: Draft): boolean {
  const { image: imageA, ...restA } = a;
  const { image: imageB, ...restB } = b;
  return (
    JSON.stringify(restA) === JSON.stringify(restB) && imageA.path === imageB.path && !imageA.pending === !imageB.pending
  );
}

/** Accepts Western and Arabic-Indic digits; empty means "no price". */
function parsePrice(value: string): number | null | 'invalid' {
  const normalized = value
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[,٬\s]/g, '')
    .replace('٫', '.');
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? number : 'invalid';
}

export function OfferForm({ initial, onDone }: { initial: OfferRow | null; onDone: () => void }) {
  const { client, offers, services, setOffers } = useStore();
  const { toast } = useFeedback();
  const [initialDraft] = useState(() => toDraft(initial));
  const [draft, setDraft] = useState(initialDraft);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const dirty = !sameDraft(draft, initialDraft);
  useUnsavedChanges(dirty && !saving);

  function validate(value: Draft): Errors {
    const errors: Errors = {};
    if (!value.titleAr.trim()) errors.titleAr = t.required;
    if (!value.titleEn.trim()) errors.titleEn = t.required;
    const now = parsePrice(value.priceNow);
    const was = parsePrice(value.priceWas);
    if (now === 'invalid') errors.priceNow = t.offers.priceInvalid;
    if (was === 'invalid') errors.priceWas = t.offers.priceInvalid;
    if (typeof was === 'number' && now === null) errors.priceNow = t.offers.priceNowRequired;
    if (typeof was === 'number' && typeof now === 'number' && was <= now) errors.priceWas = t.offers.priceWasLower;
    return errors;
  }

  const errors = submitted ? validate(draft) : {};
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const linkedService = services.find((service) => service.slug === draft.serviceSlug);

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
      const imagePath = await commitImage(draft.image, 'offers', draft.titleEn);
      if (draft.image.pending) uploadedPath = imagePath;
      const now = parsePrice(draft.priceNow);
      const was = parsePrice(draft.priceWas);
      const fields = {
        titleAr: draft.titleAr.trim(),
        titleEn: draft.titleEn.trim(),
        descriptionAr: draft.descriptionAr.trim() || null,
        descriptionEn: draft.descriptionEn.trim() || null,
        badgeAr: draft.badgeAr.trim() || null,
        badgeEn: draft.badgeEn.trim() || null,
        priceNow: typeof now === 'number' ? now : null,
        priceWas: typeof was === 'number' ? was : null,
        serviceSlug: draft.serviceSlug || null,
        imagePath,
        published: draft.published,
      };
      const saved = initial
        ? must(await client.models.Offer.update({ id: initial.id, ...fields }))
        : must(await client.models.Offer.create({ ...fields, sortOrder: offers.length }));
      await cleanupReplacedImage(initial?.imagePath, imagePath);
      setOffers((list) => (initial ? list.map((item) => (item.id === saved.id ? saved : item)) : [...list, saved]));
      toast('success', t.saved);
      onDone();
    } catch (error) {
      console.error('[admin] offer save failed', error);
      await removeMedia(uploadedPath);
      toast('error', t.saveFailed);
      setSaving(false);
    }
  }

  return (
    <FormShell
      title={initial ? t.offers.editTitle(initial.titleAr) : t.offers.newTitle}
      dirty={dirty}
      saving={saving}
      onSubmit={() => void save()}
      onBack={onDone}
    >
      <div ref={formRef} className="space-y-5">
        <Panel>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t.offers.titleAr}
              value={draft.titleAr}
              onValueChange={(v) => set('titleAr', v)}
              error={errors.titleAr}
              required
            />
            <TextField
              label={t.offers.titleEn}
              value={draft.titleEn}
              onValueChange={(v) => set('titleEn', v)}
              error={errors.titleEn}
              ltr
              required
            />
            <TextAreaField
              label={t.offers.descriptionAr}
              value={draft.descriptionAr}
              onValueChange={(v) => set('descriptionAr', v)}
              optional
            />
            <TextAreaField
              label={t.offers.descriptionEn}
              value={draft.descriptionEn}
              onValueChange={(v) => set('descriptionEn', v)}
              optional
              ltr
            />
            <TextField
              label={t.offers.badgeAr}
              value={draft.badgeAr}
              onValueChange={(v) => set('badgeAr', v)}
              hint={t.offers.badgeHint}
              optional
            />
            <TextField
              label={t.offers.badgeEn}
              value={draft.badgeEn}
              onValueChange={(v) => set('badgeEn', v)}
              optional
              ltr
            />
            <div className="sm:col-span-2">
              <Toggle checked={draft.published} onChange={(v) => set('published', v)} label={t.publishToggle} />
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t.offers.priceNow}
              value={draft.priceNow}
              onValueChange={(v) => set('priceNow', v)}
              hint={t.offers.priceHint}
              error={errors.priceNow}
              inputMode="decimal"
              optional
              ltr
            />
            <TextField
              label={t.offers.priceWas}
              value={draft.priceWas}
              onValueChange={(v) => set('priceWas', v)}
              error={errors.priceWas}
              inputMode="decimal"
              optional
              ltr
            />
            <div className="sm:col-span-2">
              <SelectField
                label={t.offers.service}
                value={draft.serviceSlug}
                onValueChange={(v) => set('serviceSlug', v)}
                optional
                options={[
                  { value: '', label: t.offers.noService },
                  ...services.map((service) => ({ value: service.slug, label: service.nameAr })),
                ]}
              />
            </div>
          </div>
        </Panel>

        <Panel>
          <ImageField
            label={t.offers.image}
            hint={t.offers.imageHint}
            value={draft.image}
            onChange={(v) => set('image', v)}
            aspect="4/3"
            placeholderIcon={linkedService && isIconName(linkedService.icon) ? linkedService.icon : 'tag'}
          />
        </Panel>
      </div>
    </FormShell>
  );
}
