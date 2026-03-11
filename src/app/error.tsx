'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-sm" data-testid="error-boundary">
        <h2 className="font-heading text-2xl font-bold text-primary">
          Er ging iets mis
        </h2>
        <p className="mt-2 text-sm text-primary/50">
          {error.message || 'Er is een onverwachte fout opgetreden.'}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
          data-testid="error-retry-button"
        >
          Probeer opnieuw
        </button>
      </div>
    </main>
  )
}
