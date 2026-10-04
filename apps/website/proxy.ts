import {
  HOME_LOCALE_COOKIE_KEY,
  type HomeLocale,
  isHomeLocale,
} from '@vidro/react/locale'
import { type NextRequest, NextResponse } from 'next/server'

function preferredLocale(request: NextRequest): HomeLocale {
  const saved = request.cookies.get(HOME_LOCALE_COOKIE_KEY)?.value ?? null
  if (isHomeLocale(saved)) return saved

  const preferences = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((entry) => {
      const [tag = '', quality] = entry.trim().split(';q=')
      return { tag: tag.toLowerCase(), weight: quality ? Number(quality) : 1 }
    })
    .filter(({ weight }) => Number.isFinite(weight) && weight > 0 && weight <= 1)
    .sort((a, b) => b.weight - a.weight)

  for (const { tag } of preferences) {
    if (tag === 'pt' || tag.startsWith('pt-')) return 'pt-BR'
    if (tag === 'zh' || tag.startsWith('zh-')) return 'zh'
    if (tag === 'ja' || tag.startsWith('ja-')) return 'ja'
    if (tag === 'en' || tag.startsWith('en-')) return 'en'
  }

  return 'en'
}

export function proxy(request: NextRequest) {
  const locale = request.nextUrl.pathname.split('/')[1] ?? null
  if (isHomeLocale(locale)) {
    const response = NextResponse.next()
    if (request.cookies.get(HOME_LOCALE_COOKIE_KEY)?.value !== locale) {
      response.cookies.set(HOME_LOCALE_COOKIE_KEY, locale, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
        secure: request.nextUrl.protocol === 'https:',
      })
    }
    return response
  }

  const destination = request.nextUrl.clone()
  destination.pathname = `/${preferredLocale(request)}/`
  const response = NextResponse.redirect(destination)
  response.headers.set('Vary', 'Accept-Language, Cookie')
  return response
}

export const config = {
  matcher: ['/', '/en/:path*', '/pt-BR/:path*', '/zh/:path*', '/ja/:path*'],
}
