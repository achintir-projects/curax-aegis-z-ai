import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru', 'hi', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Redirect to locale prefix when no locale is detected
  localePrefix: 'as-needed'
})