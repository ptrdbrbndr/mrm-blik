import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MRM-Blik — Miracle Roadmap Tinder',
  description: 'Swipe je weg naar de perfecte productroadmap. Prioriteer features met je team in 5 minuten.',
  openGraph: {
    title: 'MRM-Blik — Miracle Roadmap Tinder',
    description: 'Swipe je weg naar de perfecte productroadmap.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
