import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vjwsflqtvcbvsbwabcfe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqd3NmbHF0dmNidnNid2FiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NDY5NCwiZXhwIjoyMDg4NzUwNjk0fQ.Vo6TyuJzYD7dDKFbGFqwAr-pVIPysrExjPpdh3Kk3Ig',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const vrouwen = [
  'Emma','Lotte','Sophie','Noor','Iris','Fleur','Roos','Julia','Laura','Vera',
  'Hanna','Elise','Manon','Lisette','Corine','Astrid','Petra','Mirjam','Anke','Bregje',
  'Claudia','Daniëlle','Esther','Femke','Grietje','Hanneke','Ilse','Joke','Karen','Liesbeth',
  'Marianne','Nicole','Olga','Priscilla','Quirine','Renate','Simone','Tineke','Ursula','Valerie',
  'Wendy','Xandra','Yolanda','Zoë','Annelies','Bernadette','Cecile','Dorien','Evelien','Frederike',
]

const mannen = [
  'Bas','Daan','Finn','Joost','Kees','Lars','Maarten','Niels','Olaf','Pieter',
  'Quinten','Ruben','Stefan','Thijs','Uwe','Victor','Wouter','Xander','Yorick','Zander',
  'Arjan','Bert','Cees','Dennis','Eduard','Frans','Gerard','Henk','Igor','Jeroen',
  'Karel','Leon','Michel','Nathan','Oscar','Patrick','Ralf','Sander','Timo','Umberto',
  'Vincent','Willem','Arie','Bruno','Chris','Diederik','Egbert','Ferdinand','Gijs','Harmen',
]

const steden = [
  'Amsterdam','Amsterdam','Amsterdam','Amsterdam',
  'Rotterdam','Rotterdam','Rotterdam',
  'Den Haag','Den Haag','Den Haag',
  'Utrecht','Utrecht','Utrecht',
  'Eindhoven','Eindhoven',
  'Groningen','Groningen',
  'Tilburg','Breda','Nijmegen',
  'Haarlem','Leiden','Delft','Amersfoort',
  'Maastricht','Arnhem','Zwolle','Enschede',
  'Apeldoorn','Almere','Dordrecht','Leeuwarden',
]

const allHobbies = [
  'Wandelen','Yoga','Meditatie','Muziek','Lezen','Koken','Reizen',
  'Sport','Film','Kunst','Fotografie','Dans','Natuur','Spiritualiteit',
  'Persoonlijke groei','Vrijwilligerswerk',
]

const intenties = ['relatie','relatie','relatie','casual','casual','plezier','vriendschap']

const genderPrefs = {
  man: [['vrouw'],['vrouw'],['vrouw'],['vrouw'],['man','vrouw'],[]],
  vrouw: [['man'],['man'],['man'],['man'],['man','vrouw'],[]],
  'non-binair': [['man'],['vrouw'],['man','vrouw'],[]],
}

const lookingForVrouw = [
  'Een man die weet wie hij is en niet bang is om dat te laten zien.',
  'Warmte, humor en eerlijkheid. De rest komt vanzelf.',
  'Iemand die net zo van het leven geniet als ik — met alles wat daarbij hoort.',
  'Een avontuurlijk iemand die ook van stilte houdt.',
  'Een man met een warm hart en een nieuwsgierige geest.',
  'Iemand die er echt is, niet alleen op mooie dagen.',
  'Een stabiele, lieve man die ook durft te dromen.',
  'Diepgaande gesprekken, samen koken, en af en toe spontaan op pad.',
  'Een man die zichzelf kent en ruimte geeft aan de ander.',
  'Echte verbinding, geen toneelspel.',
  'Iemand die van natuur houdt en graag wandelt of fietst.',
  'Een man met humor en relativeringsvermogen.',
  'Iemand die bewust leeft en openstaat voor groei.',
  'Een lieve man die echt luistert.',
  'Rustig, betrouwbaar, en met oog voor schoonheid in het dagelijks leven.',
]

const lookingForMan = [
  'Een vrouw die zichzelf is — geen masker, geen act.',
  'Iemand die van kleine dingen geniet en groot kan dromen.',
  'Een warme vrouw met humor die ook van stilte kan genieten.',
  'Iemand die weet wat ze wil en dat durft te zeggen.',
  'Een avontuurlijke vrouw die ook van thuiskomen houdt.',
  'Lief, eigenwijs en echt. Meer heb ik niet nodig.',
  'Iemand die mijn wereld vergroot en me uitdaagt.',
  'Een vrouw met een open hart en een scherpe geest.',
  'Iemand die net zo gek is op reizen als ik.',
  'Een vrouw die ook wel eens een gek plan wil uitvoeren.',
  'Iemand die lacht om dezelfde dingen als ik.',
  'Een vrouw die weet hoe ze van het leven kan genieten.',
  'Diepgang, maar ook luchtigheid. Geen drama.',
  'Iemand met passie — voor wat dan ook.',
  'Een vrouw die durft kwetsbaar te zijn.',
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const profielen = []

// 52 vrouwen
for (let i = 0; i < 52; i++) {
  const naam = vrouwen[i % vrouwen.length] + (i >= vrouwen.length ? String(i) : '')
  const birthYear = 1954 + Math.floor(Math.random() * 31) // 1954–1984 → 41–71 jaar
  const prefs = genderPrefs['vrouw']
  profielen.push({
    email: `${naam.toLowerCase().replace(/[^a-z]/g, '')}.${birthYear}@seed.nl`,
    display_name: vrouwen[i % vrouwen.length],
    birth_year: birthYear,
    gender: 'vrouw',
    location: pick(steden),
    hobbies: pickN(allHobbies, 3 + Math.floor(Math.random() * 3)),
    looking_for: pick(lookingForVrouw),
    intention: pick(intenties),
    gender_preference: pick(prefs),
    age_min: 40,
    age_max: 75,
  })
}

// 46 mannen
for (let i = 0; i < 46; i++) {
  const naam = mannen[i % mannen.length] + (i >= mannen.length ? String(i) : '')
  const birthYear = 1954 + Math.floor(Math.random() * 31)
  const prefs = genderPrefs['man']
  profielen.push({
    email: `${naam.toLowerCase().replace(/[^a-z]/g, '')}.${birthYear}@seed.nl`,
    display_name: mannen[i % mannen.length],
    birth_year: birthYear,
    gender: 'man',
    location: pick(steden),
    hobbies: pickN(allHobbies, 3 + Math.floor(Math.random() * 3)),
    looking_for: pick(lookingForMan),
    intention: pick(intenties),
    gender_preference: pick(prefs),
    age_min: 40,
    age_max: 75,
  })
}

// 2 non-binair
for (let i = 0; i < 2; i++) {
  const naam = ['Sasha', 'Robin'][i]
  const birthYear = 1968 + i * 7
  profielen.push({
    email: `${naam.toLowerCase()}.${birthYear}@seed.nl`,
    display_name: naam,
    birth_year: birthYear,
    gender: 'non-binair',
    location: 'Amsterdam',
    hobbies: pickN(allHobbies, 4),
    looking_for: 'Verbinding voorbij labels. Authenticiteit is alles.',
    intention: 'vriendschap',
    gender_preference: [],
    age_min: 35,
    age_max: 75,
  })
}

async function seed() {
  console.log(`\n🌱 Aanmaken van ${profielen.length} profielen...\n`)
  let ok = 0, skip = 0, fail = 0

  for (const p of profielen) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: p.email,
      password: 'SeedWachtwoord99',
      email_confirm: true,
      user_metadata: { display_name: p.display_name },
    })

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        process.stdout.write('⏭ ')
        skip++
      } else {
        console.log(`\n❌ ${p.display_name}: ${error.message}`)
        fail++
      }
      continue
    }

    const { error: pe } = await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: p.display_name,
      birth_year: p.birth_year,
      gender: p.gender,
      location: p.location,
      hobbies: p.hobbies,
      looking_for: p.looking_for,
      intention: p.intention,
      gender_preference: p.gender_preference,
      age_min: p.age_min,
      age_max: p.age_max,
      onboarding_done: true,
    })

    if (pe) {
      console.log(`\n❌ Profiel ${p.display_name}: ${pe.message}`)
      fail++
    } else {
      process.stdout.write('✅')
      ok++
    }

    // Kleine pauze om rate limits te vermijden
    await new Promise(r => setTimeout(r, 80))
  }

  console.log(`\n\n✨ Klaar! ${ok} aangemaakt, ${skip} overgeslagen, ${fail} mislukt.\n`)
}

seed().catch(console.error)
