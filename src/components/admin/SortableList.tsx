'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { t } from './strings';

function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Reorderable list: drag the handle (mouse or touch) or focus it and use the
 * arrow keys. `onReorder` receives the new order once the move is finished.
 */
export function SortableList<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  disabled,
}: {
  items: T[];
  getKey: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, handle: ReactNode) => ReactNode;
  disabled?: boolean;
}) {
  const [dragOrder, setDragOrder] = useState<T[] | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const list = dragOrder ?? items;

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, key: string) {
    if (disabled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveKey(key);
    setDragOrder(items);
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!activeKey || !dragOrder) return;
    const from = dragOrder.findIndex((item) => getKey(item) === activeKey);
    for (const [index, item] of dragOrder.entries()) {
      const key = getKey(item);
      if (key === activeKey) continue;
      const rect = rowRefs.current.get(key)?.getBoundingClientRect();
      if (!rect) continue;
      const middle = rect.top + rect.height / 2;
      const crossed = index > from ? event.clientY > middle : event.clientY < middle;
      if (event.clientY >= rect.top && event.clientY <= rect.bottom && crossed) {
        setDragOrder(move(dragOrder, from, index));
        break;
      }
    }
  }

  function onPointerUp() {
    if (!activeKey || !dragOrder) return;
    const changed = dragOrder.some((item, index) => getKey(item) !== getKey(items[index]));
    setActiveKey(null);
    setDragOrder(null);
    if (changed) onReorder(dragOrder);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (disabled) return;
    const target = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : -1;
    if (target < 0 || target >= items.length) return;
    event.preventDefault();
    const handle = event.currentTarget;
    onReorder(move(items, index, target));
    // Keep focus on the moved item's handle after re-render.
    requestAnimationFrame(() => handle.focus());
  }

  return (
    <ul className="space-y-3">
      {list.map((item, index) => {
        const key = getKey(item);
        const handle = (
          <button
            type="button"
            aria-label={`${t.dragHandle} (${index + 1}/${list.length})`}
            disabled={disabled}
            onPointerDown={(event) => onPointerDown(event, key)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={(event) => onKeyDown(event, index)}
            className="grid h-11 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted hover:bg-blush hover:text-magenta active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
          >
            <Icon name="grip" className="size-5" />
          </button>
        );
        return (
          <li
            key={key}
            ref={(node) => {
              if (node) rowRefs.current.set(key, node);
              else rowRefs.current.delete(key);
            }}
            className={cx(
              'rounded-2xl transition-shadow',
              activeKey === key && 'relative z-10 shadow-lift ring-2 ring-magenta/40',
            )}
          >
            {renderItem(item, handle)}
          </li>
        );
      })}
    </ul>
  );
}
