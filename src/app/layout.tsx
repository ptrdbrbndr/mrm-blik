import type { Metadata } from 'next'
import { Source_Serif_4, DM_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Miracle Relationship Matcher — Vind je miracle match',
    template: '%s | Miracle Relationship Matcher',
  },
  description: 'De eerste dating app die matcht op zielsniveau. Gebaseerd op het VREDE-model van 365 Dagen Succesvol. Geen oppervlakkig swipen, maar diepe verbinding.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Miracle Relationship Matcher',
    description: 'Vind je miracle match vanuit innerlijke vrede. De eerste dating app die matcht op zielsniveau.',
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Miracle Relationship Matcher',
  },
  twitter: {
    card: 'summary',
    title: 'Miracle Relationship Matcher',
    description: 'Vind je miracle match vanuit innerlijke vrede.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={`${sourceSerif.variable} ${dmSans.variable}`}>
      <head>
        <meta name="theme-color" content="#7A2E4A" />
      </head>
      <body className="min-h-screen font-sans antialiased pb-20">
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
