import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { getProfilesToDiscover } from '@/lib/actions/discover'
import DiscoverClient from './DiscoverClient'

export default async function DiscoverPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profiles = await getProfilesToDiscover()

  if (profiles.length === 0) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        data-testid="discover-empty"
      >
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-6">🌸</p>
          <h2 className="font-heading text-2xl font-bold text-primary mb-3">
            Geen nieuwe profielen
          </h2>
          <p className="text-primary/60 text-sm leading-relaxed">
            Je hebt alle beschikbare profielen al gezien. Kom later terug —
            er melden zich regelmatig nieuwe mensen aan.
          </p>
        </div>
      </main>
    )
  }

  return <DiscoverClient profiles={profiles} />
}
