'use client'

import { useState } from 'react'
import type { Card, Deck } from '@/types/database'
import CardEditor from '@/components/CardEditor'
import CSVImport from '@/components/CSVImport'
import DeckStatusBar from '@/components/DeckStatusBar'

interface DeckDetailClientProps {
  deck: Deck
  initialCards: Card[]
  swipeCount: number
}

export default function DeckDetailClient({ deck, initialCards, swipeCount }: DeckDetailClientProps) {
  const [cards, setCards] = useState<Card[]>(initialCards)

  return (
    <div className="mt-4">
      <h1 className="font-heading text-2xl font-bold text-primary" data-testid="deck-detail-title">
        {deck.title}
      </h1>
      {deck.description && (
        <p className="mt-1 text-sm text-primary/50">{deck.description}</p>
      )}

      <div className="mt-6">
        <DeckStatusBar
          deckId={deck.id}
          status={deck.status as 'draft' | 'active' | 'closed'}
          shareToken={deck.share_token}
          cardCount={cards.length}
        />
      </div>

      {swipeCount > 0 && (
        <div className="mt-4 rounded-lg bg-accent/5 border border-accent/20 px-4 py-3" data-testid="swipe-count-info">
          <p className="text-sm text-accent font-medium">
            {swipeCount} swipe{swipeCount !== 1 ? 's' : ''} ontvangen
          </p>
          <a
            href={`/deck/${deck.id}/results`}
            className="text-xs text-accent/70 hover:text-accent underline"
          >
            Bekijk resultaten
          </a>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-primary">Kaarten</h2>

        <div className="mt-4">
          <CardEditor
            deckId={deck.id}
            cards={cards}
            onCardsChange={setCards}
          />
        </div>

        <div className="mt-6">
          <CSVImport
            deckId={deck.id}
            onImport={(newCards) => setCards([...cards, ...newCards])}
          />
        </div>
      </div>
    </div>
  )
}
