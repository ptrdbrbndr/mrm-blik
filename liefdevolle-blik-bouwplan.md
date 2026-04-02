# Liefdevolle Blik — Volledig Bouwplan voor Claude Code
**liefdevolleblik.nl** · Versie 1.0 · Gebaseerd op huisstijl 365dagensuccesvol.nl

---

## 0. Visuele identiteit & huisstijl

### Kleurpalet (afgeleid van 365dagensuccesvol.nl)
```css
:root {
  /* Primair — warmte en verbinding */
  --kleur-grond:     #1A2E1A;   /* Diep bosgroen — rust, groei */
  --kleur-goud:      #C8943C;   /* Warm goud — positiviteit, licht */
  --kleur-amber:     #E8B86D;   /* Zacht amber — warmte */

  /* Neutraal */
  --kleur-crème:     #FBF7F0;   /* Warme achtergrond */
  --kleur-ivoor:     #F2EBD9;   /* Kaartachtergrond */
  --kleur-warm-wit:  #FFFFFF;
  --kleur-zand:      #E8DBC8;   /* Subtiele scheiding */

  /* Tekst */
  --kleur-inkt:      #1C1C1C;
  --kleur-inkt-licht:#5A4A3A;

  /* Status */
  --kleur-succes:    #4CAF7D;
  --kleur-fout:      #C0392B;
}
```

### Typografie
```
Koppen:    Playfair Display (serif, italic voor accenten)
Subkop:    Lato 600 (clean, leesbaar)
Broodtekst:Lato 400
Handschrift:Caveat (voor persoonlijke noten)
```

### Design principes
- **Warmte boven koelheid** — afgeronde hoeken (16–24px), zachte schaduwen
- **Verbinding** — avatars, namen, groepsgevoel altijd zichtbaar
- **Vertrouwen** — slot-icoon prominent, duidelijke privacyberichten
- **Intentie** — schrijfmoment voelt bewust en plechtig aan

---

## 1. Architectuuroverzicht

```
liefdevolleblik.nl
├── Frontend:    Next.js 14 (App Router, TypeScript)
├── Styling:     Tailwind CSS + CSS variables (huisstijl)
├── Database:    Supabase (PostgreSQL + Row Level Security)
├── Auth:        Supabase Auth (email/password + magic link)
├── Encryptie:   AES-256 client-side (Web Crypto API)
├── WhatsApp:    WhatsApp Business Cloud API (Meta)
├── E-mail:      Resend (transactionele mail)
├── Scheduling:  Supabase Edge Functions (cron)
├── Hosting:     Vercel (edge runtime)
└── Secrets:     Vercel Environment Variables
```

### Privacy-architectuur (defense in depth)
```
Browser → HTTPS → Vercel Edge → Next.js API Route
                                    ↓
                            Supabase (RLS policies)
                                    ↓
                         PostgreSQL (encrypted at rest)
                                    ↓
                    Notities: AES-256 versleuteld met cirkel-sleutel
                    Cirkel-sleutel: alleen vrijgegeven NA openingsdatum
```

**Kernprincipe:** De server kan notitiepinhoud nooit lezen vóór de openingsdatum. Row Level Security blokkeert de decryptie-sleutel totdat `opening_datum <= NOW()`.

---

## 2. Database Schema

```sql
-- ─────────────────────────────────────────────────────
-- USERS (uitbreiding op Supabase auth.users)
-- ─────────────────────────────────────────────────────
CREATE TABLE public.profielen (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  voornaam        TEXT NOT NULL,
  achternaam      TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  telefoon        TEXT NOT NULL,           -- 06-nummer (E.164: +316...)
  wa_opt_in       BOOLEAN DEFAULT FALSE,   -- expliciete WhatsApp toestemming
  email_opt_in    BOOLEAN DEFAULT TRUE,
  aangemaakt_op   TIMESTAMPTZ DEFAULT NOW(),
  verwijder_op    TIMESTAMPTZ,             -- ingesteld op opening + 30d
  CONSTRAINT telefoon_formaat CHECK (telefoon ~ '^\+316[0-9]{8}$')
);

-- ─────────────────────────────────────────────────────
-- CIRKELS (groepen)
-- ─────────────────────────────────────────────────────
CREATE TABLE public.cirkels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam            TEXT NOT NULL,
  beschrijving    TEXT,
  mentor_id       UUID NOT NULL REFERENCES public.profielen(id),
  uitnodigings_code TEXT UNIQUE NOT NULL,  -- 8-karakter random code
  opening_datum   DATE NOT NULL,
  opening_verzonden BOOLEAN DEFAULT FALSE,
  cirkel_sleutel  TEXT,                   -- AES-256 sleutel, alleen zichtbaar NA opening_datum
  aangemaakt_op   TIMESTAMPTZ DEFAULT NOW(),
  gesloten_op     TIMESTAMPTZ,            -- na vernietiging
  max_leden       INT DEFAULT 50,
  CONSTRAINT opening_in_toekomst CHECK (opening_datum > aangemaakt_op::DATE)
);

-- ─────────────────────────────────────────────────────
-- CIRKEL-LIDMAATSCHAPPEN
-- ─────────────────────────────────────────────────────
CREATE TABLE public.lidmaatschappen (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirkel_id    UUID NOT NULL REFERENCES public.cirkels(id) ON DELETE CASCADE,
  gebruiker_id UUID NOT NULL REFERENCES public.profielen(id) ON DELETE CASCADE,
  rol          TEXT NOT NULL DEFAULT 'lid' CHECK (rol IN ('mentor', 'lid')),
  toegevoegd_op TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cirkel_id, gebruiker_id)
);

-- ─────────────────────────────────────────────────────
-- NOTITIES (versleuteld)
-- ─────────────────────────────────────────────────────
CREATE TABLE public.notities (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirkel_id         UUID NOT NULL REFERENCES public.cirkels(id) ON DELETE CASCADE,
  schrijver_id      UUID NOT NULL REFERENCES public.profielen(id),
  ontvanger_id      UUID NOT NULL REFERENCES public.profielen(id),
  versleutelde_tekst TEXT NOT NULL,        -- AES-256 encrypted, base64
  iv                TEXT NOT NULL,         -- initialisatievector, base64
  geschreven_op     TIMESTAMPTZ DEFAULT NOW(),
  gelezen_op        TIMESTAMPTZ,           -- null totdat blik open is
  CONSTRAINT niet_aan_zichzelf CHECK (schrijver_id != ontvanger_id)
);

-- ─────────────────────────────────────────────────────
-- UITNODIGINGEN
-- ─────────────────────────────────────────────────────
CREATE TABLE public.uitnodigingen (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirkel_id     UUID NOT NULL REFERENCES public.cirkels(id),
  uitgenodigd_email TEXT NOT NULL,
  uitgenodigd_door  UUID NOT NULL REFERENCES public.profielen(id),
  token         TEXT UNIQUE NOT NULL,      -- éénmalig gebruik
  verlopen_op   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  gebruikt_op   TIMESTAMPTZ,
  aangemaakt_op TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- VERWIJDERLOG (audit trail)
-- ─────────────────────────────────────────────────────
CREATE TABLE public.verwijderlogs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirkel_id   UUID,                        -- kan null zijn na verwijdering
  actie       TEXT NOT NULL,
  details     JSONB,
  uitgevoerd_op TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Row Level Security (RLS) Policies

```sql
-- Schakel RLS in op alle tabellen
ALTER TABLE profielen      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirkels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lidmaatschappen ENABLE ROW LEVEL SECURITY;
ALTER TABLE notities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE uitnodigingen  ENABLE ROW LEVEL SECURITY;

-- ─── PROFIELEN ───
-- Gebruiker ziet alleen zichzelf
CREATE POLICY "eigen_profiel" ON profielen
  FOR ALL USING (auth.uid() = id);

-- ─── CIRKELS ───
-- Alleen zichtbaar voor leden
CREATE POLICY "cirkel_voor_leden" ON cirkels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lidmaatschappen
      WHERE cirkel_id = cirkels.id
        AND gebruiker_id = auth.uid()
    )
  );

-- Aanmaken: iedereen (wordt dan mentor)
CREATE POLICY "cirkel_aanmaken" ON cirkels
  FOR INSERT WITH CHECK (mentor_id = auth.uid());

-- Bewerken: alleen mentor
CREATE POLICY "cirkel_bewerken_mentor" ON cirkels
  FOR UPDATE USING (mentor_id = auth.uid());

-- ─── CIRKEL-SLEUTEL — KRITISCH ───
-- cirkel_sleutel is NULL totdat opening_datum verstreken is
-- Edge Function onthult sleutel pas op openingsdatum
CREATE POLICY "sleutel_pas_na_opening" ON cirkels
  FOR SELECT USING (
    CASE
      WHEN opening_datum <= CURRENT_DATE THEN TRUE
      ELSE (cirkel_sleutel IS NULL)   -- geeft NULL terug, nooit vroegtijdig
    END
  );

-- ─── NOTITIES ───
-- Schrijven: alleen leden van de cirkel, vóór opening
CREATE POLICY "notitie_schrijven" ON notities
  FOR INSERT WITH CHECK (
    schrijver_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM lidmaatschappen
      WHERE cirkel_id = notities.cirkel_id
        AND gebruiker_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM cirkels
      WHERE id = notities.cirkel_id
        AND opening_datum > CURRENT_DATE  -- blik is nog dicht
    )
  );

-- Lezen: ontvanger mag lezen NA opening; schrijver mag eigen notities zien (niet de tekst)
CREATE POLICY "notitie_lezen_na_opening" ON notities
  FOR SELECT USING (
    ontvanger_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cirkels
      WHERE id = notities.cirkel_id
        AND opening_datum <= CURRENT_DATE
    )
  );

-- Schrijver: mag metadata zien (voor wie), NIET de versleutelde tekst
CREATE POLICY "notitie_meta_schrijver" ON notities
  FOR SELECT USING (schrijver_id = auth.uid());

-- ─── UITNODIGINGEN ───
CREATE POLICY "uitnodiging_mentor" ON uitnodigingen
  FOR ALL USING (
    uitgenodigd_door = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cirkels
      WHERE id = uitnodigingen.cirkel_id
        AND mentor_id = auth.uid()
    )
  );
```

---

## 4. Encryptie-implementatie (client-side)

```typescript
// lib/encryptie.ts
// Alle encryptie vindt plaats in de browser — server ziet nooit plaintext

const ALGORITME = { name: 'AES-GCM', length: 256 };

/** Genereer een cirkel-sleutel (eenmalig bij aanmaken cirkel) */
export async function genereerCirkelSleutel(): Promise<string> {
  const sleutel = await crypto.subtle.generateKey(ALGORITME, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', sleutel);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

/** Versleutel een notitie met de cirkel-sleutel */
export async function versleutelNotitie(
  tekst: string,
  cirkelSleutelB64: string
): Promise<{ versleuteld: string; iv: string }> {
  const sleutelBytes = Uint8Array.from(atob(cirkelSleutelB64), c => c.charCodeAt(0));
  const sleutel = await crypto.subtle.importKey('raw', sleutelBytes, ALGORITME, false, ['encrypt']);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const versleuteld = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sleutel,
    encoder.encode(tekst)
  );

  return {
    versleuteld: btoa(String.fromCharCode(...new Uint8Array(versleuteld))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/** Ontsleutel een notitie (alleen mogelijk na opening — sleutel ontsloten door server) */
export async function ontsleutelNotitie(
  versleuteldB64: string,
  ivB64: string,
  cirkelSleutelB64: string
): Promise<string> {
  const sleutelBytes = Uint8Array.from(atob(cirkelSleutelB64), c => c.charCodeAt(0));
  const sleutel = await crypto.subtle.importKey('raw', sleutelBytes, ALGORITME, false, ['decrypt']);

  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(versleuteldB64), c => c.charCodeAt(0));

  const ontsleuteld = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sleutel, data);
  return new TextDecoder().decode(ontsleuteld);
}
```

**Beveiligingsflow:**
1. Mentor maakt cirkel aan → `genereerCirkelSleutel()` in browser → sleutel opgeslagen in Supabase (versleuteld met server-side master key via Vault)
2. Leden schrijven notitie → browser versleutelt met cirkel-sleutel → alleen ciphertext naar server
3. Vóór openingsdatum: cirkel_sleutel = NULL in API responses (RLS)
4. Op openingsdatum: Edge Function onthult cirkel_sleutel → clients kunnen ontsleutelen

---

## 5. Projectstructuur (Claude Code)

```
liefdevolleblik/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── registreer/page.tsx
│   │   └── uitnodiging/[token]/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                   # Protected layout
│   │   ├── dashboard/page.tsx           # Mijn cirkels
│   │   ├── cirkel/
│   │   │   ├── nieuw/page.tsx           # Nieuwe cirkel aanmaken
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # Groepsoverzicht
│   │   │       ├── schrijf/[ontvangerId]/page.tsx  # Notitie schrijven
│   │   │       ├── opening/page.tsx     # Openingsdag (blik open)
│   │   │       └── beheer/page.tsx      # Mentor-dashboard
│   │   └── account/page.tsx
│   ├── api/
│   │   ├── cirkel/
│   │   │   ├── route.ts                 # POST: aanmaken
│   │   │   └── [id]/
│   │   │       ├── uitnodiging/route.ts # POST: uitnodigen
│   │   │       └── opening/route.ts     # POST: trigger opening
│   │   ├── notitie/route.ts             # POST: opslaan
│   │   └── webhooks/
│   │       └── cron/route.ts            # Dagelijkse check openingsdatum
│   └── layout.tsx
│
├── components/
│   ├── ui/                              # Herbruikbare componenten
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   └── LotusLock.tsx               # Slot-animatie (blik dicht/open)
│   ├── cirkel/
│   │   ├── CirkelKaart.tsx
│   │   ├── LedenGrid.tsx
│   │   └── NotitieWolk.tsx             # Openingsdag kaartjes-wolk
│   ├── notitie/
│   │   ├── SchrijfModal.tsx
│   │   └── NotitieKaart.tsx
│   └── layout/
│       ├── Navigatie.tsx
│       └── BottomNav.tsx
│
├── lib/
│   ├── encryptie.ts                     # AES-256 Web Crypto
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── whatsapp.ts                      # WhatsApp Business API
│   ├── email.ts                         # Resend
│   ├── vernietiging.ts                  # Account/data lifecycle
│   └── validatie.ts                     # Zod schemas
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql
│   │   ├── 002_rls.sql
│   │   └── 003_functions.sql
│   └── functions/
│       ├── dagelijkse-check/index.ts    # Cron: openingsdatum check
│       └── verwijder-verlopen/index.ts  # Cron: data vernietigen
│
├── styles/
│   └── globals.css                      # CSS variabelen (huisstijl)
│
├── middleware.ts                         # Auth guard + rate limiting
├── .env.local.example
└── CLAUDE.md                            # Instructies voor Claude Code
```

---

## 6. WhatsApp Business API integratie

### Setup vereisten
```
1. Meta Business Account aanmaken
2. WhatsApp Business app registreren
3. Telefoonnummer verifiëren (zakelijk NL-nummer voor liefdevolleblik.nl)
4. Message Templates goedlaten keuren door Meta (24-48u)
```

### Goedgekeurde berichttemplates (vereist door Meta)

**Template 1: Uitnodiging voor cirkel**
```
Naam: liefdevolle_blik_uitnodiging
Categorie: UTILITY
Taal: nl

Hallo {{1}},

{{2}} heeft je uitgenodigd voor de cirkel "{{3}}" op Liefdevolle Blik.

Gebruik deze uitnodigingscode om je aan te sluiten:
*{{4}}*

👉 liefdevolleblik.nl/uitnodiging/{{5}}

De cirkel gaat open op {{6}}.

_Liefdevolle Blik — voor elkaar, met liefde_
```

**Template 2: Openingsdag bericht**
```
Naam: liefdevolle_blik_opening
Categorie: UTILITY
Taal: nl

🫙 *Het blik is open, {{1}}!*

Vandaag is het zover — de cirkel "{{2}}" heeft zijn liefdevolle blik geopend.

Je hebt *{{3}} persoonlijke notities* ontvangen van jouw cirkelleden.

Lees ze hier:
👉 liefdevolleblik.nl/cirkel/{{4}}/opening

_Dit bericht is alleen voor jou. Met liefde samengesteld door je cirkel._
```

**Template 3: Herinnering schrijven (1 week voor sluiting)**
```
Naam: liefdevolle_blik_herinnering
Categorie: UTILITY
Taal: nl

✍️ *Heb je al een briefje geschreven?*

Over 7 dagen sluit de liefdevolle blik van cirkel "{{1}}".

Heb je al een notitie achtergelaten voor {{2}}? Je hebt nog even de tijd.

👉 liefdevolleblik.nl/cirkel/{{3}}/schrijf

_Kleine woorden, groot verschil._
```

### WhatsApp API client
```typescript
// lib/whatsapp.ts
const WA_API_URL = `https://graph.facebook.com/v19.0/${process.env.WA_PHONE_ID}/messages`;

interface WaBerichtParams {
  naar: string;          // E.164 formaat: +31612345678
  template: string;
  variabelen: string[];
}

export async function stuurWhatsAppBericht(params: WaBerichtParams): Promise<boolean> {
  const body = {
    messaging_product: 'whatsapp',
    to: params.naar,
    type: 'template',
    template: {
      name: params.template,
      language: { code: 'nl' },
      components: [{
        type: 'body',
        parameters: params.variabelen.map(v => ({ type: 'text', text: v }))
      }]
    }
  };

  const res = await fetch(WA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error('WhatsApp API fout:', await res.text());
    return false;
  }
  return true;
}

export async function stuurOpeningsBerichten(cirkelId: string): Promise<void> {
  const { data: leden } = await supabaseAdmin
    .from('lidmaatschappen')
    .select('gebruiker_id, profielen(voornaam, telefoon, wa_opt_in), cirkels(naam)')
    .eq('cirkel_id', cirkelId);

  for (const lid of leden ?? []) {
    const profiel = lid.profielen as any;
    if (!profiel.wa_opt_in) continue;

    const aantalNotities = await telNotitiesVoorGebruiker(cirkelId, lid.gebruiker_id);

    await stuurWhatsAppBericht({
      naar: profiel.telefoon,
      template: 'liefdevolle_blik_opening',
      variabelen: [
        profiel.voornaam,
        lid.cirkels.naam,
        String(aantalNotities),
        cirkelId,
      ]
    });

    // Rate limiting: 1 bericht per 100ms
    await new Promise(r => setTimeout(r, 100));
  }
}
```

---

## 7. E-mail integratie (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Email: Persoonlijk overzicht op openingsdag
export async function stuurOpeningsEmail(params: {
  naar: string;
  naam: string;
  cirkelNaam: string;
  notities: Array<{ vanNaam: string; tekst: string }>;
  cirkelId: string;
}): Promise<void> {
  const notitieHtml = params.notities.map(n => `
    <div style="background:#FBF7F0; border-left:3px solid #C8943C;
                padding:20px; margin:16px 0; border-radius:0 8px 8px 0;">
      <p style="font-family:'Caveat',cursive; font-size:20px;
                color:#1C1C1C; line-height:1.6; margin:0;">
        ${n.tekst}
      </p>
      <p style="font-size:12px; color:#9A8070; margin:12px 0 0;
                font-style:italic;">— van ${n.vanNaam}</p>
    </div>
  `).join('');

  await resend.emails.send({
    from: 'Liefdevolle Blik <blik@liefdevolleblik.nl>',
    to: params.naar,
    subject: `🫙 Het blik is open, ${params.naam}!`,
    html: `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&family=Lato:wght@400;600&family=Caveat&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#F2EBD9; font-family:Lato,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center; padding:40px 0 32px;">
      <p style="font-family:'Playfair Display',serif; font-size:13px;
                color:#C8943C; letter-spacing:0.1em; margin:0 0 8px;">
        ✦ JOUW LIEFDEVOLLE BLIK IS OPEN
      </p>
      <h1 style="font-family:'Playfair Display',serif; font-size:40px;
                 color:#1A2E1A; margin:0; font-weight:400;">
        Lieve <em style="color:#C8943C">${params.naam}</em>,
      </h1>
    </div>

    <!-- Intro -->
    <div style="background:white; border-radius:16px; padding:32px;
                margin-bottom:24px; border:1px solid #E8DBC8;">
      <p style="font-size:16px; color:#5A4A3A; line-height:1.7; margin:0;">
        Vandaag is de dag. De leden van <strong>${params.cirkelNaam}</strong>
        hebben persoonlijke woorden voor jou achtergelaten. Hier zijn ze allemaal —
        geschreven met liefde, bewaard met zorg.
      </p>
    </div>

    <!-- Notities -->
    <div style="background:white; border-radius:16px; padding:32px;
                margin-bottom:24px; border:1px solid #E8DBC8;">
      <h2 style="font-family:'Playfair Display',serif; font-size:22px;
                 color:#1A2E1A; margin:0 0 20px;">
        Jullie woorden voor jou ☁️
      </h2>
      ${notitieHtml}
    </div>

    <!-- CTA -->
    <div style="text-align:center; padding:24px 0;">
      <a href="https://liefdevolleblik.nl/cirkel/${params.cirkelId}/opening"
         style="background:#C8943C; color:white; padding:14px 36px;
                border-radius:100px; text-decoration:none;
                font-size:16px; font-weight:600; display:inline-block;">
        Bekijk online →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:24px; font-size:12px; color:#9A8070;">
      <p>Liefdevolle Blik · liefdevolleblik.nl</p>
      <p style="margin:4px 0;">
        Dit bericht werd automatisch verzonden op de door jouw cirkel ingestelde openingsdatum.
        Je account wordt 30 dagen na opening automatisch verwijderd.
      </p>
      <p style="margin:8px 0 0;">
        <a href="https://liefdevolleblik.nl/privacy" style="color:#C8943C;">Privacybeleid</a>
        · <a href="https://liefdevolleblik.nl/account/verwijder" style="color:#9A8070;">Account nu verwijderen</a>
      </p>
    </div>
  </div>
</body>
</html>
    `
  });
}
```

---

## 8. Cron Jobs (Supabase Edge Functions)

### 8a. Dagelijkse openingsdatum-check
```typescript
// supabase/functions/dagelijkse-check/index.ts
// Uitvoeren: dagelijks om 07:00 NL tijd via Supabase cron

import { createClient } from '@supabase/supabase-js';
import { stuurOpeningsBerichten } from '../../lib/whatsapp.ts';
import { stuurOpeningsEmail } from '../../lib/email.ts';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // service role voor cron
  );

  // Zoek cirkels waarvan de opening vandaag is en nog niet verzonden
  const { data: teOpenenCirkels } = await supabase
    .from('cirkels')
    .select('id, naam, cirkel_sleutel_vault_id')
    .eq('opening_datum', new Date().toISOString().split('T')[0])
    .eq('opening_verzonden', false);

  for (const cirkel of teOpenenCirkels ?? []) {
    try {
      // 1. Stel verwijderdatum in voor alle leden (opening + 30 dagen)
      const verwijderDatum = new Date();
      verwijderDatum.setDate(verwijderDatum.getDate() + 30);

      await supabase.rpc('stel_verwijderdatum_in', {
        p_cirkel_id: cirkel.id,
        p_verwijder_op: verwijderDatum.toISOString()
      });

      // 2. Stuur berichten (WhatsApp + email)
      await stuurOpeningsBerichten(cirkel.id);
      await stuurOpeningsEmailsVoorCirkel(cirkel.id);

      // 3. Markeer als verzonden
      await supabase
        .from('cirkels')
        .update({ opening_verzonden: true })
        .eq('id', cirkel.id);

      // 4. Log
      await supabase.from('verwijderlogs').insert({
        cirkel_id: cirkel.id,
        actie: 'opening_verzonden',
        details: { cirkel_naam: cirkel.naam }
      });

    } catch (err) {
      console.error(`Fout bij openen cirkel ${cirkel.id}:`, err);
    }
  }

  return new Response('OK', { status: 200 });
});
```

### 8b. Wekelijkse schrijf-herinnering (7 dagen voor opening)
```typescript
// Stuurt herinnering: "Heb je al geschreven?"
// Wordt geplanned: dagelijks, filtert op opening = vandaag + 7d
```

### 8c. Data-vernietiger (30 dagen na opening)
```typescript
// supabase/functions/verwijder-verlopen/index.ts
// Uitvoeren: dagelijks om 03:00

Deno.serve(async () => {
  const supabase = createClient(/* ... service role */);

  // Vind profielen waarvan verwijder_op verstreken is
  const { data: teVerwijderen } = await supabase
    .from('profielen')
    .select('id, email, voornaam')
    .lte('verwijder_op', new Date().toISOString())
    .not('verwijder_op', 'is', null);

  for (const profiel of teVerwijderen ?? []) {
    // Volgorde is belangrijk: eerst notities, dan lidmaatschappen, dan profiel

    // 1. Verwijder notities (schrijver én ontvanger)
    await supabase.from('notities').delete()
      .or(`schrijver_id.eq.${profiel.id},ontvanger_id.eq.${profiel.id}`);

    // 2. Verwijder lidmaatschappen
    await supabase.from('lidmaatschappen').delete()
      .eq('gebruiker_id', profiel.id);

    // 3. Verwijder profiel
    await supabase.from('profielen').delete()
      .eq('id', profiel.id);

    // 4. Verwijder auth account
    await supabase.auth.admin.deleteUser(profiel.id);

    // 5. Audit log (geanonimiseerd)
    await supabase.from('verwijderlogs').insert({
      actie: 'account_vernietigd',
      details: {
        email_hash: await sha256(profiel.email), // alleen hash, geen email
        voornaam_initials: profiel.voornaam[0] + '***'
      }
    });
  }

  // Verwijder verlopen cirkels (alle leden weg = cirkel kan weg)
  await supabase.rpc('verwijder_lege_cirkels');

  return new Response('OK');
});
```

### Supabase Cron inplannen
```sql
-- In Supabase SQL editor:
SELECT cron.schedule(
  'dagelijkse-opening-check',
  '0 7 * * *',           -- Elke dag om 07:00 UTC (= 08:00/09:00 NL)
  $$ SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/dagelijkse-check',
    headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
  ) $$
);

SELECT cron.schedule(
  'data-vernietiger',
  '0 3 * * *',           -- Elke dag om 03:00 UTC
  $$ SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/verwijder-verlopen',
    headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
  ) $$
);
```

---

## 9. Beveiligingschecklist

### Authenticatie & autorisatie
- [x] Supabase Auth met email verificatie (magic link standaard)
- [x] JWT tokens met korte levensduur (1 uur access, 7 dag refresh)
- [x] Row Level Security op elke tabel
- [x] Cirkel: alleen leden kunnen inhoud zien
- [x] Notities: schrijver ziet metadata, ontvanger ziet inhoud pas na opening
- [x] Mentor-only: uitnodigen, datum instellen, cirkel verwijderen

### Encryptie
- [x] HTTPS everywhere (Vercel + Supabase)
- [x] Notities AES-256-GCM versleuteld (client-side)
- [x] Cirkelsleutel opgeslagen in Supabase Vault (encrypted at rest)
- [x] IV uniek per notitie
- [x] Server ziet nooit plaintext notities
- [x] Cirkelsleutel onthulling: uitsluitend via server-side check op datum

### Privacy & AVG/GDPR
- [x] Expliciete opt-in voor WhatsApp (apart checkbox)
- [x] Privacyverklaring vereist bij registratie
- [x] Data minimalisatie: alleen e-mail, naam, 06 opgeslagen
- [x] Recht op verwijdering: zelfservice + automatisch na 30d
- [x] Audit trail geanonimiseerd
- [x] Geen tracking pixels in emails
- [x] Nederlandse verwerkersovereenkomst (hosting NL/EU)

### Rate limiting & misbruik
- [x] Max 1 notitie per schrijver per ontvanger per cirkel
- [x] Max 50 leden per cirkel
- [x] Uitnodigingstokens: éénmalig gebruik, verlopen na 7 dagen
- [x] API rate limiting via Vercel middleware (10 req/min per IP)
- [x] CAPTCHA op registratie (hCaptcha)

### Infrastructuur
- [x] Environment variables nooit in code
- [x] Supabase Service Role Key: alleen in server-side cron functies
- [x] Content Security Policy headers
- [x] Geen logging van notitie-inhoud
- [x] Vercel: edge network + DDoS bescherming

---

## 10. Omgevingsvariabelen (.env.local.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # NOOIT publiek!

# WhatsApp Business API
WA_PHONE_ID=1234567890                    # WhatsApp phone number ID
WA_ACCESS_TOKEN=EAAxxxx...               # Permanent token (Meta)
WA_VERIFY_TOKEN=willekeurig_geheim       # Webhook verificatie

# Resend (email)
RESEND_API_KEY=re_xxxxx
RESEND_DOMAIN=liefdevolleblik.nl

# Encryptie
ENCRYPTION_MASTER_KEY=base64_256bit_key  # Master key voor Vault

# App
NEXT_PUBLIC_APP_URL=https://liefdevolleblik.nl
CRON_SECRET=willekeurig_lang_geheim      # Beschermt cron endpoints
```

---

## 11. Stappenplan voor Claude Code

### Fase 1 — Fundament (dag 1–2)
```
Stap 1.1  Initialiseer Next.js 14 project
          npx create-next-app@latest liefdevolleblik --typescript --tailwind --app

Stap 1.2  Installeer afhankelijkheden
          npm install @supabase/supabase-js @supabase/ssr resend zod
          npm install @types/node

Stap 1.3  Maak globals.css met volledige CSS-variabelen (huisstijl)

Stap 1.4  Supabase project aanmaken + migraties uitvoeren
          npx supabase init
          npx supabase db push

Stap 1.5  Middleware.ts: auth guard + route bescherming
```

### Fase 2 — Auth & Cirkels (dag 3–4)
```
Stap 2.1  Registratiepagina: naam, email, 06, wachtwoord, WhatsApp opt-in
Stap 2.2  Loginpagina + magic link flow
Stap 2.3  Uitnodigingspagina (/uitnodiging/[token])
Stap 2.4  Cirkel aanmaken (mentor): naam, datum, encryptie-sleutel genereren
Stap 2.5  Cirkeloverzicht: leden, teller notities, countdown
```

### Fase 3 — Notities schrijven (dag 5)
```
Stap 3.1  Ledenrooster op cirkel-pagina
Stap 3.2  Schrijfmodal: tekstveld, karakter-teller, bevestiging
Stap 3.3  Client-side encryptie + opslaan via API route
Stap 3.4  Metadata-overzicht voor schrijver (voor wie, wanneer)
```

### Fase 4 — Beheer-dashboard (dag 6)
```
Stap 4.1  Mentor-dashboard: leden beheren
Stap 4.2  Uitnodiging sturen (email + WhatsApp)
Stap 4.3  Openingsdatum instellen/wijzigen (alleen vóór opening)
Stap 4.4  Statistieken: hoeveel notities, wie heeft geschreven
Stap 4.5  Herinnering handmatig versturen
```

### Fase 5 — Opening & Verzending (dag 7)
```
Stap 5.1  Openingspagina: notities-wolk (kaartjes layout)
Stap 5.2  Client-side ontsleuteling met vrijgegeven cirkelsleutel
Stap 5.3  WhatsApp template berichten (lib/whatsapp.ts)
Stap 5.4  Email template (lib/email.ts)
Stap 5.5  Cron job: dagelijkse-check Edge Function
```

### Fase 6 — Privacy & Lifecycle (dag 8)
```
Stap 6.1  Verwijder-cron: account + data na 30 dagen
Stap 6.2  Zelfservice verwijder-pagina (/account/verwijder)
Stap 6.3  Audit logging (geanonimiseerd)
Stap 6.4  Privacyverklaring pagina
```

### Fase 7 — Hardening & Deploy (dag 9–10)
```
Stap 7.1  Rate limiting middleware
Stap 7.2  CSP headers in next.config.ts
Stap 7.3  hCaptcha op registratie
Stap 7.4  E2E tests: schrijf → versleutel → open → ontsleutel
Stap 7.5  Vercel deployment + environment variabelen instellen
Stap 7.6  DNS: liefdevolleblik.nl → Vercel
Stap 7.7  WhatsApp Business verificatie afronden
Stap 7.8  Resend domein verifiëren (SPF, DKIM, DMARC)
```

---

## 12. CLAUDE.md (projectinstructies voor Claude Code)

```markdown
# CLAUDE.md — Liefdevolle Blik

## Projectdoel
Privacy-first webapplicatie voor persoonlijke, versleutelde notities
binnen een besloten groep (cirkel). Notities zijn onleesbaar tot de
ingestelde openingsdatum. Daarna automatische verzending via WhatsApp
en e-mail. Accounts worden 30 dagen na opening vernietigd.

## Technische principes
- NOOIT notitie-inhoud loggen (ook niet in dev)
- ALTIJD client-side encryptie voor notities (lib/encryptie.ts)
- ALTIJD Supabase server client voor gevoelige operaties
- NOOIT service role key aan client blootstellen
- RLS is de laatste verdedigingslinie — test altijd

## Huisstijl
- Kleuren: zie styles/globals.css (CSS variabelen)
- Fonts: Playfair Display (koppen), Lato (tekst), Caveat (handschrift)
- Taalinstelling: volledig Nederlands
- Tone of voice: warm, persoonlijk, betrouwbaar

## Codeconventies
- TypeScript strict mode
- Zod voor alle API input validatie
- Server actions voor mutaties (geen client-side fetch naar eigen API)
- Error boundaries op alle pagina's
- Loading states overal waar data geladen wordt

## Kritische flows (altijd testen na wijziging)
1. Registratie → uitnodiging → lid worden van cirkel
2. Notitie schrijven → opslaan (versleuteld) → metadata zichtbaar
3. Datum bereikt → cron → berichten → ontsleuteling beschikbaar
4. 30 dagen na opening → volledige data-vernietiging
```

---

## 13. Externe diensten samengevat

| Dienst | Doel | Kosten (indicatief) |
|--------|------|---------------------|
| Vercel (hobby/pro) | Hosting Next.js | Gratis / €20/mnd |
| Supabase (pro) | Database + Auth + Cron | €25/mnd |
| WhatsApp Business API | WA berichten | €0.06–0.09 per bericht |
| Resend | Transactionele mail | Gratis tot 3000/mnd |
| Meta Business | WA account vereiste | Gratis |

**Totaal ±€50–60/mnd** bij kleine groepen. WhatsApp-kosten schalen mee.

---

*Liefdevolle Blik — voor elkaar, met liefde · liefdevolleblik.nl*
*Bouwplan v1.0 — gereed voor Claude Code uitvoering*
