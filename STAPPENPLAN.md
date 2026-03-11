# Miracle Relationship Matcher — Stappenplan

> *"Vind je miracle match vanuit innerlijke vrede."*

---

## Status overzicht

| Fase | Focus | Status |
|---|---|---|
| 0. Fundament | Deploy, auth, DB | ✅ Afgerond |
| 1. Onboarding | Profiel aanmaken | ✅ Afgerond |
| 2. Profielpagina | Profiel bekijken & bewerken | ✅ Afgerond |
| 3. Discover | Andere gebruikers swipen | ✅ Afgerond |
| 4. Matches | Matches bekijken | ✅ Afgerond |
| 5. Chat | Berichten sturen | ✅ Afgerond |
| 6. Polish & launch | Kwaliteit & live | ✅ Afgerond |

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
- [x] Foto uploaden bij onboarding (avatar upload naar Supabase Storage)
- [x] Middleware stuurt nieuwe gebruikers automatisch naar onboarding
- [x] Supabase auth URL config bijgewerkt

---

## Fase 2 — Profielpagina ✅

- [x] `/profiel` pagina — eigen profiel tonen
- [x] Profielfoto uploaden via Supabase Storage
- [x] Profiel bewerken — alle velden aanpasbaar (incl. leeftijdsvoorkeur & geslachtsvoorkeur)
- [x] `/profiel/[id]` — andermans profiel bekijken
- [x] Account verwijderen (`/profiel/verwijderen`)
- [x] ReportButton component — profiel rapporteren

---

## Fase 3 — Discover & Swipen ✅

- [x] `matches` tabel + `discover_swipes` tabel met RLS
- [x] Matching algoritme: leeftijdsfilter, geslachtsfilter, hobby-score, bedoeling-score
- [x] Reeds geswipete profielen uitsluiten
- [x] `/discover` — kaartgestapeld swipe-interface (Framer Motion)
- [x] Swipe rechts = like, links = pass, omhoog = super like
- [x] Match-popup: "Het is een match!" als beide kanten liken
- [x] "Geen profielen meer" scherm

---

## Fase 4 — Matches ✅

- [x] `/matches` — overzicht van alle wederzijdse matches
- [x] Match-kaart: foto, naam, laatste bericht, ongelezen-badge, datum

---

## Fase 5 — Chat ✅

- [x] `conversations` + `messages` tabellen met RLS
- [x] Supabase Realtime op `messages`
- [x] `/chat` — lijst van actieve gesprekken (gesorteerd op recente activiteit)
- [x] `/chat/[matchId]` — chatvenster met realtime berichten
- [x] Optimistische berichtrendering
- [x] Ongelezen-badge op matches en nav
- [x] Auto-create conversation bij eerste bericht

---

## Fase 6 — Polish & Launch ✅

- [x] **6.1** Navigatiebalk (bottom nav mobiel): Discover / Matches / Chat / Profiel
- [x] **6.2** Lege states voor alle pagina's (geen matches, geen berichten)
- [x] **6.3** Foto uploaden bij onboarding
- [x] **6.4** Leeftijdsvoorkeur instellen in profielinstellingen
- [x] **6.5** Geslachtsvoorkeur instellen
- [x] **6.6** Veiligheid: rapporteer een profiel (ReportButton)
- [x] **6.7** Eigen domein: `basePath` verwijderd — klaar voor `matchmaker.liefdevolleblik.nl`
- [x] **6.8** Lighthouse-optimalisaties: Next.js Image optimization (Supabase domain), security headers, static asset caching
- [x] **6.9** Vibe-test spec: `tests/vibe/matchmaker.spec.ts`

### Nog te doen voor 6.7 (infra, geen code):
- [ ] Vercel project instellen voor MRM (`ptrdbrbndrs-projects`)
- [ ] Custom domain `matchmaker.liefdevolleblik.nl` toevoegen in Vercel
- [ ] CNAME record aanmaken in mijn.host: `matchmaker` → `cname.vercel-dns.com`
- [ ] `NEXT_PUBLIC_APP_URL` instellen op `https://matchmaker.liefdevolleblik.nl`
- [ ] Supabase auth redirect URLs bijwerken

### Nog te doen voor rapporteer-functie (6.6):
- [ ] SQL migratie uitvoeren in Supabase:
  ```sql
  CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  ```

**Deliverable**: lanceerklaar product. ✅

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
