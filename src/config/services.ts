import type { IconName } from '@/components/ui/Icon';
import type { Localized } from '@/i18n/config';

export type ServiceHighlight = {
  icon: IconName;
  label: Localized;
};

export type ServiceItem = {
  name: Localized;
  summary?: Localized;
};

/** Where the service is offered (only once confirmed by the salon). */
export type ServiceAvailability = {
  salon: boolean;
  home: boolean;
};

export type ServiceDefinition = {
  /** URL segment: /services/<slug>. Lowercase letters, digits and dashes. */
  slug: string;
  icon: IconName;
  /** Path under /public, or null to show the blush placeholder. */
  image: string | null;
  name: Localized;
  summary: Localized;
  intro: Localized;
  highlights: ServiceHighlight[];
  /** Confirmed treatments only. Leave out until confirmed: the list is hidden. */
  items?: ServiceItem[];
  /** Confirmed salon/home availability only. Leave out until confirmed: the block is hidden. */
  availability?: ServiceAvailability;
};

/**
 * The built-in services. Adding one object here adds its card, detail page,
 * sitemap entry and footer link. When the admin database has services, they
 * take over (matched by slug) and these highlights/items/availability are kept.
 * Only confirmed details are listed: the Facial treatments come from the approved
 * reference; other treatment lists and availability are added once confirmed.
 */
export const services: ServiceDefinition[] = [
  {
    slug: 'facial',
    icon: 'sparkles',
    image: '/images/services/facial.webp',
    name: { en: 'Facial', ar: 'العناية بالبشرة' },
    summary: {
      en: 'Professional facial treatments for fresh, glowing and healthy skin.',
      ar: 'جلسات احترافية للعناية بالوجه لبشرة نضرة ومشرقة وصحية.',
    },
    intro: {
      en: 'Refresh, hydrate and restore your natural glow with professional facial treatments.',
      ar: 'انتعاش وترطيب يعيدان إلى بشرتك إشراقتها الطبيعية مع جلسات احترافية للعناية بالوجه.',
    },
    highlights: [
      { icon: 'droplet', label: { en: 'Deep cleansing', ar: 'تنظيف عميق' } },
      { icon: 'drops', label: { en: 'Skin hydration', ar: 'ترطيب البشرة' } },
      { icon: 'hand', label: { en: 'Relaxing facial massage', ar: 'مساج مريح للوجه' } },
      { icon: 'sun', label: { en: 'Bright & healthy skin', ar: 'بشرة مشرقة وصحية' } },
    ],
    items: [
      {
        name: { en: 'Classic Facial', ar: 'الفيشل الكلاسيكي' },
        summary: { en: 'Deep cleansing and hydration', ar: 'تنظيف عميق وترطيب' },
      },
      {
        name: { en: 'Gold Facial', ar: 'فيشل الذهب' },
        summary: { en: 'Nourishing and anti-aging', ar: 'تغذية ومقاومة لعلامات التقدّم في السن' },
      },
      {
        name: { en: 'Hydra Facial', ar: 'الهيدرا فيشل' },
        summary: { en: 'Intense hydration for glowing skin', ar: 'ترطيب مكثّف لبشرة مشرقة' },
      },
      {
        name: { en: 'Acne Treatment Facial', ar: 'فيشل علاج حبّ الشباب' },
        summary: { en: 'For clearer and healthier skin', ar: 'لبشرة أنقى وأكثر صحة' },
      },
    ],
  },
  {
    slug: 'permanent-makeup',
    icon: 'brow',
    image: null,
    name: { en: 'Permanent Makeup', ar: 'المكياج الدائم' },
    summary: {
      en: 'Long-lasting beauty with professional techniques.',
      ar: 'جمال يدوم طويلًا بتقنيات احترافية.',
    },
    intro: {
      en: 'Long-lasting beauty that keeps you ready every day, applied with care using professional techniques.',
      ar: 'جمال يدوم طويلًا ويجعلك مستعدة كل يوم، بعناية فائقة وتقنيات احترافية.',
    },
    highlights: [
      { icon: 'clock', label: { en: 'Long-lasting results', ar: 'نتائج تدوم طويلًا' } },
      { icon: 'gem', label: { en: 'Professional techniques', ar: 'تقنيات احترافية' } },
      { icon: 'heart', label: { en: 'Applied with care', ar: 'تطبيق بعناية' } },
    ],
  },
  {
    slug: 'hair',
    icon: 'scissors',
    image: '/images/services/hair.webp',
    name: { en: 'Hair', ar: 'الشعر' },
    summary: {
      en: 'Cut, style, color and more to enhance your beauty.',
      ar: 'قصّ وتصفيف وصبغ وأكثر لإبراز جمالك.',
    },
    intro: {
      en: 'From a fresh cut to styling and color, our team takes care of your hair to enhance your natural beauty.',
      ar: 'من القصّ إلى التصفيف والصبغ، يعتني فريقنا بشعرك ليبرز جمالك الطبيعي.',
    },
    highlights: [],
  },
  {
    slug: 'nails',
    icon: 'nail',
    image: null,
    name: { en: 'Nails', ar: 'الأظافر' },
    summary: {
      en: 'Manicure, pedicure and nail art.',
      ar: 'مانيكير وباديكير وفنّ الأظافر.',
    },
    intro: {
      en: 'Beautiful, well-groomed hands and feet with manicure, pedicure and nail art.',
      ar: 'يدان وقدمان بإطلالة أنيقة ومُعتنى بها مع المانيكير والباديكير وفنّ الأظافر.',
    },
    highlights: [],
  },
  {
    slug: 'henna',
    icon: 'flower',
    image: '/images/services/henna.webp',
    name: { en: 'Henna', ar: 'الحناء' },
    summary: {
      en: 'Traditional and modern henna designs for all occasions.',
      ar: 'نقوش حناء تقليدية وعصرية لجميع المناسبات.',
    },
    intro: {
      en: 'Elegant henna designs, from traditional patterns to modern styles, for every occasion.',
      ar: 'نقوش حناء أنيقة، من الزخارف التقليدية إلى الأنماط العصرية، لكل مناسبة.',
    },
    highlights: [],
  },
];
