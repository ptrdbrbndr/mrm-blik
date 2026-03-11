'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { Profile, DiscoverDirection, Match } from '@/types/database'

export async function getProfilesToDiscover(): Promise<Profile[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Haal eigen profiel op voor voorkeursinstellingen
  const { data: me } = await supabase
    .from('profiles')
    .select('gender_preference, age_min, age_max, hobbies, intention, birth_year')
    .eq('id', user.id)
    .single()

  // IDs die al geswipet zijn
  const { data: alreadySwiped } = await supabase
    .from('discover_swipes')
    .select('target_id')
    .eq('swiper_id', user.id)

  const excludeIds = [user.id, ...(alreadySwiped?.map(s => s.target_id) ?? [])]

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('onboarding_done', true)
    .not('id', 'in', `(${excludeIds.map(id => `"${id}"`).join(',')})`)

  // Geslachtsvoorkeur filter
  if (me?.gender_preference && me.gender_preference.length > 0) {
    query = query.in('gender', me.gender_preference)
  }

  const { data: candidates } = await query.limit(50)
  if (!candidates || candidates.length === 0) return []

  const currentYear = new Date().getFullYear()
  const myHobbies: string[] = me?.hobbies ?? []
  const myIntention = me?.intention

  // Scoren + sorteren
  const scored = candidates
    .filter(p => {
      if (!p.birth_year) return true
      const age = currentYear - p.birth_year
      const minAge = me?.age_min ?? 18
      const maxAge = me?.age_max ?? 99
      return age >= minAge && age <= maxAge
    })
    .map(p => {
      const sharedHobbies = p.hobbies?.filter((h: string) => myHobbies.includes(h)).length ?? 0
      const intentionBonus = p.intention === myIntention ? 2 : 0
      return { profile: p, score: sharedHobbies + intentionBonus }
    })
    .sort((a, b) => b.score - a.score)

  return scored.map(s => s.profile)
}

export async function recordSwipe(
  targetId: string,
  direction: DiscoverDirection
): Promise<{ match: Match | null; error: string | null }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { match: null, error: 'Niet ingelogd' }

  const { error } = await supabase.from('discover_swipes').insert({
    swiper_id: user.id,
    target_id: targetId,
    direction,
  })

  if (error) return { match: null, error: error.message }

  if (direction === 'pass') return { match: null, error: null }

  // Check of er een match is aangemaakt door de trigger
  const uid_a = user.id < targetId ? user.id : targetId
  const uid_b = user.id < targetId ? targetId : user.id

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('user_a', uid_a)
    .eq('user_b', uid_b)
    .single()

  return { match: match ?? null, error: null }
}
