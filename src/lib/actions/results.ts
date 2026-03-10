'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { CardWithScore } from '@/types/database'

export async function getDeckResults(deckId: string) {
  const supabase = await createServerSupabase()

  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single()

  if (!deck) return null

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('position', { ascending: true })

  const { data: swipes } = await supabase
    .from('swipes')
    .select('*')
    .eq('deck_id', deckId)

  if (!cards || !swipes) return { deck, cards: [], participants: 0 }

  // Count unique participants
  const participants = new Set(
    swipes.map((s) => s.user_id || s.session_id)
  ).size

  // Calculate scores per card
  const cardScores: CardWithScore[] = cards.map((card) => {
    const cardSwipes = swipes.filter((s) => s.card_id === card.id)
    const right_count = cardSwipes.filter((s) => s.direction === 'right').length
    const left_count = cardSwipes.filter((s) => s.direction === 'left').length
    const up_count = cardSwipes.filter((s) => s.direction === 'up').length

    // Score: right=1, up=2, left=0
    const totalPoints = right_count * 1 + up_count * 2
    const maxPoints = cardSwipes.length * 2 // max if everyone voted up
    const score = maxPoints > 0 ? totalPoints / maxPoints : 0

    return {
      ...card,
      score,
      swipe_count: cardSwipes.length,
      right_count,
      left_count,
      up_count,
    }
  })

  // Sort by score descending
  cardScores.sort((a, b) => b.score - a.score)

  return { deck, cards: cardScores, participants }
}

export async function getExistingSummary(deckId: string) {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('deck_summaries')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}
