'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const reasons = [
  'Nep profiel / spam',
  'Ongepaste foto',
  'Grensoverschrijdend gedrag',
  'Minderjarige',
  'Anders',
]

export default function ReportButton({ profileId }: { profileId: string }) {
  const [state, setState] = useState<'idle' | 'open' | 'sending' | 'done' | 'error'>('idle')
  const [reason, setReason] = useState(reasons[0])

  async function handleSubmit() {
    setState('sending')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setState('error'); return }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id: profileId,
      reason,
    })

    setState(error ? 'error' : 'done')
  }

  if (state === 'done') {
    return (
      <p className="text-center text-xs text-primary/40 mt-6" data-testid="report-sent">
        Melding verstuurd. Bedankt voor je melding.
      </p>
    )
  }

  return (
    <div className="mt-6 text-center">
      {state === 'idle' && (
        <button
          data-testid="report-btn"
          onClick={() => setState('open')}
          className="text-xs text-primary/30 hover:text-red-400 transition-colors underline underline-offset-2"
        >
          Profiel rapporteren
        </button>
      )}

      {(state === 'open' || state === 'sending' || state === 'error') && (
        <div
          className="bg-white border border-red-100 rounded-2xl p-5 text-left max-w-sm mx-auto mt-2"
          data-testid="report-form"
        >
          <p className="font-sans font-semibold text-sm text-primary mb-3">
            Waarom wil je dit profiel melden?
          </p>
          <div className="space-y-2 mb-4">
            {reasons.map((r) => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-red-500"
                  data-testid={`report-reason-${r.toLowerCase().replace(/\s/g, '-')}`}
                />
                <span className="text-sm text-primary/70">{r}</span>
              </label>
            ))}
          </div>

          {state === 'error' && (
            <p className="text-xs text-red-500 mb-3" data-testid="report-error">
              Er ging iets mis. Probeer het later opnieuw.
            </p>
          )}

          <div className="flex gap-2">
            <button
              data-testid="report-cancel"
              onClick={() => setState('idle')}
              className="flex-1 rounded-lg border border-primary/10 py-2 text-xs font-medium text-primary/50 hover:bg-primary/5 transition-colors"
            >
              Annuleren
            </button>
            <button
              data-testid="report-submit"
              onClick={handleSubmit}
              disabled={state === 'sending'}
              className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {state === 'sending' ? 'Versturen...' : 'Melden'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
