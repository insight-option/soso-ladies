import type { Locale } from './config';
import { ar } from './ar';
import { en, type Dictionary } from './en';

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export type { Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Fills `{key}` placeholders: format('Our {name} Services', { name: 'Facial' }). */
export function format(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
