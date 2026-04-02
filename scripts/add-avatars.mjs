/**
 * Avatar script: voeg realistische profielfoto's toe aan profielen zonder avatar
 * Bron: randomuser.me portraits (realistische foto's, gender-matched)
 * Gebruik: node scripts/add-avatars.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env.local
const envFile = new URL('../.env.local', import.meta.url)
let env = {}
try {
  const content = readFileSync(envFile, 'utf8')
  for (const line of content.split('\n')) {
    const [key, ...vals] = line.split('=')
    if (key && !key.startsWith('#')) env[key.trim()] = vals.join('=').trim()
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Zet NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// randomuser.me portraits — gender-matched
// Vrouw: /women/1.jpg t/m /women/99.jpg
// Man:   /men/1.jpg   t/m /men/99.jpg
function getPortraitUrl(gender, index) {
  const folder = gender === 'vrouw' ? 'women' : 'men'
  const n = (index % 70) + 1
  return `https://randomuser.me/api/portraits/${folder}/${n}.jpg`
}

async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} voor ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function run() {
  console.log('\n📸 Avatar script gestart...\n')

  // Haal profielen op zonder avatar
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, gender')
    .is('avatar_url', null)

  if (error) {
    console.error('❌ Kon profielen niet ophalen:', error.message)
    process.exit(1)
  }

  if (!profiles || profiles.length === 0) {
    console.log('✅ Alle profielen hebben al een avatar.')
    return
  }

  console.log(`🔍 ${profiles.length} profiel(en) zonder avatar gevonden.\n`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < profiles.length; i++) {
    const { id, display_name, gender } = profiles[i]

    try {
      // Download portretfoto
      const portraitUrl = getPortraitUrl(gender, i)
      const imageBuffer = await downloadImage(portraitUrl)

      // Upload naar Supabase Storage
      const storagePath = `${id}/avatar.jpg`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(storagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadErr) throw new Error(uploadErr.message)

      // Haal public URL op
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath)

      // Update profiel
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', id)

      if (updateErr) throw new Error(updateErr.message)

      console.log(`✅ ${display_name} (${gender ?? 'onbekend'}) — ${portraitUrl}`)
      updated++
    } catch (err) {
      console.error(`❌ ${display_name}: ${err.message}`)
      failed++
    }

    // Kleine pauze om rate limits te vermijden
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n✨ Klaar! ${updated} bijgewerkt, ${failed} mislukt.\n`)
}

run().catch(console.error)
