/**
 * Seed script: 20 dummy profielen aanmaken in Supabase
 * Gebruik: node scripts/seed-profiles.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vjwsflqtvcbvsbwabcfe.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqd3NmbHF0dmNidnNid2FiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NDY5NCwiZXhwIjoyMDg4NzUwNjk0fQ.Vo6TyuJzYD7dDKFbGFqwAr-pVIPysrExjPpdh3Kk3Ig'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const profielen = [
  {
    email: 'anne.de.vries@example.nl',
    display_name: 'Anne',
    birth_year: 1972,
    gender: 'vrouw',
    location: 'Amsterdam',
    hobbies: ['Yoga', 'Lezen', 'Reizen', 'Meditatie'],
    looking_for: 'Een man die zichzelf kent en durft te kwetsbaren. Geen haast, wel echte verbinding.',
    intention: 'relatie',
    gender_preference: ['man'],
  },
  {
    email: 'peter.smit@example.nl',
    display_name: 'Peter',
    birth_year: 1968,
    gender: 'man',
    location: 'Utrecht',
    hobbies: ['Wandelen', 'Fotografie', 'Koken', 'Muziek'],
    looking_for: 'Een vrouw met wie ik de stilte kan delen, maar ook hartelijk kan lachen.',
    intention: 'relatie',
    gender_preference: ['vrouw'],
  },
  {
    email: 'marieke.janssen@example.nl',
    display_name: 'Marieke',
    birth_year: 1979,
    gender: 'vrouw',
    location: 'Den Haag',
    hobbies: ['Dans', 'Kunst', 'Spiritualiteit', 'Natuur'],
    looking_for: 'Iemand die net zo van het leven geniet als ik. Vrijheid en verbinding in balans.',
    intention: 'casual',
    gender_preference: ['man', 'vrouw'],
  },
  {
    email: 'robert.berg@example.nl',
    display_name: 'Robert',
    birth_year: 1961,
    gender: 'man',
    location: 'Rotterdam',
    hobbies: ['Sport', 'Reizen', 'Koken', 'Film'],
    looking_for: 'Een partner voor het tweede hoofdstuk. Kinderen groot, nu tijd voor mezelf — en hopelijk jou.',
    intention: 'relatie',
    gender_preference: ['vrouw'],
  },
  {
    email: 'sonja.meijer@example.nl',
    display_name: 'Sonja',
    birth_year: 1965,
    gender: 'vrouw',
    location: 'Groningen',
    hobbies: ['Lezen', 'Vrijwilligerswerk', 'Wandelen', 'Meditatie'],
    looking_for: 'Een zorgzame man met humor. Ik hou van diepgaande gesprekken bij een goed glas wijn.',
    intention: 'relatie',
    gender_preference: ['man'],
  },
  {
    email: 'tom.hendriks@example.nl',
    display_name: 'Tom',
    birth_year: 1975,
    gender: 'man',
    location: 'Eindhoven',
    hobbies: ['Muziek', 'Fotografie', 'Natuur', 'Persoonlijke groei'],
    looking_for: 'Iemand die me uitdaagt en inspireert. Diepgang maar ook luchtigheid.',
    intention: 'casual',
    gender_preference: ['vrouw'],
  },
  {
    email: 'linda.bakker@example.nl',
    display_name: 'Linda',
    birth_year: 1970,
    gender: 'vrouw',
    location: 'Haarlem',
    hobbies: ['Koken', 'Reizen', 'Film', 'Yoga'],
    looking_for: 'Een avontuurlijk iemand die durft te leven. Geen oppervlakkigheid.',
    intention: 'relatie',
    gender_preference: ['man'],
  },
  {
    email: 'erik.van.dijk@example.nl',
    display_name: 'Erik',
    birth_year: 1958,
    gender: 'man',
    location: 'Leiden',
    hobbies: ['Lezen', 'Wandelen', 'Muziek', 'Kunst'],
    looking_for: 'Een vrouw die weet wat ze wil. Ik ben rustig, betrouwbaar en hou van mooie gesprekken.',
    intention: 'vriendschap',
    gender_preference: ['vrouw'],
  },
  {
    email: 'yvonne.peters@example.nl',
    display_name: 'Yvonne',
    birth_year: 1977,
    gender: 'vrouw',
    location: 'Maastricht',
    hobbies: ['Dans', 'Sport', 'Reizen', 'Vrijwilligerswerk'],
    looking_for: 'Gezelligheid en misschien meer. Zie wel waar het heen gaat!',
    intention: 'plezier',
    gender_preference: ['man'],
  },
  {
    email: 'frank.wouters@example.nl',
    display_name: 'Frank',
    birth_year: 1963,
    gender: 'man',
    location: 'Tilburg',
    hobbies: ['Natuur', 'Wandelen', 'Koken', 'Spiritualiteit'],
    looking_for: 'Een vrouw die de natuur liefheeft en zichzelf ook een beetje kent.',
    intention: 'relatie',
    gender_preference: ['vrouw'],
  },
  {
    email: 'diana.visser@example.nl',
    display_name: 'Diana',
    birth_year: 1955,
    gender: 'vrouw',
    location: 'Amsterdam',
    hobbies: ['Kunst', 'Meditatie', 'Lezen', 'Fotografie'],
    looking_for: 'Rust, warmte en een echte connectie. Op mijn leeftijd weet je wat telt.',
    intention: 'vriendschap',
    gender_preference: ['man', 'vrouw'],
  },
  {
    email: 'hans.boer@example.nl',
    display_name: 'Hans',
    birth_year: 1969,
    gender: 'man',
    location: 'Breda',
    hobbies: ['Sport', 'Film', 'Reizen', 'Muziek'],
    looking_for: 'Iemand die van het leven houdt en niet te serieus is. Lachen is key.',
    intention: 'casual',
    gender_preference: ['vrouw'],
  },
  {
    email: 'carla.scholten@example.nl',
    display_name: 'Carla',
    birth_year: 1974,
    gender: 'vrouw',
    location: 'Nijmegen',
    hobbies: ['Yoga', 'Persoonlijke groei', 'Natuur', 'Vrijwilligerswerk'],
    looking_for: 'Een man die op weg is naar zijn beste zelf. Groei is essentieel voor mij.',
    intention: 'relatie',
    gender_preference: ['man'],
  },
  {
    email: 'jan.van.leeuwen@example.nl',
    display_name: 'Jan',
    birth_year: 1956,
    gender: 'man',
    location: 'Utrecht',
    hobbies: ['Wandelen', 'Koken', 'Lezen', 'Film'],
    looking_for: 'Een gezellige vrouw voor avonden thuis of uitstapjes. Geen drama, wel warmte.',
    intention: 'vriendschap',
    gender_preference: ['vrouw'],
  },
  {
    email: 'nathalie.dekker@example.nl',
    display_name: 'Nathalie',
    birth_year: 1982,
    gender: 'vrouw',
    location: 'Den Haag',
    hobbies: ['Dans', 'Muziek', 'Reizen', 'Sport'],
    looking_for: 'Energie, passie en eerlijkheid. De rest komt vanzelf.',
    intention: 'plezier',
    gender_preference: ['man'],
  },
  {
    email: 'marc.jacobs@example.nl',
    display_name: 'Marc',
    birth_year: 1971,
    gender: 'man',
    location: 'Amsterdam',
    hobbies: ['Kunst', 'Fotografie', 'Reizen', 'Meditatie'],
    looking_for: 'Een vrouw die de schoonheid ziet in kleine dingen. Ik ben creatief en aandachtig.',
    intention: 'relatie',
    gender_preference: ['vrouw'],
  },
  {
    email: 'ingrid.van.den.berg@example.nl',
    display_name: 'Ingrid',
    birth_year: 1967,
    gender: 'vrouw',
    location: 'Rotterdam',
    hobbies: ['Lezen', 'Koken', 'Spiritualiteit', 'Natuur'],
    looking_for: 'Diepgang, humor en een open hart. Ik ben klaar voor iets echts.',
    intention: 'relatie',
    gender_preference: ['man'],
  },
  {
    email: 'paul.verhoeven@example.nl',
    display_name: 'Paul',
    birth_year: 1960,
    gender: 'man',
    location: 'Haarlem',
    hobbies: ['Muziek', 'Film', 'Vrijwilligerswerk', 'Wandelen'],
    looking_for: 'Een warme vrouw die van muziek houdt en graag op pad gaat.',
    intention: 'casual',
    gender_preference: ['vrouw'],
  },
  {
    email: 'sandra.mulder@example.nl',
    display_name: 'Sandra',
    birth_year: 1973,
    gender: 'vrouw',
    location: 'Groningen',
    hobbies: ['Yoga', 'Reizen', 'Kunst', 'Persoonlijke groei'],
    looking_for: 'Een man die zowel avontuurlijk als stabiel is. Ja, dat bestaat.',
    intention: 'relatie',
    gender_preference: ['man'],
  },
  {
    email: 'alex.prins@example.nl',
    display_name: 'Alex',
    birth_year: 1978,
    gender: 'non-binair',
    location: 'Amsterdam',
    hobbies: ['Kunst', 'Muziek', 'Spiritualiteit', 'Meditatie'],
    looking_for: 'Verbinding voorbij labels. Ik ben op zoek naar authenticiteit.',
    intention: 'vriendschap',
    gender_preference: [],
  },
]

async function seed() {
  console.log(`\n🌱 Aanmaken van ${profielen.length} dummy profielen...\n`)
  let aangemaakt = 0
  let overgeslagen = 0

  for (const profiel of profielen) {
    const { email, display_name, birth_year, gender, location, hobbies, looking_for, intention, gender_preference } = profiel

    // Maak auth user aan
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'TestWachtwoord123!',
      email_confirm: true,
      user_metadata: { display_name },
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`⏭️  ${display_name} (${email}) — bestaat al`)
        overgeslagen++
        continue
      }
      console.error(`❌ ${display_name}: ${authError.message}`)
      continue
    }

    const userId = authData.user.id

    // Upsert profiel
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name,
      birth_year,
      gender,
      location,
      hobbies,
      looking_for,
      intention,
      gender_preference,
      onboarding_done: true,
      age_min: 35,
      age_max: 75,
    })

    if (profileError) {
      console.error(`❌ Profiel ${display_name}: ${profileError.message}`)
      continue
    }

    console.log(`✅ ${display_name}, ${new Date().getFullYear() - birth_year} jaar, ${location} (${gender})`)
    aangemaakt++
  }

  console.log(`\n✨ Klaar! ${aangemaakt} aangemaakt, ${overgeslagen} overgeslagen.\n`)
}

seed().catch(console.error)
