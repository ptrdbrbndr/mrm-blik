'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { SwipeDirection } from '@/types/database'

export async function submitSwipe(data: {
  cardId: string
  deckId: string
  direction: SwipeDirection
  sessionId: string
}) {
  const supabase = await createServerSupabase()

  // Try to get current user (optional — swipe page is public)
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('swipes').insert({
    card_id: data.cardId,
    deck_id: data.deckId,
    direction: data.direction,
    user_id: user?.id || null,
    session_id: user ? null : data.sessionId,
  })

  if (error) {
    // Duplicate swipe — silently ignore
    if (error.code === '23505') return
    throw new Error(error.message)
  }
}

export async function getDeckByToken(token: string) {
  const supabase = await createServerSupabase()

  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('share_token', token)
    .eq('status', 'active')
    .single()

  if (!deck) return null

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deck.id)
    .order('position', { ascending: true })

  return { deck, cards: cards || [] }
}
