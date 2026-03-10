'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { CardCategory, CardEffort } from '@/types/database'

export async function addCard(deckId: string, data: {
  title: string
  description?: string | null
  category?: CardCategory | null
  effort?: CardEffort | null
}) {
  const supabase = await createServerSupabase()

  // Get next position
  const { data: lastCard } = await supabase
    .from('cards')
    .select('position')
    .eq('deck_id', deckId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = lastCard ? lastCard.position + 1 : 0

  const { data: card, error } = await supabase
    .from('cards')
    .insert({
      deck_id: deckId,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      effort: data.effort || null,
      position,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return card
}

export async function updateCard(cardId: string, data: {
  title?: string
  description?: string | null
  category?: CardCategory | null
  effort?: CardEffort | null
}) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('cards')
    .update(data)
    .eq('id', cardId)

  if (error) throw new Error(error.message)
}

export async function deleteCard(cardId: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)

  if (error) throw new Error(error.message)
}

export async function reorderCards(deckId: string, cardIds: string[]) {
  const supabase = await createServerSupabase()

  // Update positions in batch
  const updates = cardIds.map((id, index) =>
    supabase
      .from('cards')
      .update({ position: index })
      .eq('id', id)
      .eq('deck_id', deckId)
  )

  await Promise.all(updates)
}

export async function importCardsFromCSV(deckId: string, csvText: string) {
  const lines = csvText.trim().split('\n')
  if (lines.length === 0) return []

  // Detect header
  const firstLine = lines[0].toLowerCase()
  const hasHeader = firstLine.includes('title') || firstLine.includes('titel')
  const dataLines = hasHeader ? lines.slice(1) : lines

  const supabase = await createServerSupabase()

  // Get current max position
  const { data: lastCard } = await supabase
    .from('cards')
    .select('position')
    .eq('deck_id', deckId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  let position = lastCard ? lastCard.position + 1 : 0

  const cards = dataLines
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split(',').map((s) => s.trim().replace(/^"|"$/g, ''))
      return {
        deck_id: deckId,
        title: parts[0] || 'Untitled',
        description: parts[1] || null,
        category: (['epic', 'feature', 'bug', 'tech-debt'].includes(parts[2]) ? parts[2] : null) as CardCategory | null,
        effort: (['S', 'M', 'L', 'XL'].includes(parts[3]?.toUpperCase()) ? parts[3].toUpperCase() : null) as CardEffort | null,
        position: position++,
      }
    })

  const { data, error } = await supabase
    .from('cards')
    .insert(cards)
    .select()

  if (error) throw new Error(error.message)
  return data
}
