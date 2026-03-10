'use client'

import { useState } from 'react'
import type { Card, Deck } from '@/types/database'
import SwipeInterface from '@/components/SwipeInterface'

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export default function SwipePageClient({ deck, cards }: { deck: Deck; cards: Card[] }) {
  const [started, setStarted] = useState(false)
  const [sessionId] = useState(generateSessionId)

  if (!started) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1
            className="font-heading text-3xl font-bold text-primary"
            data-testid="swipe-deck-title"
          >
            {deck.title}
          </h1>
          {deck.description && (
            <p className="mt-2 text-primary/50 text-sm">{deck.description}</p>
          )}
          <p className="mt-6 text-sm text-primary/60">
            Je krijgt <strong>{cards.length} kaarten</strong> te zien.
            Swipe of gebruik de knoppen:
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-lg bg-danger/5 p-3">
              <span className="text-lg">👈</span>
              <p className="mt-1 font-medium text-danger">Nee</p>
            </div>
            <div className="rounded-lg bg-mustard/5 p-3">
              <span className="text-lg">⭐</span>
              <p className="mt-1 font-medium text-mustard">Must-have</p>
            </div>
            <div className="rounded-lg bg-success/5 p-3">
              <span className="text-lg">👉</span>
              <p className="mt-1 font-medium text-success">Ja</p>
            </div>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="mt-8 w-full rounded-xl bg-accent px-8 py-3 text-base font-semibold text-white hover:bg-accent-light transition-colors"
            data-testid="start-swipe-button"
          >
            Start met swipen
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <h1 className="font-heading text-lg font-semibold text-primary/70 mb-4" data-testid="swipe-header">
        {deck.title}
      </h1>
      <SwipeInterface deck={deck} cards={cards} sessionId={sessionId} />
    </main>
  )
}
