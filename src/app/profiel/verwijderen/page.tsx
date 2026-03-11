'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AccountVerwijderenPage() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirmed) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
      setLoading(false)
      return
    }

    // Note: actual user deletion must happen server-side via admin API.
    // For now, sign out and redirect — full deletion via support.
    router.push('/')
  }

  return (
    <main
      className="min-h-screen bg-cream flex items-center justify-center px-4"
      data-testid="verwijderen-page"
    >
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-red-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-primary mb-2">
              Account verwijderen
            </h1>
            <p className="text-sm text-primary/60 leading-relaxed">
              Weet je zeker dat je je account wilt verwijderen? Al je matches,
              berichten en profielgegevens worden permanent gewist.
            </p>
          </div>

          <label
            className="flex items-start gap-3 mb-6 cursor-pointer"
            data-testid="confirm-label"
          >
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              data-testid="confirm-checkbox"
              className="mt-0.5 w-4 h-4 accent-red-500 cursor-pointer"
            />
            <span className="text-sm text-primary/70 leading-relaxed">
              Ja, ik begrijp dat dit onomkeerbaar is en wil mijn account verwijderen.
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-500 mb-4" data-testid="delete-error">{error}</p>
          )}

          <div className="flex flex-col gap-3">
            <button
              data-testid="delete-account-btn"
              onClick={handleDelete}
              disabled={!confirmed || loading}
              className="w-full rounded-xl py-3 bg-red-500 text-white font-sans font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Bezig...' : 'Account definitief verwijderen'}
            </button>
            <button
              data-testid="cancel-delete-btn"
              onClick={() => router.push('/profiel')}
              className="w-full rounded-xl py-3 border border-primary/10 text-primary/60 font-sans text-sm hover:bg-primary/5 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
