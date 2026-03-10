import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Deck } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: decks } = await supabase
    .from('decks')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    draft: 'bg-primary/10 text-primary/60',
    active: 'bg-success/10 text-success',
    closed: 'bg-danger/10 text-danger',
  }

  const statusLabels: Record<string, string> = {
    draft: 'Concept',
    active: 'Actief',
    closed: 'Gesloten',
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1
          className="font-heading text-3xl font-bold text-primary"
          data-testid="dashboard-title"
        >
          Mijn decks
        </h1>
        <Link
          href="/deck/new"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
          data-testid="new-deck-button"
        >
          + Nieuw deck
        </Link>
      </div>

      {!decks || decks.length === 0 ? (
        <div
          className="mt-12 text-center rounded-2xl border-2 border-dashed border-primary/15 py-16"
          data-testid="empty-state"
        >
          <p className="text-primary/50 text-lg">Je hebt nog geen decks.</p>
          <Link
            href="/deck/new"
            className="mt-4 inline-block text-accent font-semibold hover:underline"
            data-testid="empty-new-deck-link"
          >
            Maak je eerste deck aan
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4" data-testid="deck-list">
          {(decks as Deck[]).map((deck) => (
            <Link
              key={deck.id}
              href={`/deck/${deck.id}`}
              className="group rounded-xl border border-primary/10 bg-white p-6 hover:border-primary/25 transition-colors"
              data-testid={`deck-card-${deck.id}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold group-hover:text-accent transition-colors">
                    {deck.title}
                  </h2>
                  {deck.description && (
                    <p className="mt-1 text-sm text-primary/50 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[deck.status]}`}
                >
                  {statusLabels[deck.status]}
                </span>
              </div>
              <p className="mt-3 text-xs text-primary/30">
                {new Date(deck.created_at).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
