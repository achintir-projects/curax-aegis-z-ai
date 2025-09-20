'use client'

import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'

interface LocaleProviderProps {
  children: React.ReactNode
  locale: string
  messages: Record<string, any>
}

export default function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  // Validate that the incoming `locale` parameter is valid
  if (locale !== 'en' && locale !== 'es' && locale !== 'fr' && locale !== 'de' && 
      locale !== 'it' && locale !== 'pt' && locale !== 'zh' && locale !== 'ja' && 
      locale !== 'ko' && locale !== 'ru' && locale !== 'hi' && locale !== 'ar') {
    notFound()
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}