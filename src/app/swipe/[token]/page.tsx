import { getDeckByToken } from '@/lib/actions/swipe'
import SwipePageClient from './SwipePageClient'

export default async function SwipePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const result = await getDeckByToken(token)

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center" data-testid="deck-not-found">
          <h1 className="font-heading text-2xl font-bold text-primary">Deck niet gevonden</h1>
          <p className="mt-2 text-primary/50 text-sm">
            Dit deck bestaat niet of is niet meer actief.
          </p>
        </div>
      </main>
    )
  }

  if (result.cards.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center" data-testid="deck-empty">
          <h1 className="font-heading text-2xl font-bold text-primary">{result.deck.title}</h1>
          <p className="mt-2 text-primary/50 text-sm">
            Dit deck heeft nog geen kaarten.
          </p>
        </div>
      </main>
    )
  }

  return <SwipePageClient deck={result.deck} cards={result.cards} />
}
