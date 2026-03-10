# MRM-Blik — Stappenplan

> Fasering voor de ontwikkeling van de Miracle Roadmap Tinder app.

---

## Fase 0 — Project Setup (Dag 1–2)

- [ ] **0.1** Next.js 15 project initialiseren met TypeScript + Tailwind CSS 4
- [ ] **0.2** Supabase project aanmaken + lokale dev-omgeving (`supabase init`)
- [ ] **0.3** Vercel project koppelen (GitHub repo `ptrdbrbndr/mrm-blik`)
- [ ] **0.4** ESLint + Prettier + husky pre-commit hooks
- [ ] **0.5** Playwright test-setup met vibe-core fixture (conform CLAUDE.md)
- [ ] **0.6** CI/CD: GitHub Actions → lint + test + deploy preview
- [ ] **0.7** `.env.local` template met Supabase + Claude API keys
- [ ] **0.8** CLAUDE.md + vibe-check.sh configureren

**Deliverable**: Werkend skelet deployed op Vercel, groene CI pipeline.

---

## Fase 1 — Database & Auth (Dag 3–5)

- [ ] **1.1** Supabase migratie: `workspaces` tabel + RLS policies
- [ ] **1.2** Supabase migratie: `decks` tabel + RLS policies
- [ ] **1.3** Supabase migratie: `cards` tabel + RLS policies
- [ ] **1.4** Supabase migratie: `swipes` tabel + RLS policies
- [ ] **1.5** Supabase Auth configureren (magic link + Google OAuth)
- [ ] **1.6** Auth middleware in Next.js (protected routes)
- [ ] **1.7** `share_token` generatie via nanoid voor publieke swipe-links
- [ ] **1.8** Seed script met voorbeeld-workspace + deck

**Deliverable**: Volledige database met RLS, auth flow werkend.

---

## Fase 2 — Deck Builder (Dag 6–10)

- [ ] **2.1** `/dashboard` pagina — overzicht eigen decks (lijst + status)
- [ ] **2.2** `/deck/new` — formulier: titel, beschrijving, deadline
- [ ] **2.3** Card-editor: kaarten toevoegen met titel, beschrijving, categorie, effort
- [ ] **2.4** Drag-and-drop volgorde aanpassen (dnd-kit)
- [ ] **2.5** CSV-import voor bulk kaarten toevoegen
- [ ] **2.6** Deck publiceren → status `active` + share-link genereren
- [ ] **2.7** Deck sluiten → status `closed`, geen nieuwe swipes
- [ ] **2.8** `data-testid` op alle interactieve elementen
- [ ] **2.9** Vibe-test: `deck-builder.spec.ts`

**Deliverable**: Product owner kan een deck samenstellen en delen.

---

## Fase 3 — Swipe Interface (Dag 11–17) ⭐ Kern

- [ ] **3.1** `/swipe/[token]` route — publiek toegankelijk (geen login vereist)
- [ ] **3.2** Swipe-kaart component met Framer Motion drag gestures
- [ ] **3.3** Drie richtingen: links (nee), rechts (ja), omhoog (must-have)
- [ ] **3.4** Visuele feedback: kleur-overlay + icoon bij drag-richting
- [ ] **3.5** Keyboard support: ←, →, ↑ pijltjestoetsen
- [ ] **3.6** Touch-optimalisatie: smooth 60fps op mobiel
- [ ] **3.7** Voortgangsbalk (X van Y kaarten)
- [ ] **3.8** Bedankscherm na laatste kaart + optionele open vraag
- [ ] **3.9** Swipe opslaan via Server Action → `swipes` tabel
- [ ] **3.10** Anonieme sessie: optioneel naam invullen, geen login nodig
- [ ] **3.11** Duplicate-check: dezelfde persoon kan niet twee keer swipen
- [ ] **3.12** Responsive design: primair mobile, werkt ook desktop
- [ ] **3.13** Vibe-test: `swipe-flow.spec.ts`

**Deliverable**: Stakeholders kunnen via gedeelde link swipen — de kern van de app.

---

## Fase 4 — Resultaten Dashboard (Dag 18–22)

- [ ] **4.1** `/deck/[id]/results` — alleen toegankelijk voor deck-eigenaar
- [ ] **4.2** Score-berekening: rechts=1, links=0, omhoog=2 → gewogen score
- [ ] **4.3** Ranking-tabel: items gesorteerd op gemiddelde score
- [ ] **4.4** Heatmap-visualisatie: kleurcodering per item (rood→geel→groen)
- [ ] **4.5** Deelnemersoverzicht: wie heeft geswipet, wie niet
- [ ] **4.6** Consensus-indicator: items met hoge spreiding markeren als "controversieel"
- [ ] **4.7** Categorie-filter: resultaten filteren op epic/feature/bug/tech-debt
- [ ] **4.8** CSV-export van resultaten
- [ ] **4.9** Vibe-test: `results-dashboard.spec.ts`

**Deliverable**: Product owner ziet direct welke features het team wil.

---

## Fase 5 — AI Samenvatting (Dag 23–26)

- [ ] **5.1** Claude API integratie via Server Action
- [ ] **5.2** Prompt: "Analyseer deze swipe-resultaten en geef een roadmap-advies"
- [ ] **5.3** Output: top-5 prioriteiten, controversiële items, quick wins
- [ ] **5.4** AI-samenvatting opslaan in `deck_summaries` tabel
- [ ] **5.5** Rate limiting: max 3 samenvattingen per deck per dag
- [ ] **5.6** "Regenerate" knop voor nieuwe samenvatting
- [ ] **5.7** Markdown-rendering van AI-output
- [ ] **5.8** Vibe-test: `ai-summary.spec.ts`

**Deliverable**: AI-gedreven roadmap-advies op basis van teamconsensus.

---

## Fase 6 — Realtime & Notificaties (Dag 27–30)

- [ ] **6.1** Supabase Realtime: live teller op results-pagina bij nieuwe swipes
- [ ] **6.2** "X van Y mensen hebben geswipet" live indicator
- [ ] **6.3** E-mail notificatie (Resend): "Je deck heeft nieuwe resultaten"
- [ ] **6.4** E-mail notificatie: "Deadline nadert, X mensen moeten nog swipen"
- [ ] **6.5** Share-link kopieerknop + QR-code generatie
- [ ] **6.6** Vibe-test: `realtime-updates.spec.ts`

**Deliverable**: Deck-eigenaar ziet live wie er swipet en kan herinneringen sturen.

---

## Fase 7 — Polish & Launch (Dag 31–35)

- [ ] **7.1** Landing page met uitleg, demo-video, CTA
- [ ] **7.2** Onboarding flow: eerste deck aanmaken in 3 stappen
- [ ] **7.3** Error handling + loading states overal
- [ ] **7.4** Sentry error monitoring
- [ ] **7.5** Vercel Analytics
- [ ] **7.6** Open Graph meta tags + social sharing
- [ ] **7.7** Favicon + PWA manifest (installeerbaar op telefoon)
- [ ] **7.8** Performance audit: Lighthouse > 90 op alle scores
- [ ] **7.9** `./vibe-check.sh` — 0 fouten, 0 console errors
- [ ] **7.10** Productie-deploy op custom domein

**Deliverable**: Lanceerklaar product.

---

## Fase 8 — Post-launch & Integraties (Week 6+)

- [ ] **8.1** Conductus-integratie: case-items importeren als deck
- [ ] **8.2** Jira-integratie: epics/stories importeren
- [ ] **8.3** Slack-notificatie bij deck-resultaten
- [ ] **8.4** Webhook-support: resultaten pushen naar extern systeem
- [ ] **8.5** Deck templates: "Sprint Planning", "Kwartaal Review", "Feature Prioritering"
- [ ] **8.6** Team-workspace met meerdere deck-eigenaren
- [ ] **8.7** Vergelijkingsview: twee decks naast elkaar (voor/na)

---

## Samenvatting tijdlijn

| Fase | Duur | Focus |
|---|---|---|
| 0. Setup | 2 dagen | Fundament |
| 1. Database & Auth | 3 dagen | Data-laag |
| 2. Deck Builder | 5 dagen | Content management |
| 3. Swipe Interface | 7 dagen | **Kernervaring** |
| 4. Resultaten | 5 dagen | Inzicht |
| 5. AI Samenvatting | 4 dagen | Slim advies |
| 6. Realtime | 4 dagen | Engagement |
| 7. Polish & Launch | 5 dagen | Kwaliteit |
| **Totaal MVP** | **~35 werkdagen** | **~7 weken** |

---

## Risico's & mitigatie

| Risico | Impact | Mitigatie |
|---|---|---|
| Swipe-UX voelt niet smooth | Hoog | Framer Motion + vroeg testen op echte telefoons |
| Anonieme spam-swipes | Medium | Rate limiting + optionele e-mailverificatie |
| Supabase Realtime schaalt niet | Laag | Fallback naar polling; pas relevant bij >100 gelijktijdige users |
| Claude API kosten lopen op | Medium | Rate limiting per deck + caching van samenvattingen |
| Scope creep richting volledige PM-tool | Hoog | Strak vasthouden aan "swipen + resultaten" als kern |
