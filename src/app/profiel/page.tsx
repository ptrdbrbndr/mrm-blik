import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMyProfile } from '@/lib/actions/profile'

const intentionLabels: Record<string, { label: string; emoji: string }> = {
  plezier: { label: 'Alleen voor plezier', emoji: '✨' },
  casual: { label: 'Casual daten', emoji: '💫' },
  relatie: { label: 'Vaste relatie', emoji: '💞' },
  vriendschap: { label: 'Vriendschap', emoji: '🤝' },
}

export default async function ProfielPage() {
  const profile = await getMyProfile()

  if (!profile) {
    redirect('/onboarding')
  }

  const currentYear = new Date().getFullYear()
  const leeftijd = profile.birth_year ? currentYear - profile.birth_year : null
  const intention = profile.intention ? intentionLabels[profile.intention] : null

  return (
    <main className="min-h-screen bg-cream px-4 py-8" data-testid="profiel-page">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-2xl font-bold text-primary">Mijn profiel</h1>
          <Link
            href="/profiel/bewerken"
            data-testid="profiel-bewerken-link"
            className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            Bewerken
          </Link>
        </div>

        {/* Avatar + naam */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? 'Avatar'}
                data-testid="profiel-avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div
                data-testid="profiel-avatar-placeholder"
                className="w-28 h-28 rounded-full bg-accent/10 border-4 border-white shadow-md flex items-center justify-center"
              >
                <svg className="w-14 h-14 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            <Link
              href="/profiel/bewerken"
              data-testid="profiel-avatar-upload-btn"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </Link>
          </div>

          <h2
            data-testid="profiel-naam"
            className="font-heading text-xl font-bold text-primary"
          >
            {profile.display_name ?? '—'}
          </h2>

          <div className="flex items-center gap-2 mt-1 text-sm text-primary/60">
            {leeftijd && (
              <span data-testid="profiel-leeftijd">{leeftijd} jaar</span>
            )}
            {leeftijd && profile.location && <span>·</span>}
            {profile.location && (
              <span data-testid="profiel-locatie">{profile.location}</span>
            )}
          </div>
        </div>

        {/* Info kaarten */}
        <div className="space-y-4">

          {/* Geslacht */}
          {profile.gender && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-1">Geslacht</p>
              <p data-testid="profiel-geslacht" className="text-sm font-medium text-primary capitalize">
                {profile.gender}
              </p>
            </div>
          )}

          {/* Bedoeling */}
          {intention && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-1">Bedoeling</p>
              <p data-testid="profiel-bedoeling" className="text-sm font-medium text-primary">
                {intention.emoji} {intention.label}
              </p>
            </div>
          )}

          {/* Hobby's */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-3">Hobby&apos;s & interesses</p>
              <div className="flex flex-wrap gap-2" data-testid="profiel-hobbies">
                {profile.hobbies.map(hobby => (
                  <span
                    key={hobby}
                    className="rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-medium"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Zoekt */}
          {profile.looking_for && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-1">Wat ik zoek</p>
              <p data-testid="profiel-looking-for" className="text-sm text-primary/80 leading-relaxed">
                {profile.looking_for}
              </p>
            </div>
          )}

        </div>

        {/* Account verwijderen */}
        <div className="mt-10 text-center">
          <Link
            href="/profiel/verwijderen"
            data-testid="profiel-verwijder-link"
            className="text-xs text-red-400 hover:text-red-500 transition-colors underline underline-offset-2"
          >
            Account verwijderen
          </Link>
        </div>

      </div>
    </main>
  )
}
