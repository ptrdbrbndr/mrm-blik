'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { CardWithScore } from '@/types/database'

export async function generateSummary(deckId: string, deckTitle: string, cards: CardWithScore[], participants: number) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY niet geconfigureerd')

  // Rate limit: check existing summaries today
  const supabase = await createServerSupabase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: existing } = await supabase
    .from('deck_summaries')
    .select('id')
    .eq('deck_id', deckId)
    .gte('created_at', today.toISOString())

  if (existing && existing.length >= 3) {
    throw new Error('Maximum 3 samenvattingen per dag bereikt')
  }

  // Build prompt
  const cardList = cards
    .map((c, i) => {
      const pct = Math.round(c.score * 100)
      return `${i + 1}. "${c.title}" — Score: ${pct}% | Ja: ${c.right_count} | Must-have: ${c.up_count} | Nee: ${c.left_count}${c.category ? ` | ${c.category}` : ''}${c.effort ? ` | Effort: ${c.effort}` : ''}`
    })
    .join('\n')

  const prompt = `Je bent een product-strateeg. Analyseer de swipe-resultaten van het deck "${deckTitle}" (${participants} deelnemers, ${cards.length} items).

Resultaten (gesorteerd op score):
${cardList}

Geef een beknopt advies in het Nederlands:
1. **Top 5 prioriteiten** — items met hoogste draagvlak
2. **Quick wins** — hoge score + lage effort
3. **Controversieel** — items waar de meningen sterk verdeeld zijn (veel ja + veel nee)
4. **Aanbevolen roadmap** — stel een logische volgorde voor op basis van impact en effort
5. **Opvallend** — patronen of inzichten die opvallen

Gebruik markdown formatting.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API fout: ${err}`)
  }

  const result = await response.json()
  const markdown = result.content[0]?.text || 'Geen samenvatting beschikbaar.'

  // Extract priorities (lines starting with numbered items after "Top 5")
  const priorities = cards.slice(0, 5).map((c) => c.title)

  // Find controversial items (high total swipes but mixed)
  const conflicts = cards
    .filter((c) => {
      const total = c.right_count + c.left_count + c.up_count
      if (total < 2) return false
      const yesRatio = (c.right_count + c.up_count) / total
      return yesRatio > 0.3 && yesRatio < 0.7
    })
    .map((c) => c.title)

  const content = { markdown, priorities, conflicts }

  // Save to database
  const { data: summary, error } = await supabase
    .from('deck_summaries')
    .insert({
      deck_id: deckId,
      content,
      model: 'claude-sonnet-4-6',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return summary
}
