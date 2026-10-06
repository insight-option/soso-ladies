'use client';

import { useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Icon, isIconName } from '@/components/ui/Icon';
import { ContentRow } from './ContentRow';
import { useFeedback } from './feedback';
import { PageHeading, Panel, Spinner } from './fields';
import { useListActions } from './list-actions';
import { ServiceForm } from './ServiceForm';
import { SortableList } from './SortableList';
import { bySortOrder, must, useStore, type ServiceRow } from './store';
import { t } from './strings';

export function ServicesManager() {
  const { client, services, setServices, seedServices } = useStore();
  const { toast } = useFeedback();
  const [editing, setEditing] = useState<ServiceRow | 'new' | null>(null);
  const [importing, setImporting] = useState(false);

  const actions = useListActions({
    items: services,
    setItems: setServices,
    update: async (id, patch) => must(await client.models.Service.update({ id, ...patch })),
    remove: async (id) => must(await client.models.Service.delete({ id })),
  });

  async function importDefaults() {
    setImporting(true);
    try {
      const existing = new Set(services.map((service) => service.slug));
      const created: ServiceRow[] = [];
      for (const [index, seed] of seedServices.entries()) {
        if (existing.has(seed.slug)) continue;
        created.push(must(await client.models.Service.create({ ...seed, sortOrder: index, published: true })));
      }
      setServices((list) => [...list, ...created].sort(bySortOrder));
      toast('success', t.services.imported(created.length));
    } catch (error) {
      console.error('[admin] import failed', error);
      toast('error', t.services.importFailed);
    } finally {
      setImporting(false);
    }
  }

  if (editing) {
    return <ServiceForm initial={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />;
  }

  const needsImport = services.length === 0;

  return (
    <>
      <PageHeading
        title={t.services.title}
        subtitle={t.services.subtitle}
        actions={
          <button
            type="button"
            onClick={() => setEditing('new')}
            disabled={needsImport}
            className={buttonClasses({ size: 'sm' })}
          >
            <Icon name="plus" className="size-4" />
            {t.services.add}
          </button>
        }
      />

      {needsImport ? (
        <Panel title={t.services.importTitle} description={t.services.importText}>
          <button
            type="button"
            onClick={() => void importDefaults()}
            disabled={importing}
            className={buttonClasses({ size: 'sm' })}
          >
            {importing ? <Spinner className="size-4" /> : <Icon name="restore" className="size-4" />}
            {importing ? t.services.importing : t.services.importButton}
          </button>
          <ul className="mt-5 flex flex-wrap gap-2">
            {seedServices.map((seed) => (
              <li key={seed.slug} className="rounded-full bg-blush px-3 py-1 text-sm text-plum">
                {seed.nameAr}
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <SortableList
          items={services}
          getKey={(service) => service.id}
          onReorder={(next) => void actions.reorder(next)}
          renderItem={(service, handle) => (
            <ContentRow
              handle={handle}
              imagePath={service.imagePath}
              aspect="4/5"
              placeholderIcon={isIconName(service.icon) ? service.icon : 'sparkles'}
              title={service.nameAr}
              subtitle={
                <span dir="ltr">
                  {service.nameEn} · /services/{service.slug}
                </span>
              }
              published={service.published !== false}
              onTogglePublished={(published) => void actions.togglePublished(service, published)}
              onEdit={() => setEditing(service)}
              onDelete={() =>
                void actions.deleteRow(service, {
                  title: t.services.deleteTitle,
                  message: t.services.deleteMessage(service.nameAr),
                })
              }
            />
          )}
        />
      )}
    </>
  );
}
