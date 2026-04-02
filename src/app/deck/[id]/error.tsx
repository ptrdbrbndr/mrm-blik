'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DeckError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error('Deck error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-sm" data-testid="deck-error-boundary">
        <h2 className="font-heading text-2xl font-bold text-primary">
          Deck niet beschikbaar
        </h2>
        <p className="mt-2 text-sm text-primary/50">
          Dit deck kon niet worden geladen.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
          data-testid="back-to-dashboard-error"
        >
          Terug naar dashboard
        </Link>
      </div>
    </main>
  )
}
