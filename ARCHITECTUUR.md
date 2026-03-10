# MRM-Blik — Miracle Roadmap Tinder

> *"Swipe je weg naar de perfecte productroadmap."*

**Versie**: 0.1
**Datum**: 10 maart 2026
**Eigenaar**: Peter de Brabander, Ductus B.V.

---

## 1. Concept

**MRM-Blik** (Miracle Roadmap Manager) is een Tinder-achtige webapp waarmee stakeholders op een laagdrempelige, speelse manier roadmap-items prioriteren. In plaats van saaie spreadsheets of eindeloze vergaderingen swipen gebruikers door features — **rechts** = wil ik, **links** = niet nu, **omhoog** = must-have.

De "Miracle" verwijst naar de *Miracle Question* uit oplossingsgerichte therapie: "Stel dat je morgen wakker wordt en het product is perfect — wat zie je dan?" Elke stakeholder beantwoordt die vraag door te swipen.

### Kernbelofte

*Verzamel in 5 minuten de prioriteiten van je hele team — zonder vergadering, zonder spreadsheet.*

---

## 2. Doelgroep

| Persona | Gebruik |
|---|---|
| **Product Owner** | Maakt een "deck" aan met roadmap-items, verstuurt swipe-link naar team |
| **Stakeholder** | Ontvangt link, swipet door items, klaar in 3–5 minuten |
| **Management** | Bekijkt geaggregeerde resultaten en heatmap |

Primaire context: **Conductus**-klanten die hun CMMN-processen willen prioriteren, maar ook generiek inzetbaar voor elk product/team.

---

## 3. Technische Architectuur

### 3.1 Tech Stack

| Laag | Technologie | Motivatie |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | Consistentie met Liefdevolle Blik & Conductus |
| **Styling** | Tailwind CSS 4 + Framer Motion | Swipe-animaties, mobile-first |
| **Backend** | Next.js Route Handlers + Server Actions | Geen aparte API-server nodig |
| **Database** | Supabase (PostgreSQL + Auth + RLS) | Snelle setup, RLS voor multi-tenant isolatie |
| **Hosting** | Vercel | Zero-config deploys, edge functions |
| **Realtime** | Supabase Realtime | Live dashboard updates bij nieuwe swipes |
| **AI** | Claude API (Anthropic) | Samenvatting van resultaten, roadmap-suggesties |

### 3.2 Systeemdiagram

```
┌─────────────────────────────────────────────────┐
│                   Vercel Edge                    │
│  ┌───────────────────────────────────────────┐   │
│  │           Next.js App Router              │   │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  │   │
│  │  │  Swipe  │  │  Deck    │  │ Results │  │   │
│  │  │  UI     │  │  Builder │  │ Dash    │  │   │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘  │   │
│  │       │             │             │        │   │
│  │  ┌────▼─────────────▼─────────────▼────┐  │   │
│  │  │        Server Actions / API         │  │   │
│  │  └────────────────┬────────────────────┘  │   │
│  └───────────────────┼───────────────────────┘   │
└──────────────────────┼───────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   Supabase Platform     │
          │  ┌──────┐  ┌────────┐  │
          │  │ Auth │  │Realtime│  │
          │  └──────┘  └────────┘  │
          │  ┌──────────────────┐  │
          │  │   PostgreSQL     │  │
          │  │  + RLS policies  │  │
          │  └──────────────────┘  │
          └─────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │    Claude API           │
          │  (resultaat-analyse)    │
          └─────────────────────────┘
```

### 3.3 Datamodel

```sql
-- Organisatie / workspace
CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  owner_id    UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Een set roadmap-items om over te swipen
CREATE TABLE decks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT DEFAULT 'draft', -- draft | active | closed
  share_token   TEXT UNIQUE DEFAULT nanoid(),
  deadline      TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Individueel roadmap-item / feature-kaart
CREATE TABLE cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id     UUID REFERENCES decks(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,           -- epic, feature, bug, tech-debt
  effort      TEXT,           -- S, M, L, XL
  image_url   TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Swipe-stem van een deelnemer
CREATE TABLE swipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     UUID REFERENCES cards(id) ON DELETE CASCADE,
  deck_id     UUID REFERENCES decks(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  direction   TEXT NOT NULL,  -- left (nee) | right (ja) | up (must-have)
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(card_id, user_id)
);

-- AI-gegenereerde samenvatting per deck
CREATE TABLE deck_summaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id     UUID REFERENCES decks(id) ON DELETE CASCADE,
  content     JSONB NOT NULL, -- { markdown, priorities[], conflicts[] }
  model       TEXT DEFAULT 'claude-sonnet-4-6',
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Kernpagina's

| Route | Doel |
|---|---|
| `/` | Landing page + login |
| `/dashboard` | Overzicht van je decks |
| `/deck/new` | Deck builder: items toevoegen |
| `/deck/[id]` | Deck detail + resultaten |
| `/deck/[id]/results` | Heatmap + AI-samenvatting |
| `/swipe/[token]` | Publieke swipe-interface (geen login nodig) |

### 3.5 Swipe-mechaniek

```
┌─────────────────────────┐
│                         │
│    ← LINKS = Nee        │
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │   Feature Card  │   │        ↑ OMHOOG = Must-have
│   │                 │   │
│   │  "Dark mode"    │   │
│   │  Effort: M      │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
│    RECHTS = Ja →        │
│                         │
└─────────────────────────┘
```

- **Framer Motion** voor vloeiende drag-animaties
- **Touch + mouse** support
- Keyboard: ←/→/↑ pijltjestoetsen
- Na laatste kaart: bedankscherm + optionele open vraag

---

## 4. Niet-functionele eisen

| Aspect | Eis |
|---|---|
| **Performance** | Swipe-interface < 100ms response, LCP < 1.5s |
| **Mobile-first** | Primair ontworpen voor telefoon (swipe = native gesture) |
| **Toegankelijkheid** | Keyboard-navigatie, ARIA-labels, kleurcontrast AA |
| **Privacy** | Anoniem swipen mogelijk; geen tracking; GDPR-compliant |
| **Multi-tenant** | RLS op workspace_id; data volledig geïsoleerd |
| **Schaalbaarheid** | Supabase + Vercel edge = horizontaal schaalbaar |

---

## 5. Integraties

| Integratie | Prio | Doel |
|---|---|---|
| **Conductus** | P1 | Case-items importeren als deck-kaarten |
| **Jira** | P2 | Epics/stories importeren als kaarten |
| **CSV/JSON import** | P1 | Handmatige bulk-import |
| **Slack** | P2 | Notificatie wanneer deck klaar is |
| **Webhook** | P2 | Resultaten pushen naar extern systeem |

---

## 6. Huisstijl

Aansluitend bij de Ductus / Conductus merkidentiteit:

| Element | Waarde |
|---|---|
| **Primair** | Donkerblauw `#1B2A4A` |
| **Accent** | Warm oranje `#E8793A` |
| **Succes (swipe rechts)** | Groen `#2ECC71` |
| **Afwijzing (swipe links)** | Rood `#E74C3C` |
| **Must-have (swipe omhoog)** | Goud `#F1C40F` |
| **Achtergrond** | Licht crème `#FAFAF7` |
| **Font** | Inter (UI) + Space Grotesk (headings) |
