'use client'

import { useState } from 'react'
import type { Card, CardCategory, CardEffort } from '@/types/database'
import { addCard, deleteCard, updateCard } from '@/lib/actions/card'

const CATEGORIES: { value: CardCategory; label: string }[] = [
  { value: 'epic', label: 'Epic' },
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'tech-debt', label: 'Tech Debt' },
]

const EFFORTS: CardEffort[] = ['S', 'M', 'L', 'XL']

interface CardEditorProps {
  deckId: string
  cards: Card[]
  onCardsChange: (cards: Card[]) => void
}

export default function CardEditor({ deckId, cards, onCardsChange }: CardEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<CardCategory | ''>('')
  const [effort, setEffort] = useState<CardEffort | ''>('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!title.trim()) return
    setAdding(true)
    try {
      const card = await addCard(deckId, {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        effort: effort || null,
      })
      onCardsChange([...cards, card])
      setTitle('')
      setDescription('')
      setCategory('')
      setEffort('')
    } catch (err) {
      console.error('Failed to add card:', err)
    }
    setAdding(false)
  }

  async function handleDelete(cardId: string) {
    try {
      await deleteCard(cardId)
      onCardsChange(cards.filter((c) => c.id !== cardId))
    } catch (err) {
      console.error('Failed to delete card:', err)
    }
  }

  async function handleUpdate(cardId: string, data: Partial<Card>) {
    try {
      await updateCard(cardId, data)
      onCardsChange(cards.map((c) => (c.id === cardId ? { ...c, ...data } : c)))
      setEditingId(null)
    } catch (err) {
      console.error('Failed to update card:', err)
    }
  }

  return (
    <div>
      {/* Card list */}
      <div className="space-y-3" data-testid="card-list">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="group flex items-start gap-3 rounded-xl border border-primary/10 bg-white p-4 hover:border-primary/20 transition-colors"
            data-testid={`card-item-${index}`}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/5 text-xs font-medium text-primary/40">
              {index + 1}
            </span>

            {editingId === card.id ? (
              <EditCardInline
                card={card}
                onSave={(data) => handleUpdate(card.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{card.title}</p>
                  {card.category && (
                    <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                      {card.category}
                    </span>
                  )}
                  {card.effort && (
                    <span className="shrink-0 rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary/50">
                      {card.effort}
                    </span>
                  )}
                </div>
                {card.description && (
                  <p className="mt-1 text-xs text-primary/50 line-clamp-2">{card.description}</p>
                )}
              </div>
            )}

            {editingId !== card.id && (
              <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingId(card.id)}
                  className="rounded-lg p-1.5 text-primary/30 hover:bg-primary/5 hover:text-primary/60"
                  data-testid={`edit-card-${index}`}
                  title="Bewerken"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="rounded-lg p-1.5 text-primary/30 hover:bg-danger/5 hover:text-danger"
                  data-testid={`delete-card-${index}`}
                  title="Verwijderen"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add card form */}
      <div
        className="mt-6 rounded-xl border-2 border-dashed border-primary/15 bg-white/50 p-5"
        data-testid="add-card-form"
      >
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kaarttitel..."
            className="block w-full rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            data-testid="new-card-title"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschrijving (optioneel)..."
            rows={2}
            className="block w-full rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            data-testid="new-card-description"
          />
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CardCategory | '')}
              className="rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm text-primary/70 focus:border-accent focus:outline-none"
              data-testid="new-card-category"
            >
              <option value="">Categorie</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={effort}
              onChange={(e) => setEffort(e.target.value as CardEffort | '')}
              className="rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm text-primary/70 focus:border-accent focus:outline-none"
              data-testid="new-card-effort"
            >
              <option value="">Effort</option>
              {EFFORTS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!title.trim() || adding}
              className="ml-auto rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-40"
              data-testid="add-card-button"
            >
              {adding ? 'Toevoegen...' : '+ Toevoegen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditCardInline({
  card,
  onSave,
  onCancel,
}: {
  card: Card
  onSave: (data: Partial<Card>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')

  return (
    <div className="flex-1 space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block w-full rounded-lg border border-accent/30 bg-white px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        data-testid="edit-card-title"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="block w-full rounded-lg border border-accent/30 bg-white px-3 py-1.5 text-sm resize-none focus:border-accent focus:outline-none"
        data-testid="edit-card-description"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ title, description: description || null })}
          className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-white"
          data-testid="save-card-edit"
        >
          Opslaan
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-1 text-xs text-primary/50 hover:text-primary"
          data-testid="cancel-card-edit"
        >
          Annuleren
        </button>
      </div>
    </div>
  )
}
