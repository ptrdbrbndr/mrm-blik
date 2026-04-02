'use client'

import { useState, useRef } from 'react'
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

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

    // Upload foto als geselecteerd
    let avatarUrl: string | null = null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = publicUrl
      }
    }

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
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
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
              {/* Foto uploaden */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  data-testid="onboarding-avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-accent/10 border-4 border-white shadow-md border-dashed border-accent/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                </button>
                <p className="text-xs text-primary/40 mt-2">
                  {avatarPreview ? 'Foto geselecteerd ✓' : 'Voeg een profielfoto toe *'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  data-testid="onboarding-avatar-input"
                  className="hidden"
                />
              </div>

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
                disabled={saving || !displayName || !gender || !avatarFile}
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
