import { notFound } from 'next/navigation';
import { isLocale, type Locale } from './config';
import { getDictionary, type Dictionary } from './dictionaries';

export type LangParams = Promise<{ lang: string }>;

/** Resolves the [lang] segment, rendering the 404 page for unknown values. */
export async function resolveLocale(params: LangParams): Promise<{ locale: Locale; dict: Dictionary }> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { locale: lang, dict: getDictionary(lang) };
}
