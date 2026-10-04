export const HOME_LOCALES = ['en', 'pt-BR', 'zh', 'ja'] as const

export type HomeLocale = (typeof HOME_LOCALES)[number]

export const HOME_LOCALE_COOKIE_KEY = 'vidro-home-locale'
export const HOME_LOCALE_STORAGE_KEY = HOME_LOCALE_COOKIE_KEY

export const HOME_LOCALE_LABELS: Record<HomeLocale, string> = {
  en: 'EN',
  'pt-BR': 'PT-BR',
  zh: '中文',
  ja: 'あ',
}

export const HOME_LOCALE_LANG: Record<HomeLocale, string> = {
  en: 'en',
  'pt-BR': 'pt-BR',
  zh: 'zh',
  ja: 'ja',
}

export function isHomeLocale(value: string | null): value is HomeLocale {
  return HOME_LOCALES.some((locale) => locale === value)
}
