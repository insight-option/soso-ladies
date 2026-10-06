'use client';

import { Icon, serviceIconNames, type IconName } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';

const labels: Record<(typeof serviceIconNames)[number], string> = {
  sparkles: 'لمعة',
  brow: 'حاجب وعين',
  scissors: 'مقص',
  nail: 'طلاء أظافر',
  flower: 'زهرة',
  hand: 'يد',
  droplet: 'قطرة',
  drops: 'قطرات',
  sun: 'إشراقة',
  heart: 'قلب',
  gem: 'جوهرة',
  lotus: 'لوتس',
  palette: 'ألوان',
  brush: 'فرشاة',
  wind: 'نسمة هواء',
  star: 'نجمة',
  home: 'منزل',
  chair: 'كرسي صالون',
};

/** Native radio group (arrow keys work) rendered as icon tiles. */
export function IconPicker({ label, value, onChange }: { label: string; value: IconName; onChange: (icon: IconName) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-plum">{label}</legend>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
        {serviceIconNames.map((name) => (
          <label
            key={name}
            title={labels[name]}
            className={cx(
              'grid aspect-square cursor-pointer place-items-center rounded-xl ring-1 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-magenta',
              value === name ? 'bg-magenta text-white ring-magenta' : 'bg-white text-plum ring-line hover:bg-blush',
            )}
          >
            <input
              type="radio"
              name="service-icon"
              value={name}
              checked={value === name}
              onChange={() => onChange(name)}
              className="sr-only"
            />
            <Icon name={name} className="size-5" />
            <span className="sr-only">{labels[name]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
