'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Intention, Gender } from '@/types/database'

const intentions: { value: Intention; label: string; emoji: string }[] = [
  { value: 'vriendschap', label: 'Vriendschap', emoji: '🤝' },
  { value: 'plezier', label: 'Alleen voor plezier', emoji: '✨' },
  { value: 'casual', label: 'Casual daten', emoji: '💫' },
  { value: 'relatie', label: 'Vaste relatie', emoji: '💞' },
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

export default function ProfielBewerkenPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [location, setLocation] = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])
  const [lookingFor, setLookingFor] = useState('')
  const [intention, setIntention] = useState<Intention | null>(null)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError || !data) {
        setError('Profiel laden mislukt.')
        setLoading(false)
        return
      }

      setDisplayName(data.display_name ?? '')
      setBirthYear(data.birth_year ? String(data.birth_year) : '')
      setGender(data.gender ?? null)
      setLocation(data.location ?? '')
      setHobbies(data.hobbies ?? [])
      setLookingFor(data.looking_for ?? '')
      setIntention(data.intention ?? null)
      setAvatarUrl(data.avatar_url ?? null)
      setLoading(false)
    }

    loadProfile()
  }, [router])

  function toggleHobby(hobby: string) {
    setHobbies(prev =>
      prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    setError(null)

    const supabase = createClient()

    // Upload avatar indien geselecteerd
    let newAvatarUrl = avatarUrl
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (uploadError) {
        setError(`Foto uploaden mislukt: ${uploadError.message}`)
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      newAvatarUrl = publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        birth_year: birthYear ? parseInt(birthYear) : null,
        gender,
        location,
        hobbies,
        looking_for: lookingFor,
        intention,
        avatar_url: newAvatarUrl,
      })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/profiel')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </main>
    )
  }

  const displayAvatar = avatarPreview ?? avatarUrl

  return (
    <main className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <button
            data-testid="edit-profiel-terug"
            onClick={() => router.push('/profiel')}
            className="text-primary/50 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="font-heading text-2xl font-bold text-primary">Profiel bewerken</h1>
        </div>

        <form
          data-testid="edit-profiel-form"
          onSubmit={e => { e.preventDefault(); handleSave() }}
          className="space-y-6"
        >

          {/* Avatar upload */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              data-testid="edit-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-accent/10 border-4 border-white shadow-md flex items-center justify-center">
                  <svg className="w-12 h-12 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
            </button>
            <p className="text-xs text-primary/40 mt-2">Tik om foto te wijzigen</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              data-testid="edit-avatar-input"
              className="hidden"
            />
          </div>

          {/* Naam */}
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-1.5">
              Hoe wil je heten?
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Jouw voornaam"
              data-testid="edit-display-name"
              className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Geboortejaar + Locatie */}
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
                data-testid="edit-birth-year"
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
                data-testid="edit-location"
                className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Geslacht */}
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Geslacht
            </label>
            <div className="grid grid-cols-2 gap-2">
              {genders.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  data-testid={`edit-gender-${value}`}
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

          {/* Bedoeling */}
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Bedoeling
            </label>
            <div className="space-y-2">
              {intentions.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  data-testid={`edit-intention-${value}`}
                  onClick={() => setIntention(value)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition-all ${
                    intention === value
                      ? 'border-accent bg-accent/5'
                      : 'border-primary/10 hover:border-primary/25'
                  }`}
                >
                  <span className="mr-2">{emoji}</span>
                  <span className={`font-medium ${intention === value ? 'text-accent' : 'text-primary'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hobby's */}
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Hobby&apos;s & interesses
              <span className="text-primary/40 font-normal ml-1">({hobbies.length} gekozen)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {hobbyOptions.map(hobby => (
                <button
                  key={hobby}
                  type="button"
                  data-testid={`edit-hobby-${hobby.toLowerCase()}`}
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

          {/* Wat zoek je */}
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-1.5">
              Wat zoek je in een ander?
            </label>
            <textarea
              value={lookingFor}
              onChange={e => setLookingFor(e.target.value)}
              placeholder="Beschrijf in je eigen woorden wat je zoekt..."
              rows={3}
              data-testid="edit-looking-for"
              className="w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" data-testid="edit-profiel-error">{error}</p>
          )}

          <button
            type="submit"
            data-testid="save-profiel"
            disabled={saving || !displayName || !gender}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-white hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
          </button>

        </form>
      </div>
    </main>
  )
}
