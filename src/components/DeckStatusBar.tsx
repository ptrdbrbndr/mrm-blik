'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateDeckStatus, deleteDeck } from '@/lib/actions/deck'
import type { DeckStatus } from '@/types/database'

interface DeckStatusBarProps {
  deckId: string
  status: DeckStatus
  shareToken: string
  cardCount: number
}

export default function DeckStatusBar({ deckId, status, shareToken, cardCount }: DeckStatusBarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/swipe/${shareToken}`
    : `/swipe/${shareToken}`

  async function handlePublish() {
    if (cardCount === 0) return
    setLoading(true)
    await updateDeckStatus(deckId, 'active')
    router.refresh()
    setLoading(false)
  }

  async function handleClose() {
    setLoading(true)
    await updateDeckStatus(deckId, 'closed')
    router.refresh()
    setLoading(false)
  }

  async function handleReopen() {
    setLoading(true)
    await updateDeckStatus(deckId, 'active')
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Weet je zeker dat je dit deck wilt verwijderen? Dit kan niet ongedaan worden.')) return
    await deleteDeck(deckId)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusConfig: Record<DeckStatus, { label: string; color: string }> = {
    draft: { label: 'Concept', color: 'bg-primary/10 text-primary/60' },
    active: { label: 'Actief', color: 'bg-success/10 text-success' },
    closed: { label: 'Gesloten', color: 'bg-danger/10 text-danger' },
  }

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="deck-status-bar">
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[status].color}`}
        data-testid="deck-status-badge"
      >
        {statusConfig[status].label}
      </span>

      <span className="text-xs text-primary/40" data-testid="card-count">
        {cardCount} kaart{cardCount !== 1 ? 'en' : ''}
      </span>

      <div className="ml-auto flex gap-2">
        {status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={loading || cardCount === 0}
            className="rounded-lg bg-success px-4 py-1.5 text-xs font-semibold text-white hover:bg-success/90 transition-colors disabled:opacity-40"
            data-testid="publish-deck-button"
            title={cardCount === 0 ? 'Voeg eerst kaarten toe' : undefined}
          >
            Publiceren
          </button>
        )}

        {status === 'active' && (
          <>
            <button
              onClick={handleCopyLink}
              className="rounded-lg border border-accent/30 px-4 py-1.5 text-xs font-semibold text-accent hover:bg-accent/5 transition-colors"
              data-testid="copy-link-button"
            >
              {copied ? 'Gekopieerd!' : 'Kopieer swipe-link'}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-danger/30 px-4 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5 transition-colors"
              data-testid="close-deck-button"
            >
              Sluiten
            </button>
          </>
        )}

        {status === 'closed' && (
          <>
            <button
              onClick={handleReopen}
              disabled={loading}
              className="rounded-lg border border-success/30 px-4 py-1.5 text-xs font-semibold text-success hover:bg-success/5 transition-colors"
              data-testid="reopen-deck-button"
            >
              Heropenen
            </button>
            <a
              href={`/deck/${deckId}/results`}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-light transition-colors"
              data-testid="view-results-button"
            >
              Resultaten bekijken
            </a>
          </>
        )}

        <button
          onClick={handleDelete}
          className="rounded-lg p-1.5 text-primary/20 hover:text-danger transition-colors"
          data-testid="delete-deck-button"
          title="Deck verwijderen"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
