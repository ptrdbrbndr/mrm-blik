# Miracle Relationship Matcher — Stappenplan

> *"Vind je miracle match vanuit innerlijke vrede."*

---

## Status overzicht

| Fase | Focus | Status |
|---|---|---|
| 0. Fundament | Deploy, auth, DB | ✅ Afgerond |
| 1. Onboarding | Profiel aanmaken | ✅ Afgerond |
| 2. Profielpagina | Profiel bekijken & bewerken | 🔲 Volgende |
| 3. Discover | Andere gebruikers swipen | 🔲 |
| 4. Matches | Matches bekijken | 🔲 |
| 5. Chat | Berichten sturen | 🔲 |
| 6. Polish & launch | Kwaliteit & live | 🔲 |

---

## Fase 0 — Fundament ✅

- [x] Next.js 15 + Supabase + Vercel
- [x] Deployed op `test.liefdevolleblik.nl/matchmaker`
- [x] Magic link + Google OAuth
- [x] Auth middleware (protected routes)
- [x] `profiles` tabel met RLS

---

## Fase 1 — Onboarding ✅

- [x] Stap 1: bedoeling kiezen (vriendschap / plezier / casual / relatie)
- [x] Stap 2: profiel invullen (naam, geboortejaar, geslacht, woonplaats, hobby's, looking_for)
- [x] Middleware stuurt nieuwe gebruikers automatisch naar onboarding
- [x] Supabase auth URL config bijgewerkt

---

## Fase 2 — Profielpagina (Sprint 1)

**Doel**: gebruiker kan zijn profiel bekijken en bijwerken.

- [ ] **2.1** `/profiel` pagina — eigen profiel tonen (naam, leeftijd, locatie, hobby's, bedoeling)
- [ ] **2.2** Profielfoto uploaden via Supabase Storage
- [ ] **2.3** Profiel bewerken — alle velden aanpasbaar
- [ ] **2.4** `/profiel/[id]` — andermans profiel bekijken (alleen na match)
- [ ] **2.5** Account verwijderen
- [ ] **2.6** Vibe-test: `profiel.spec.ts`

**Deliverable**: gebruiker heeft een volledig, bewerkbaar profiel.

---

## Fase 3 — Discover & Swipen (Sprint 2) ⭐ Kern

**Doel**: gebruikers swipen door potentiële matches.

### Database
- [ ] **3.1** `matches` tabel: `user_a`, `user_b`, `status` (pending / matched / passed)
- [ ] **3.2** `discover_swipes` tabel: `swiper_id`, `target_id`, `direction` (like / pass)
- [ ] **3.3** RLS policies voor privacy (je ziet alleen je eigen swipes/matches)

### Matching algoritme
- [ ] **3.4** Basis-filter: leeftijdsvoorkeur, geslacht, locatie (provincie)
- [ ] **3.5** Score op gedeelde hobby's (meer overlap = hogere score)
- [ ] **3.6** Score op passende bedoeling (relatie x relatie = bonus)
- [ ] **3.7** Reeds geswipete profielen uitsluiten

### UI
- [ ] **3.8** `/discover` pagina — kaartgestapeld swipe-interface (Framer Motion)
- [ ] **3.9** Profielkaart: foto, naam, leeftijd, locatie, 3 hobby's, bedoeling
- [ ] **3.10** Swipe rechts = like, links = pass, omhoog = super like
- [ ] **3.11** Match-popup: "Het is een match!" als beide kanten liken
- [ ] **3.12** "Geen profielen meer" scherm met suggestie om voorkeuren te verruimen
- [ ] **3.13** Vibe-test: `discover.spec.ts`

**Deliverable**: gebruikers kunnen door profielen swipen en matchen.

---

## Fase 4 — Matches (Sprint 3)

**Doel**: matches bekijken en contact initiëren.

- [ ] **4.1** `/matches` pagina — overzicht van alle wederzijdse matches
- [ ] **4.2** Match-kaart: foto, naam, gedeelde hobby's, datum van match
- [ ] **4.3** "Super like" notificatie — iemand heeft je een super like gegeven
- [ ] **4.4** Match verwijderen / blokkeren
- [ ] **4.5** Vibe-test: `matches.spec.ts`

**Deliverable**: gebruiker ziet al zijn matches op één plek.

---

## Fase 5 — Chat (Sprint 4)

**Doel**: matches kunnen berichten sturen.

### Database
- [ ] **5.1** `conversations` tabel: `match_id`, `created_at`
- [ ] **5.2** `messages` tabel: `conversation_id`, `sender_id`, `content`, `created_at`
- [ ] **5.3** RLS: alleen match-deelnemers lezen/schrijven berichten
- [ ] **5.4** Supabase Realtime op `messages`

### UI
- [ ] **5.5** `/chat` pagina — lijst van actieve gesprekken
- [ ] **5.6** `/chat/[matchId]` — chatvenster met berichtenhistorie
- [ ] **5.7** Realtime updates (nieuwe berichten verschijnen direct)
- [ ] **5.8** Ongelezen-badge op matches en nav
- [ ] **5.9** Push notificatie (web push) bij nieuw bericht — optioneel
- [ ] **5.10** Vibe-test: `chat.spec.ts`

**Deliverable**: matches kunnen met elkaar chatten.

---

## Fase 6 — Polish & Launch (Sprint 5)

- [ ] **6.1** Navigatiebalk (bottom nav mobiel): Discover / Matches / Chat / Profiel
- [ ] **6.2** Lege states voor alle pagina's (geen matches, geen berichten)
- [ ] **6.3** Foto's verplicht maken bij onboarding (of placeholder tonen)
- [ ] **6.4** Leeftijdsvoorkeur instellen in profielinstellingen
- [ ] **6.5** Geslachtsvoorkeur instellen
- [ ] **6.6** Veiligheid: rapporteer een profiel
- [ ] **6.7** Eigen domein: `matchmaker.liefdevolleblik.nl` (of ander domein)
- [ ] **6.8** Lighthouse > 90 op alle scores
- [ ] **6.9** `./vibe-check.sh` — 0 fouten, 0 console errors

**Deliverable**: lanceerklaar product.

---

## Backlog (later)

- Miracle Circles: gematche gebruikers groeperen in begeleide sessies
- VREDE-vragenlijst als diepere match-dimensie
- Verificatie van profiel (foto-verificatie)
- Premium tier: onbeperkt swipen, wie heeft je geliket zien
- Moderatie dashboard voor admin

---

## Technische schuld

- [ ] Oude `workspaces / decks / cards / swipes` tabellen opruimen (zijn roadmap-overblijfselen)
- [ ] `NEXT_PUBLIC_APP_URL` lokaal instellen in `.env.local`
