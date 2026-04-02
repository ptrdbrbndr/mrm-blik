# Security Baseline — Mindful Relationship Map (MRM Blik)

**Privacy-niveau: HOOG**
Verwerkt gevoelige relatiedata (kaarten, matches, chatberichten, relatiedynamiek). Dit betreft bijzondere categorieën persoonsgegevens (relatie- en intimiteitdata) — AVG artikel 9 van toepassing.

**Relevante normen**: OWASP ASVS Level 1, ISO/IEC 27701, AVG

---

## Profiel

| Eigenschap | Waarde |
|------------|--------|
| Type | Next.js SPA/app + Supabase |
| Auth | Supabase Auth (OAuth callback) |
| Database | Supabase PostgreSQL |
| Externe diensten | Supabase, Vercel |
| Hosting | Vercel |
| Persoonsgegevens | E-mail, relatiestatus, kaartinhoud, match-data, chatberichten |
| Bewaartermijn | Te definiëren; account-delete verwijdert alle data |

---

## Status overzicht

### Authenticatie & Toegang

| Item | Eis | Status |
|------|-----|--------|
| OAuth callback beveiligd | `/auth/callback` valideert state/code | ✅ (Supabase standaard) |
| Beschermde routes | Dashboard, deck, discover, chat vereisen auth | ⚠️ middleware verifiëren |
| Gebruiker ziet alleen eigen data | RLS op decks, matches, berichten | ⚠️ verifiëren per tabel |
| Partnerdata toegang | Match-deelnemers zien alleen gezamenlijke data | ⚠️ RLS match-relatie testen |

### Gevoelige Data

| Item | Eis | Status |
|------|-----|--------|
| Kaartinhoud niet openbaar | Decks zijn privé tenzij gedeeld | ⚠️ RLS testen |
| Chatberichten beveiligd | Alleen match-deelnemers lezen chat | ⚠️ RLS testen |
| Geen PII in URL's | Match-ID's zijn opaque (nanoid) | ✅ (`nanoid` in deps) |
| Data-at-rest | Supabase encrypted opslag | ✅ (Supabase default) |
| HTTPS (transit) | TLS, HSTS | ✅ (Vercel) |

### Privacy (AVG)

| Item | Eis | Status |
|------|-----|--------|
| Expliciete toestemming bij registratie | Voor verwerking relatiedata | ⚠️ implementeren |
| Account verwijdering | Alle data: decks, matches, berichten | ❌ implementeren |
| Data export | Gebruiker kan eigen data downloaden | ❌ |
| Bewaartermijn gedefinieerd | Inactieve accounts na X maanden verwijderd | ❌ |
| Geen PII in logs | Kaartinhoud/berichten niet in server logs | ⚠️ |

### Infrastructuur

| Item | Eis | Status |
|------|-----|--------|
| HTTPS | TLS via Vercel | ✅ |
| Security headers | CSP, X-Frame-Options | ⚠️ instellen |
| Rate limiting gevoelige routes | Discover/match-endpoints | ⚠️ |
| Service role key server-side | Nooit in client bundle | ✅ |
| Secrets via .env | Geen hardcoded keys | ✅ |

---

## Prioriteit actielijst

1. **KRITIEK** — RLS testen: gebruiker A mag geen kaarten/berichten van gebruiker B zien
2. **KRITIEK** — Account-verwijdering implementeren (AVG artikel 17)
3. **HOOG** — Expliciete toestemmingscheck bij onboarding voor gevoelige dataverwerking
4. **HOOG** — Bewaartermijn definiëren en inactieve accounts opschonen
5. **MEDIUM** — Security headers toevoegen
6. **MEDIUM** — Rate limiting op match/discover endpoints
7. **LAAG** — Data export feature

---

## Bedreigingsmodel

| Bedreiging | Impact | Kans | Mitigatie |
|------------|--------|------|-----------|
| Gebruiker A leest kaarten/chat van B | Kritiek | Medium | RLS per tabel strikt testen |
| Ongeautoriseerde match-toegang | Hoog | Medium | RLS match-relatie |
| Account niet verwijderbaar | Hoog | Zeker | AVG compliance verplichting |
| Gevoelige data in logs | Hoog | Medium | Log-filtering implementeren |
| OAuth state-forgery (CSRF) | Hoog | Laag | Supabase callback state-check |
| Inactieve accounts met oude data | Medium | Hoog | Retentiebeleid + auto-delete |
