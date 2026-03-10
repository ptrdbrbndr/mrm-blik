'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1
          className="font-heading text-3xl font-bold text-center text-primary"
          data-testid="login-title"
        >
          Inloggen
        </h1>
        <p className="mt-2 text-center text-primary/60 text-sm">
          Log in om je decks te beheren
        </p>

        {sent ? (
          <div
            className="mt-8 rounded-xl bg-success/10 border border-success/30 p-6 text-center"
            data-testid="magic-link-sent"
          >
            <p className="font-medium text-success">Check je e-mail!</p>
            <p className="mt-2 text-sm text-primary/60">
              We hebben een inloglink gestuurd naar <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary/80">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                required
                className="mt-1 block w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                data-testid="email-input"
              />
            </div>

            {error && (
              <p className="text-sm text-danger" data-testid="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-50"
              data-testid="magic-link-button"
            >
              {loading ? 'Verzenden...' : 'Stuur magic link'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-cream px-4 text-primary/40">of</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full rounded-lg border-2 border-primary/15 py-3 text-sm font-semibold text-primary hover:border-primary/30 transition-colors"
              data-testid="google-login-button"
            >
              Doorgaan met Google
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
