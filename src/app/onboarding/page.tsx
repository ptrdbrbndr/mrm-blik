'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Intention = 'plezier' | 'casual' | 'relatie' | 'vriendschap'
type Gender = 'man' | 'vrouw' | 'non-binair' | 'anders'

const intentions: { value: Intention; label: string; emoji: string; desc: string }[] = [
  { value: 'vriendschap', label: 'Vriendschap', emoji: '🤝', desc: 'Nieuwe mensen leren kennen en vriendschappen opbouwen.' },
  { value: 'plezier', label: 'Alleen voor plezier', emoji: '✨', desc: 'Gezellig contact en leuke momenten, zonder verplichtingen.' },
  { value: 'casual', label: 'Casual daten', emoji: '💫', desc: 'Vrijblijvend daten en kijken wat er groeit.' },
  { value: 'relatie', label: 'Vaste relatie', emoji: '💞', desc: 'Op zoek naar een duurzame, liefdevolle verbinding.' },
]

const genders: { value: Gender; label: string }[] = [
  { value: 'man', label: 'Man' },
  { value: 'vrouw', label: 'Vrouw' },
  { value: 'non-binair', label: 'Non-binair' },
  { value: 'anders', label: 'Anders' },
]

const hobbyOptions = [
  'Wandelen', 'Yoga', 'Meditatie', 'Muziek', 'Lezen', 'Koken', 'Reizen',
  'Sport', 'Film', 'Kunst', 'Fotografie', 'Dans', 'Natuur', 'Spiritualiteit',
  'Persoonlijke groei', 'Vrijwilligerswerk',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [intention, setIntention] = useState<Intention | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [location, setLocation] = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])
  const [lookingFor, setLookingFor] = useState('')

  function toggleHobby(hobby: string) {
    setHobbies(prev =>
      prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
    )
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      intention,
      display_name: displayName,
      birth_year: birthYear ? parseInt(birthYear) : null,
      gender,
      location,
      hobbies,
      looking_for: lookingFor,
      onboarding_done: true,
    })

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Voortgang */}
        <div className="flex gap-2 mb-8" data-testid="onboarding-progress">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-accent' : 'bg-primary/10'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div data-testid="onboarding-step-1">
            <h1 className="font-heading text-2xl font-bold text-primary mb-2">
              Wat is jouw bedoeling?
            </h1>
            <p className="text-primary/60 text-sm mb-8">
              Wees eerlijk — er is geen goed of fout antwoord.
            </p>

            <div className="space-y-3">
              {intentions.map(({ value, label, emoji, desc }) => (
                <button
                  key={value}
                  data-testid={`intention-${value}`}
                  onClick={() => setIntention(value)}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                    intention === value
                      ? 'border-accent bg-accent/5'
                      : 'border-primary/10 hover:border-primary/25'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-semibold text-primary text-sm">{label}</p>
                      <p className="text-primary/50 text-xs mt-0.5">{desc}</p>
                    </div>
                    {intention === value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              data-testid="onboarding-next"
              onClick={() => setStep(2)}
              disabled={!intention}
              className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-40"
            >
              Volgende →
            </button>
          </div>
        )}

        {step === 2 && (
          <div data-testid="onboarding-step-2">
            <h1 className="font-heading text-2xl font-bold text-primary mb-2">
              Vertel iets over jezelf
            </h1>
            <p className="text-primary/60 text-sm mb-8">
              Zo kunnen we je de beste matches tonen.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-primary/80 mb-1.5">
                  Hoe wil je heten?
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Jouw voornaam"
                  data-testid="input-display-name"
                  className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary/80 mb-1.5">
                    Geboortejaar
                  </label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={e => setBirthYear(e.target.value)}
                    placeholder="1990"
                    min="1940"
                    max="2006"
                    data-testid="input-birth-year"
                    className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary/80 mb-1.5">
                    Woonplaats
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Amsterdam"
                    data-testid="input-location"
                    className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/80 mb-2">
                  Geslacht
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genders.map(({ value, label }) => (
                    <button
                      key={value}
                      data-testid={`gender-${value}`}
                      onClick={() => setGender(value)}
                      className={`rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
                        gender === value
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-primary/10 text-primary/70 hover:border-primary/25'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/80 mb-2">
                  Hobby&apos;s & interesses
                  <span className="text-primary/40 font-normal ml-1">({hobbies.length} gekozen)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {hobbyOptions.map(hobby => (
                    <button
                      key={hobby}
                      data-testid={`hobby-${hobby.toLowerCase()}`}
                      onClick={() => toggleHobby(hobby)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        hobbies.includes(hobby)
                          ? 'bg-accent text-white'
                          : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
                      }`}
                    >
                      {hobby}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/80 mb-1.5">
                  Wat zoek je in een ander?
                </label>
                <textarea
                  value={lookingFor}
                  onChange={e => setLookingFor(e.target.value)}
                  placeholder="Beschrijf in je eigen woorden wat je zoekt..."
                  rows={3}
                  data-testid="input-looking-for"
                  className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-danger" data-testid="onboarding-error">{error}</p>
            )}

            <div className="flex gap-3 mt-8">
              <button
                data-testid="onboarding-back"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border-2 border-primary/15 py-3.5 text-sm font-semibold text-primary hover:border-primary/30 transition-colors"
              >
                ← Terug
              </button>
              <button
                data-testid="onboarding-save"
                onClick={handleSave}
                disabled={saving || !displayName || !gender}
                className="flex-[2] rounded-xl bg-accent py-3.5 text-sm font-semibold text-white hover:bg-accent-light transition-colors disabled:opacity-40"
              >
                {saving ? 'Opslaan...' : 'Klaar! →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
