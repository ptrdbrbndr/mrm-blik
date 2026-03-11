import Link from 'next/link'
import Image from 'next/image'
import { getMatches } from '@/lib/actions/matches'
import type { MatchWithProfile } from '@/types/database'

export const metadata = { title: 'Mijn Matches' }

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Vandaag'
  if (diffDays === 1) return 'Gisteren'
  if (diffDays < 7) return `${diffDays}d geleden`
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

export default async function MatchesPage() {
  const matches: MatchWithProfile[] = await getMatches()

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto" data-testid="matches-page">
      <h1 className="font-heading text-2xl font-bold text-primary mb-6">Mijn Matches</h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-primary font-semibold mb-1">Nog geen matches</p>
          <p className="text-primary/50 text-sm mb-6">Ga swipen en maak je eerste match!</p>
          <Link
            href="/discover"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
            data-testid="discover-link"
          >
            Ga swipen!
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {matches.map((match) => (
            <li key={match.id}>
              <Link
                href={`/chat/${match.id}`}
                className="flex items-center gap-4 rounded-2xl bg-white border border-primary/8 px-4 py-3.5 hover:border-primary/20 transition-all active:scale-[0.99]"
                data-testid={`match-item-${match.id}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-sand">
                    {match.profile.avatar_url ? (
                      <Image
                        src={match.profile.avatar_url}
                        alt={match.profile.display_name ?? 'Avatar'}
                        width={56}
                        height={56}

                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/15">
                        <span className="text-accent font-semibold text-lg">
                          {(match.profile.display_name ?? '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Unread badge */}
                  {match.unread_count != null && match.unread_count > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center px-1"
                      data-testid={`unread-badge-${match.id}`}
                    >
                      {match.unread_count > 99 ? '99+' : match.unread_count}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`font-semibold text-primary text-sm truncate ${match.unread_count ? 'font-bold' : ''}`}>
                      {match.profile.display_name ?? 'Onbekend'}
                    </p>
                    <span className="text-primary/40 text-xs shrink-0">{formatDate(match.created_at)}</span>
                  </div>
                  <p className="text-primary/50 text-xs mt-0.5 truncate">
                    {match.last_message ?? 'Stuur een berichtje!'}
                  </p>
                </div>

                {/* Chevron */}
                <svg className="w-4 h-4 text-primary/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
