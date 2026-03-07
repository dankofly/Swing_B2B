# SWING B2B Händlerportal

## Projekt-Übersicht
B2B-Katalog für **SWING Flugsportgeräte GmbH** (swing.de). Paragleiter-Händler loggen sich ein, sehen den Katalog mit ihren individuellen Preisen und senden Bestellanfragen. Preislisten werden als PDF pro Händler hochgeladen und automatisch per Gemini Vision geparst. Lagerstände kommen per CSV-Export aus dem ERP **Mesonic WinLine**.

- **Branche:** Paragleiter / Flugsport
- **Zielgruppe:** 20–100 B2B-Händler
- **Umfang:** 100–1000 Produkte
- **Website:** swing.de (WordPress/Avada)
- **B2B-Portal:** Separate App auf Subdomain (z.B. `b2b.swing.de`)

## Tech-Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (SWING CI)
- **Datenbank:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Login mit Admin-Freischaltung)
- **Storage:** Supabase Storage (Bilder, PDFs)
- **PDF-Parsing:** Gemini Vision API (Tabellen-Erkennung aus Preislisten-PDFs)
- **CSV-Import:** Custom Parser (Lagerstände aus Mesonic WinLine)
- **E-Mail:** Resend (Bestellanfrage-Benachrichtigungen)
- **Hosting:** Netlify
- **Icons:** Lucide React

## SWING Corporate Identity (Offizieller Styleguide)
```
Primärfarbe (Navy):   #173045  →  bg-swing-navy, text-swing-navy
Navy (H2/Akzent):     #1F2A55  →  bg-swing-navy-light, text-swing-navy-light
Gold (CTAs/Buttons):  #FCB923  →  bg-swing-gold, text-swing-gold
Gold Hover:           #E0A520  →  bg-swing-gold-dark
Gray:                 #D8D8D8  →  bg-swing-gray
Hintergrund:          #FFFFFF  →  bg-white
Subtil:               #F6F6F6  →  bg-swing-gray-light
Text:                 #414142  →  text-swing-gray-dark
Font:                 Montserrat (300, 400, 500, 600, 700, normal + italic)
Border-Radius:        2px (eckig, nicht rund)
Stil:                 Modern, sportlich-professionell

Typografie:
  h1 hero:  Montserrat Italic, 55px, #FCB923, letter-spacing 3.67px, uppercase → .swing-h1
  H2:       Montserrat Bold Italic, 21px, #1F2A55, letter-spacing 2px, uppercase → .swing-h2
  Copy:     Montserrat Regular, 21px, #414142, letter-spacing 0
```

## Produktstruktur
Paragleiter haben Varianten:
```
Modell (z.B. "Alpha 7")
├── Beschreibung, Bilder, Technische Daten
├── Größen: S, M, L  →  eigene SKU, eigener Preis, eigener Lagerstand
└── Farbdesigns: A, B, C  →  nur Auswahl, kein Preisunterschied
```

## Datenbank-Tabellen
- `companies` — B2B-Händler (mit is_approved Freischaltung)
- `profiles` — Benutzer (verknüpft mit Supabase Auth, Rollen: superadmin/admin/buyer)
- `categories` — Produktkategorien (Baumstruktur)
- `products` — Paragleiter-Modelle
- `product_sizes` — Größenvarianten (SKU, Lagerstand, Lieferzeit)
- `product_colors` — Farbdesigns (Bild, kein eigener Preis)
- `customer_prices` — Individuelle Preise pro Händler + Größe
- `price_uploads` — PDF/CSV Upload-Log mit Parsing-Ergebnis
- `stock_imports` — Lagerstand-Import-Log
- `inquiries` — Bestellanfragen
- `inquiry_items` — Anfrage-Positionen (Größe + Farbe + Menge)

Das vollständige Schema liegt in `supabase/schema.sql` inkl. Row-Level-Security-Policies und Auto-Profile-Trigger.

## Projekt-Struktur
```
src/
├── middleware.ts                       # Auth-Schutz für Routen
├── lib/supabase/
│   ├── client.ts                       # Browser Supabase Client
│   ├── server.ts                       # Server Supabase Client
│   └── middleware.ts                   # Session-Management
├── components/ui/
│   └── Header.tsx                      # Navigation (Admin + Katalog Modus)
└── app/
    ├── globals.css                     # Tailwind + SWING CI Variablen
    ├── layout.tsx                      # Root Layout (deutsch, Montserrat)
    ├── page.tsx                        # Landing Page
    ├── (auth)/
    │   ├── login/page.tsx              # Händler-Login
    │   └── register/page.tsx           # Händler-Registrierung (mit Firmen-Daten)
    ├── (admin)/admin/
    │   ├── layout.tsx                  # Admin Layout mit Header
    │   ├── page.tsx                    # Admin Dashboard
    │   ├── produkte/                   # TODO: Produkte CRUD
    │   ├── kunden/                     # TODO: Kunden-Verwaltung
    │   ├── preislisten/                # TODO: PDF-Upload + Gemini Parsing
    │   ├── lager/                      # TODO: CSV-Import aus WinLine
    │   └── anfragen/                   # TODO: Anfragen-Übersicht
    └── (katalog)/katalog/
        ├── layout.tsx                  # Katalog Layout mit Header
        ├── page.tsx                    # Produktkatalog (Grid + Suche)
        ├── [slug]/                     # TODO: Produktdetail
        ├── warenkorb/                  # TODO: Warenkorb
        └── anfragen/                   # TODO: Anfrage-Historie
```

## Features & Pipelines

### PDF-Preislisten-Parsing (Gemini Vision)
```
PDF Upload → Gemini Vision API (Tabelle erkennen)
→ Strukturierte Daten: SKU | Bezeichnung | Preis
→ SKU-Matching gegen product_sizes.sku
→ Vorschau: ✅ Match | ⚠️ Unsicher | ❌ Nicht gefunden
→ Admin bestätigt → customer_prices aktualisiert
```

### CSV-Lagerstand-Import (Mesonic WinLine)
```
CSV Upload → Spalten-Mapping (SKU, Bestand, Lieferzeit)
→ SKU-Matching gegen product_sizes.sku
→ Vorschau → Bestätigen → stock_quantity aktualisiert
```

### Lagerampel
- Grün: >10 Stk. verfügbar
- Gelb: 1–10 Stk.
- Rot: 0 Stk. + Lieferzeit in Tagen

### Bestellanfrage-Flow
Warenkorb → Anfrage absenden (mit Notiz) → E-Mail an Vertrieb + Bestätigung an Händler → Admin ändert Status → Händler sieht Update

## Implementierungs-Phasen

### Phase 1: Grundgerüst + Auth ✅
- [x] Next.js + Tailwind + SWING CI
- [x] Supabase Schema + RLS + Auth
- [x] Login / Registrierung
- [x] Admin + Katalog Layouts
- [x] Netlify Config

### Phase 2: Produktkatalog (nächster Schritt)
- [ ] Admin: Produkte CRUD (Modell + Größen + Farben)
- [ ] Admin: Bild-Upload (Supabase Storage)
- [ ] Katalog-Ansicht für Kunden (Grid mit Filtern)
- [ ] Produktdetailseite (Größen-/Farbauswahl)

### Phase 3: Preise + Lager
- [ ] Admin: PDF-Upload + Gemini-Parsing + Vorschau + Bestätigung
- [ ] Admin: CSV-Import für Lagerstände aus WinLine
- [ ] Kundenansicht: Individuelle Preise + Lagerampel

### Phase 4: Warenkorb + Anfragen
- [ ] Warenkorb (localStorage + DB-Sync)
- [ ] Bestellanfrage absenden
- [ ] E-Mail-Benachrichtigungen (Resend)
- [ ] Anfrage-Historie für Kunden
- [ ] Admin: Anfragen-Übersicht + Status

### Phase 5: Polish + Go-Live
- [ ] Responsive Design
- [ ] Error-Handling, Loading-States
- [ ] CI-Feinschliff
- [ ] Netlify Production Deployment

## Konventionen
- Sprache UI: **Deutsch**
- Sprache Code: **Englisch** (Variablen, Funktionen, Kommentare)
- Alle Preise in EUR, DECIMAL(10,2)
- SKUs sind eindeutig pro Größenvariante
- Kein Dark Mode (nur Light)
- Border-Radius: immer `rounded` (2px), nie `rounded-full` für Buttons
- Buttons: `bg-swing-gold text-swing-navy hover:bg-swing-gold-dark font-semibold`
- Links: `text-swing-navy hover:text-swing-gold`

## Umgebungsvariablen (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=vertrieb@swing.de
```

## Kosten (monatlich)
- Start: ~0€ (alles im Free Tier)
- Bei Wachstum: ~65€ (Supabase 25€ + Netlify 19€ + Resend 20€)
