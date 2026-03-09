# SWING B2B Händlerportal — Feature-Übersicht

---

## Kundenbereich (Händler)

### Authentifizierung
- **Registrierung** — Firmendaten, Kontaktperson, Adresse, Produktkategorien, Passwort (26-Länder-Dropdown)
- **Login** — E-Mail + Passwort
- **Passwort vergessen** — Reset-Link per E-Mail
- **Passwort zurücksetzen** — Neues Passwort mit automatischer Weiterleitung

### Landing Page
- Hero-Bereich mit SWING Branding und dekorativen Ringen
- Feature-Karten (Individuelle Preise, Lagerampel, Bestellanfragen)
- Login/Registrierung CTAs
- Footer mit Impressum, Datenschutz, swing.de Link

### Produktkatalog
- **Produktübersicht** — Responsive Grid (1/2/3 Spalten)
- **Volltextsuche** — Nach Produktnamen
- **Schnelle Kategorie-Tabs** — Paragleiter, Tandem, Motor, Miniwings, Speedflying, Parakites, Gurtzeuge, Rettungen, Zubehör
- **Erweiterte Filter** — EN-Klasse (A–D), Gewichtsklasse (N-LITE, D-LITE, U-LITE)
- **Lagerampel pro Größe** — Grün (>10), Gelb (1–10), Rot (0)
- **Badges** — Coming Soon, Preorder, Fade Out, Limited Edition, EN-Klasse, Gewichtsklasse
- **Produktkarten** — Navy-Gradient-Header, Beschreibung, Größen-Badges, Farb-Anzahl

### Produktdetail
- **Hero** — Kategorie, Name, Beschreibung, Status-Badges, Website-Link
- **Technische Daten** — Spec-Karte (filtert EN-Zertifizierung raus)
- **Farbdesign-Auswahl** — Bildergalerie mit Limited-Edition-Badge, Hover-Zoom
- **Größen-/Preistabelle** — Individuelle EK-Preise, UVP-Vergleich, Rabatt %, Lieferzeit
- **Lagerampel** — Verfügbar / Nur X Stk. / Ausverkauft / Lieferzeit in Wochen
- **Warenkorb-Integration** — Mengenauswahl + animiertes Feedback (Checkmark)

### Warenkorb
- **Artikelübersicht** — Gruppiert nach Produkt + Farbdesign
- **Mengen bearbeiten** — Live-Update der Summen
- **Positionen löschen** — Per Klick
- **Zusammenfassung** — Positionen, Gesamtmenge, Netto-Gesamtpreis
- **Notizfeld** — Freitext für Bestellhinweise
- **Anfrage absenden** — Ladezustand + Erfolgsmeldung mit "Was passiert jetzt"-Erklärung
- **Responsive** — Tabelle Desktop, Karten Mobil
- **LocalStorage-Persistenz** — Bleibt bei Seitenneuladen

### Bestellanfragen
- **Anfrage-Historie** — Chronologische Übersicht aller Bestellanfragen
- **Status-Stepper** — 4-Schritte-Fortschritt (Neu → In Bearbeitung → Versendet → Abgeschlossen)
- **Detail-Ansicht** — Aufklappbar mit Positionen, Preisen, Mengen, Summen
- **Tracking-Info** — Versanddienstleister + Sendungsnummer (kopierbar)
- **Zeitstempel** — Pro Status-Änderung

### Dashboard
- **Willkommensnachricht** — Personalisiert mit Vorname
- **KPI-Karten** — Gesamtanfragen, Gesamtwert (EUR), Offene Anfragen, Versendet/Abgeschlossen
- **Firmendaten** — Name, Typ, Freischaltungsstatus, Produktkategorien
- **Statusverteilung** — Animierter Fortschrittsbalken mit Legende
- **Kundennotizen** — Vom Admin sichtbar geschaltete Hinweise
- **Letzte Anfragen** — Die 5 neuesten mit Schnellzugriff
- **Kontaktleiste** — Telefon, E-Mail, Geschäftszeiten

### Profil
- **Firmendaten bearbeiten** — Name, USt-ID
- **Kontaktdaten** — Ansprechpartner, E-Mail, Telefon (WhatsApp-Option)
- **Adresse** — Straße, PLZ, Ort, Land (26-Länder-Dropdown)

### Navigation & UI
- **Header** — SWING Logo, Katalog, Dashboard, Anfragen, Profil, Warenkorb (mit Zähler)
- **Sprachumschaltung** — Deutsch, Englisch, Französisch (Cookie-basiert)
- **Footer** — Impressum, Datenschutz, swing.de, Sprachumschaltung

---

## Admin-Bereich

### Dashboard
- **KPI-Karten** — Produkte (aktiv/coming soon/preorder), Lager (verfügbar/niedrig/ausverkauft), Anfragen (pro Status/Monat), Kunden (nach Typ)
- **Letzte Anfragen** — Die 6 neuesten mit Status, Firma, Kontakt
- **Weltzeituhr** — Wien, Tokio, New York, Sydney

### Produktverwaltung
- **Produktliste** — Sortierbar mit Drag-and-Drop Reihenfolge
- **Produkt erstellen/bearbeiten** — Name, Slug, Beschreibung, Kategorie, Status-Flags, EN-Klasse, Gewichtsklasse, Einsatzzweck, Website-URL
- **Größenvarianten** — Label, SKU, Lieferzeit (Wochen), Sortierung
- **Farbdesigns** — Name, Bild-Upload, Limited Edition Flag, Sortierung
- **Lager-Matrix** — Farbe × Größe Bestandseditor pro Produkt
- **Aktivieren/Deaktivieren** — Produkt ein-/ausblenden
- **Löschen** — Mit Kaskade (Sizes, Colors, Prices)

### Kundenverwaltung
- **Kundenliste** — Alle Firmen mit Suche/Filter
- **Kunde erstellen** — Manuelle Anlage
- **Kundendetail:**
  - Stammdaten (Adresse, Kontakt, USt-ID, Benutzer)
  - Freischaltung (Toggle)
  - Google Maps Standort
  - Lokale Zeitzone des Kunden
  - WhatsApp Quick-Link
  - Preislisten-Historie (Upload, Download, Löschen)
  - Interne Notizen (mit Sichtbarkeit für Kunden steuerbar)
  - Kanban-Board für Anfragen (Drag & Drop)
  - Firmenstatistiken
- **Katalog als Kunde ansehen** — Admin sieht Katalog mit Kundenpreisen + Banner-Kennzeichnung auf allen Seiten

### Preislisten (Gemini Vision AI)
- **PDF-Upload** — Preislisten als PDF hochladen
- **Gemini Vision Parsing** — Automatische Tabellenerkennung (Modell, UVP, EK, Größen, Rabatt)
- **SKU-Matching** — Automatische Zuordnung zu Katalog-Produkten
- **Vorschau** — Zugeordnet ✅ / Nicht gefunden ❌
- **Bestätigung** — Admin prüft und speichert → customer_prices aktualisiert

### Lagerbestand
- **Übersichtskacheln** — Gesamtbestand, Verfügbar (>10), Niedrig (1–10), Ausverkauft
- **Komplette Produktübersicht** — Aufklappbare Produktliste mit Ampel-Badges, SKU, Suche, Filter (Alle/Niedrig/Ausverkauft)
- **CSV-Import (Mesonic WinLine)** — Bestandsliste hochladen, Gemini AI parst ERP-Bezeichnungen, automatische Zuordnung, Vorschau + Bestätigung

### Anfragen-Verwaltung
- **Anfragenliste** — Alle Kundenanfragen mit Status, Positionen, Werten
- **Status ändern** — Neu → In Bearbeitung → Versendet → Abgeschlossen (mit Zeitstempeln)
- **Tracking-Daten** — Versanddienstleister + Sendungsnummer
- **Notizen** — Interne Bearbeitungsnotizen pro Anfrage

### Admin-Profil & Rollen
- **Profilbearbeitung** — Name ändern
- **Rollenverwaltung** (nur Superadmin) — Benutzerrollen ändern (Superadmin, Admin, Buyer)

---

## Übergreifend

- **Dreisprachig** — Deutsch, Englisch, Französisch (alle UI-Texte)
- **Row-Level Security** — Supabase RLS für alle Datenbankzugriffe
- **Middleware** — Auth-Schutz + Rollenprüfung für Admin-Routen
- **Responsive Design** — Desktop + Tablet + Mobil
- **Lagerampel-System** — Grün (>10), Gelb (1–10), Rot (0) + Lieferzeit

---

## Geplante Features

### 1. KI-gestützte Datenpflege
- **Produktdaten per KI einpflegen** — Automatische Erkennung und Import von Produktinformationen aus Datenblättern, Website-Texten oder Bildern via Gemini Vision
- **Bulk-Import** — Mehrere Produkte gleichzeitig aus strukturierten Dokumenten anlegen
- **Smart Suggestions** — KI-Vorschläge für Kategorisierung, Tags und technische Daten
- **Automatische Bilderkennung** — Farbdesigns aus Produktfotos extrahieren

### 2. Mobile WebApp (PWA)
- **Progressive Web App** — Installierbar auf Smartphone, Offline-fähig
- **Push-Benachrichtigungen** — Status-Updates für Anfragen direkt aufs Handy
- **Touch-optimierte Navigation** — Swipe-Gesten, große Touch-Targets
- **Offline-Warenkorb** — Produkte auch ohne Verbindung in den Warenkorb legen
- **Barcode/QR-Scanner** — Schneller Produktzugriff per Kamera

### 3. Werbebanner & Aktionen
- **Banner-Editor** — Aktionsbanner erstellen und gestalten (Bild, Text, Link, Zeitraum)
- **Katalog-Einblendung** — Banner im Katalog-Header oder als Overlay anzeigen
- **Zeitgesteuert** — Start-/Enddatum für automatische Schaltung
- **Zielgruppen** — Banner für bestimmte Kundentypen oder Regionen
- **Aktionspreise** — Temporäre Sonderpreise mit Countdown-Anzeige

### 4. E-Mail-Benachrichtigungen (Resend)
- **Bestellbestätigung** — Automatische E-Mail an Händler nach Anfrage-Eingang
- **Statusänderungen** — E-Mail bei "In Bearbeitung", "Versendet" (mit Tracking-Link), "Abgeschlossen"
- **Admin-Benachrichtigung** — E-Mail an vertrieb@swing.de bei neuer Anfrage
- **Willkommens-E-Mail** — Nach Registrierung und Freischaltung
- **Preislisten-Update** — Benachrichtigung wenn neue Preise hinterlegt wurden
- **Lagerbestand-Warnung** — Automatische Info bei kritischen Bestandsänderungen

---

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (SWING CI) |
| Datenbank | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (Bilder, PDFs) |
| KI/PDF-Parsing | Google Gemini 2.0 Flash Vision |
| E-Mail | Resend (geplant) |
| Hosting | Netlify |
| Icons | Lucide React |
| Font | Montserrat (300–700) |
| i18n | Custom Cookie-basiert (DE/EN/FR) |

---

## Kennzahlen

| Metrik | Anzahl |
|---|---|
| Seiten/Routen | 28+ |
| Komponenten | 25+ |
| Server Actions | 8 Dateien, 25+ Funktionen |
| API-Routen | 3 |
| Datenbank-Tabellen | 14 |
| RLS-Policies | 20+ |
| Sprachen | 3 (DE/EN/FR) |
