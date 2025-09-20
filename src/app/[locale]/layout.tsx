import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from "@/components/ui/toaster"

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params
  
  // Validate that the incoming `locale` parameter is valid
  if (locale !== 'en' && locale !== 'es' && locale !== 'fr' && locale !== 'de' && 
      locale !== 'it' && locale !== 'pt' && locale !== 'zh' && locale !== 'ja' && 
      locale !== 'ko' && locale !== 'ru' && locale !== 'hi' && locale !== 'ar') {
    notFound()
  }

  // Providing all messages to the client
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}