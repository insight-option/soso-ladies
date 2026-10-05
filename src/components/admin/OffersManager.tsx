'use client';

import { useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { ContentRow } from './ContentRow';
import { PageHeading, Panel } from './fields';
import { useListActions } from './list-actions';
import { OfferForm } from './OfferForm';
import { SortableList } from './SortableList';
import { must, useStore, type OfferRow } from './store';
import { t } from './strings';

export function OffersManager() {
  const { client, offers, setOffers, services } = useStore();
  const [editing, setEditing] = useState<OfferRow | 'new' | null>(null);

  const actions = useListActions({
    items: offers,
    setItems: setOffers,
    update: async (id, patch) => must(await client.models.Offer.update({ id, ...patch })),
    remove: async (id) => must(await client.models.Offer.delete({ id })),
  });

  if (editing) {
    return <OfferForm initial={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />;
  }

  const serviceName = (slug: string | null | undefined) => services.find((s) => s.slug === slug)?.nameAr;

  return (
    <>
      <PageHeading
        title={t.offers.title}
        subtitle={t.offers.subtitle}
        actions={
          <button type="button" onClick={() => setEditing('new')} className={buttonClasses({ size: 'sm' })}>
            <Icon name="plus" className="size-4" />
            {t.offers.add}
          </button>
        }
      />

      {offers.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-blush text-magenta">
              <Icon name="tag" className="size-6" />
            </span>
            <p className="mt-4 max-w-md text-muted">{t.offers.empty}</p>
          </div>
        </Panel>
      ) : (
        <SortableList
          items={offers}
          getKey={(offer) => offer.id}
          onReorder={(next) => void actions.reorder(next)}
          renderItem={(offer, handle) => (
            <ContentRow
              handle={handle}
              imagePath={offer.imagePath}
              aspect="4/3"
              placeholderIcon="tag"
              title={offer.titleAr}
              subtitle={[
                offer.badgeAr,
                offer.priceNow != null ? `${offer.priceNow} ر.ق` : null,
                serviceName(offer.serviceSlug),
              ]
                .filter(Boolean)
                .join(' · ')}
              published={offer.published !== false}
              onTogglePublished={(published) => void actions.togglePublished(offer, published)}
              onEdit={() => setEditing(offer)}
              onDelete={() =>
                void actions.deleteRow(offer, {
                  title: t.offers.deleteTitle,
                  message: t.offers.deleteMessage(offer.titleAr),
                })
              }
            />
          )}
        />
      )}
    </>
  );
}
