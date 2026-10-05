'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useFeedback } from './feedback';
import { removeMedia } from './media-client';
import { t } from './strings';

type ListRow = {
  id: string;
  sortOrder?: number | null;
  published?: boolean | null;
  imagePath?: string | null;
};

type Patch = { sortOrder?: number; published?: boolean };

/** Publish toggle, reorder and delete with optimistic updates, shared by services and offers. */
export function useListActions<Row extends ListRow>({
  items,
  setItems,
  update,
  remove,
}: {
  items: Row[];
  setItems: Dispatch<SetStateAction<Row[]>>;
  update: (id: string, patch: Patch) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
}) {
  const { toast, confirm } = useFeedback();

  async function togglePublished(row: Row, published: boolean) {
    setItems((list) => list.map((item) => (item.id === row.id ? { ...item, published } : item)));
    try {
      await update(row.id, { published });
      toast('success', t.saved);
    } catch {
      setItems((list) => list.map((item) => (item.id === row.id ? { ...item, published: row.published } : item)));
      toast('error', t.saveFailed);
    }
  }

  async function reorder(next: Row[]) {
    const previous = items;
    setItems(next.map((item, index) => ({ ...item, sortOrder: index })));
    try {
      await Promise.all(
        next.map((item, index) => (item.sortOrder === index ? null : update(item.id, { sortOrder: index }))),
      );
      toast('success', t.orderSaved);
    } catch {
      setItems(previous);
      toast('error', t.orderFailed);
    }
  }

  async function deleteRow(row: Row, copy: { title: string; message: string }) {
    const ok = await confirm({ title: copy.title, message: copy.message, confirmLabel: t.delete, tone: 'danger' });
    if (!ok) return;
    try {
      await remove(row.id);
      await removeMedia(row.imagePath);
      setItems((list) => list.filter((item) => item.id !== row.id));
      toast('success', t.deleted);
    } catch {
      toast('error', t.deleteFailed);
    }
  }

  return { togglePublished, reorder, deleteRow };
}
