'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Card, Deck, SwipeDirection } from '@/types/database'
import { submitSwipe } from '@/lib/actions/swipe'
import SwipeCard from './SwipeCard'

interface SwipeInterfaceProps {
  deck: Deck
  cards: Card[]
  sessionId: string
}

export default function SwipeInterface({ deck, cards, sessionId }: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState('')

  const currentCard = cards[currentIndex]
  const nextCard = cards[currentIndex + 1]

  const handleSwipe = useCallback(async (direction: SwipeDirection) => {
    if (!currentCard) return

    await submitSwipe({
      cardId: currentCard.id,
      deckId: deck.id,
      direction,
      sessionId,
    })

    if (currentIndex + 1 >= cards.length) {
      setFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentCard, currentIndex, cards.length, deck.id, sessionId])

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (finished) return
      if (e.key === 'ArrowLeft') handleSwipe('left')
      if (e.key === 'ArrowRight') handleSwipe('right')
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleSwipe('up')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSwipe, finished])

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div
            className="text-6xl mb-6"
            data-testid="finish-emoji"
          >
            🎉
          </div>
          <h2 className="font-heading text-2xl font-bold text-primary" data-testid="finish-title">
            Bedankt voor je input!
          </h2>
          <p className="mt-2 text-primary/50">
            Je hebt alle {cards.length} kaarten beoordeeld voor &ldquo;{deck.title}&rdquo;.
          </p>

          <div className="mt-8 max-w-sm mx-auto">
            <label className="block text-sm font-medium text-primary/60 text-left">
              Nog iets toe te voegen? (optioneel)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Mis je een feature? Heb je opmerkingen?"
              className="mt-1 block w-full rounded-lg border border-primary/15 px-4 py-3 text-sm placeholder:text-primary/25 focus:border-accent focus:outline-none resize-none"
              data-testid="finish-feedback"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress bar */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex justify-between text-xs text-primary/40 mb-1">
          <span data-testid="progress-text">{currentIndex + 1} van {cards.length}</span>
          <span>{Math.round(((currentIndex) / cards.length) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-primary/10">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            data-testid="progress-bar"
          />
        </div>
      </div>

      {/* Card stack */}
      <div
        className="relative w-full max-w-sm aspect-[3/4]"
        data-testid="card-stack"
      >
        <AnimatePresence>
          {nextCard && (
            <SwipeCard
              key={nextCard.id}
              card={nextCard}
              onSwipe={() => {}}
              isTop={false}
            />
          )}
          {currentCard && (
            <SwipeCard
              key={currentCard.id}
              card={currentCard}
              onSwipe={handleSwipe}
              isTop={true}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons (mobile alternative) */}
      <div className="mt-6 flex items-center gap-4" data-testid="action-buttons">
        <button
          onClick={() => handleSwipe('left')}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-danger/30 text-danger hover:bg-danger/5 transition-colors"
          data-testid="button-left"
          title="Nee"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={() => handleSwipe('up')}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-mustard/50 text-mustard hover:bg-mustard/5 transition-colors"
          data-testid="button-up"
          title="Must-have"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-success/30 text-success hover:bg-success/5 transition-colors"
          data-testid="button-right"
          title="Ja"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <p className="mt-4 text-xs text-primary/30">
        Of gebruik pijltjestoetsen: &larr; &rarr; &uarr;
      </p>
    </div>
  )
}
