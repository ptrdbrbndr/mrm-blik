import { getProfileById } from '@/lib/actions/profile'
import BackButton from './BackButton'
import ReportButton from '@/components/ReportButton'

const intentionLabels: Record<string, { label: string; emoji: string }> = {
  plezier: { label: 'Alleen voor plezier', emoji: '✨' },
  casual: { label: 'Casual daten', emoji: '💫' },
  relatie: { label: 'Vaste relatie', emoji: '💞' },
  vriendschap: { label: 'Vriendschap', emoji: '🤝' },
}

export default async function AndermansProfielPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getProfileById(id)

  if (!profile) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-heading text-xl font-bold text-primary mb-2">Profiel niet gevonden</p>
          <p className="text-sm text-primary/50">Dit profiel bestaat niet of is niet meer beschikbaar.</p>
          <BackButton />
        </div>
      </main>
    )
  }

  const currentYear = new Date().getFullYear()
  const leeftijd = profile.birth_year ? currentYear - profile.birth_year : null
  const intention = profile.intention ? intentionLabels[profile.intention] : null

  return (
    <main className="min-h-screen bg-cream px-4 py-8" data-testid="profiel-ander-page">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Avatar + naam */}
        <div className="flex flex-col items-center mb-8">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? 'Avatar'}
              data-testid="profiel-ander-avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md mb-4"
            />
          ) : (
            <div
              data-testid="profiel-ander-avatar-placeholder"
              className="w-28 h-28 rounded-full bg-accent/10 border-4 border-white shadow-md flex items-center justify-center mb-4"
            >
              <svg className="w-14 h-14 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          )}

          <h2
            data-testid="profiel-ander-naam"
            className="font-heading text-xl font-bold text-primary"
          >
            {profile.display_name ?? '—'}
          </h2>

          <div className="flex items-center gap-2 mt-1 text-sm text-primary/60">
            {leeftijd && (
              <span data-testid="profiel-ander-leeftijd">{leeftijd} jaar</span>
            )}
            {leeftijd && profile.location && <span>·</span>}
            {profile.location && (
              <span data-testid="profiel-ander-locatie">{profile.location}</span>
            )}
          </div>
        </div>

        {/* Info kaarten */}
        <div className="space-y-4">

          {profile.gender && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-1">Geslacht</p>
              <p data-testid="profiel-ander-geslacht" className="text-sm font-medium text-primary capitalize">
                {profile.gender}
              </p>
            </div>
          )}

          {intention && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-1">Bedoeling</p>
              <p data-testid="profiel-ander-bedoeling" className="text-sm font-medium text-primary">
                {intention.emoji} {intention.label}
              </p>
            </div>
          )}

          {profile.hobbies && profile.hobbies.length > 0 && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-3">Hobby&apos;s & interesses</p>
              <div className="flex flex-wrap gap-2" data-testid="profiel-ander-hobbies">
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

          {profile.looking_for && (
            <div className="rounded-2xl bg-white border border-primary/10 px-5 py-4">
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-1">Wat ik zoek</p>
              <p data-testid="profiel-ander-looking-for" className="text-sm text-primary/80 leading-relaxed">
                {profile.looking_for}
              </p>
            </div>
          )}

        </div>

        <ReportButton profileId={profile.id} />

      </div>
    </main>
  )
}
