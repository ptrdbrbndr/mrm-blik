import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import DeckDetailClient from './DeckDetailClient'

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (!deck) redirect('/dashboard')

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', id)
    .order('position', { ascending: true })

  const { data: swipes } = await supabase
    .from('swipes')
    .select('id')
    .eq('deck_id', id)

  const swipeCount = swipes?.length || 0

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/dashboard"
        className="text-xs text-primary/40 hover:text-primary/60 transition-colors"
        data-testid="back-to-dashboard"
      >
        &larr; Terug naar dashboard
      </Link>

      <DeckDetailClient
        deck={deck}
        initialCards={cards || []}
        swipeCount={swipeCount}
      />
    </main>
  )
}
