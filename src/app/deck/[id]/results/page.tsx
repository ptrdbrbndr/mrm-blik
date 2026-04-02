import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { getDeckResults, getExistingSummary } from '@/lib/actions/results'
import ResultsClient from './ResultsClient'

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getDeckResults(id)
  if (!result) redirect('/dashboard')

  const existingSummary = await getExistingSummary(id)

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href={`/deck/${id}`}
        className="text-xs text-primary/40 hover:text-primary/60 transition-colors"
        data-testid="back-to-deck"
      >
        &larr; Terug naar deck
      </Link>

      <h1
        className="mt-4 font-heading text-3xl font-bold text-primary"
        data-testid="results-title"
      >
        Resultaten: {result.deck.title}
      </h1>
      <p className="mt-1 text-sm text-primary/50" data-testid="results-meta">
        {result.participants} deelnemer{result.participants !== 1 ? 's' : ''} &middot; {result.cards.length} kaarten
      </p>

      <ResultsClient
        deckId={id}
        deckTitle={result.deck.title}
        cards={result.cards}
        participants={result.participants}
        totalSwipes={result.cards.reduce((sum, c) => sum + c.swipe_count, 0)}
        existingSummary={existingSummary?.content || null}
      />
    </main>
  )
}
