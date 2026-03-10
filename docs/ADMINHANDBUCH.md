# SWING B2B Händlerportal — Adminhandbuch

> **Version:** 1.0 | **Stand:** 10. März 2026
> **URL:** https://swing-b2b-portal.netlify.app

---

## Inhaltsverzeichnis

1. [Anmeldung & Rollen](#1-anmeldung--rollen)
2. [Dashboard](#2-dashboard)
3. [Produktverwaltung](#3-produktverwaltung)
4. [Kundenverwaltung](#4-kundenverwaltung)
5. [Preislisten (PDF-Upload & KI-Parsing)](#5-preislisten)
6. [Lagerverwaltung (CSV-Import)](#6-lagerverwaltung)
7. [Anfragen / Bestellungen](#7-anfragen--bestellungen)
8. [Profil & Rollenverwaltung](#8-profil--rollenverwaltung)
9. [Rollenmatrix](#9-rollenmatrix)

---

## 1. Anmeldung & Rollen

### Login
Öffne `https://swing-b2b-portal.netlify.app/login` und melde dich mit deiner E-Mail an. Du erhältst einen **Magic Link** per E-Mail — kein Passwort nötig.

### Rollen

| Rolle | Beschreibung |
|-------|-------------|
| **Super Admin** | Vollzugriff. Kann andere Super Admins ernennen, alle Rollen verwalten. |
| **Admin** | Vollzugriff auf Produkte, Kunden, Lager, Anfragen. Kann Admins und Händler einladen, aber **keine** Super Admins erstellen. |
| **Händler (Buyer)** | Sieht nur den Katalog mit individuellen Preisen. Kein Zugang zum Admin-Bereich. |

---

## 2. Dashboard

**Navigation:** Admin > Dashboard (`/admin`)

Das Dashboard zeigt die wichtigsten Kennzahlen auf einen Blick:

### KPI-Karten
- **Produkte:** Aktiv, Coming Soon, Vorbestellung
- **Lager:** Verfügbar (>10), Wenig Bestand (1–10), Ausverkauft (0)
- **Anfragen:** Neu, In Bearbeitung, Versendet, Abgeschlossen (monatlich)
- **Kunden:** Händler, Importeure, Importeur-Netzwerke

### Letzte Aktivitäten
- **Letzte Anfragen:** Die 6 neuesten Bestellanfragen mit Firma, Status und Datum
- **Letzte Preislisten:** Die 5 neuesten Uploads mit Status und Download-Link

---

## 3. Produktverwaltung

**Navigation:** Admin > Produkte (`/admin/produkte`)

### Produktliste

Die Übersicht zeigt alle Produkte mit:
- Produktbild, Name, Kategorie
- Größen (mit SKU), Farben, Lagerampel
- **Drag & Drop** zum Sortieren (Reihenfolge wird automatisch gespeichert)

**Filter:** Suchfeld + Kategorie-Dropdown

**Aktionen pro Produkt:**
- Bearbeiten (Stift-Icon)
- Lagermatrix bearbeiten (Regal-Icon)
- Aktiv/Inaktiv umschalten
- Löschen (Papierkorb-Icon)

### Neues Produkt anlegen

**Button:** „Neues Produkt" oben rechts

#### Grunddaten
| Feld | Beschreibung |
|------|-------------|
| Name | Produktname (z.B. „Mirage 2 RS") |
| Slug | URL-freundlicher Name (auto-generiert) |
| Kategorie | Dropdown (Gleitschirme, Gurtzeuge, etc.) |
| Gewichtsklasse | Dropdown (Leicht, Standard, etc.) |
| EN-Klasse | Dropdown (A, B, C, D) |
| EN-Klasse (Sonderfeld) | Freitextfeld für spezielle Klassifikationen |
| Aktiv | Produkt im Katalog sichtbar |
| Coming Soon | Produkt als „Demnächst" markiert |
| Vorbestellung | Vorbestellung möglich |
| Fade Out | Auslaufmodell |

#### Sprach-Tabs (DE / EN / FR)

Jeder Tab enthält:
| Feld | Beschreibung |
|------|-------------|
| Einsatzbereich | Kurzbeschreibung des Einsatzzwecks |
| Beschreibung | Ausführliche Produktbeschreibung |
| Website-Link | Link zur Produktseite auf swing.de |
| Aktionsbeschreibung | Text für Sonderaktionen / Sales |

**KI-Übersetzung:** Der Button „Auto-Translate" übersetzt den deutschen Text automatisch per Gemini KI ins Englische und Französische.

#### Bilder
- Drag & Drop oder Klick zum Hochladen
- Mehrere Bilder möglich, per Drag & Drop sortierbar
- Erstes Bild = Hauptbild im Katalog

#### Größen (Varianten)

Jede Größe ist eine eigene Variante mit eigenem Preis und Lagerstand:

| Feld | Beschreibung |
|------|-------------|
| Größe | Bezeichnung (z.B. S, M, L, XL) |
| SKU | Eindeutige Artikelnummer |
| Lieferzeit (Wochen) | Lieferzeit bei Nicht-Verfügbarkeit |

**Aktionen:** Hinzufügen, Bearbeiten, Löschen, Drag & Drop Sortierung

#### Farben (Designs)

Farben haben keinen eigenen Preis — nur zur Auswahl:

| Feld | Beschreibung |
|------|-------------|
| Farbname | Bezeichnung (z.B. „Design A", „Sunset") |
| Farbbild | Bild der Farbvariante hochladen |
| Limitiert | Markierung als limitierte Edition |

### Lagermatrix

**Navigation:** Produkt > Lager-Icon oder `/admin/produkte/[id]/lager`

Die Lagermatrix zeigt ein Raster:
- **Spalten:** Größen (S, M, L, …)
- **Zeilen:** Farben (Design A, Design B, …)
- **Zellen:** Stückzahl (editierbar, speichert automatisch bei Verlassen des Feldes)

Dies ermöglicht die Verwaltung von farbspezifischem Lagerbestand.

---

## 4. Kundenverwaltung

**Navigation:** Admin > Kunden (`/admin/kunden`)

### Kundenliste

Zeigt alle registrierten Händler mit:
- Firmenname, E-Mail, Telefon, Adresse
- Typ-Badge (Händler / Importeur / Importeur-Netzwerk)
- Produktkategorien (Gleitschirme, Miniwings, Parakites)
- Freischaltungs-Toggle (An/Aus)

**Suche:** Nach Firmenname oder E-Mail

### Offene Freischaltungsanträge

Wenn sich ein Händler neu registriert, erscheint er oben im Bereich **„Offene Anfragen"**:

- Firmendaten, Kontaktperson, USt-IdNr.
- Adresse, Telefon (mit WhatsApp-Markierung)
- Produktkategorien
- Registrierungszeitpunkt

**Aktionen:**
- **Freischalten:** Händler erhält Zugang zum Katalog
- **Ablehnen:** Firma und verknüpfte Profile werden gelöscht

### Neuen Kunden anlegen

**Button:** „Neuen Kunden anlegen"

| Feld | Beschreibung |
|------|-------------|
| Firmenname* | Pflichtfeld |
| Firmentyp | Händler, Importeur, Importeur-Netzwerk |
| USt-IdNr. | Umsatzsteuer-ID |
| Produktkategorien | Checkboxen: Gleitschirme, Miniwings, Parakites |
| E-Mail* | Kontakt-E-Mail (Pflichtfeld) |
| Telefon | Telefonnummer |
| WhatsApp | Checkbox: Telefonnummer ist WhatsApp-fähig |
| Straße, PLZ, Ort, Land | Adressfelder |
| Ansprechpartner | Name der Kontaktperson |
| Notizen | Interne Bemerkungen |

### Kundendetailseite

**Navigation:** Klick auf Firmennamen in der Liste

Die Detailseite zeigt:

**Header:**
- Firmenname, Typ-Badge, Produktkategorien
- Buttons: Löschen, Als Katalog ansehen, Bearbeiten
- Freischaltungs-Toggle

**Drei Spalten:**

1. **Stammdaten:** Adresse, Kontakt (E-Mail, Telefon, WhatsApp), USt-IdNr., Kunde seit, Verknüpfte Benutzer
2. **Statistiken:** Anzahl Anfragen, Gesamtumsatz, Letzte Aktivität
3. **Preislisten:** Upload-Bereich für PDFs, Google Maps-Karte basierend auf Adresse

**Notizen-Bereich:** Freitextfeld für interne Notizen (speichert automatisch)

**Kanban-Board:** Alle Anfragen dieses Kunden als Drag & Drop Kanban-Board (siehe Abschnitt Anfragen)

---

## 5. Preislisten

### PDF-Upload & KI-Parsing

**Ort:** Kundendetailseite > Preislisten-Karte

#### Ablauf

1. **PDF hochladen:** Drag & Drop oder Klick auf den Upload-Bereich
2. **KI-Erkennung:** Gemini Vision API erkennt automatisch die Tabelle im PDF
3. **Vorschau prüfen:** Das System zeigt eine Vorschau mit vier Bereichen:

| Bereich | Farbe | Beschreibung |
|---------|-------|-------------|
| Zugeordnet | Grün | SKU erkannt, Preis bereit zur Übernahme |
| Überprüfung nötig | Gelb | SKU unsicher, mögliche Zuordnungen werden vorgeschlagen |
| Nicht gefunden | Rot | SKU nicht im Katalog vorhanden |
| Fehlend im PDF | Grau | Katalog-Produkte, die nicht in der Preisliste stehen |

4. **Preise bearbeiten:** UVP und EK-Netto können inline bearbeitet werden
5. **Bestätigen & Speichern:** Übernimmt die Preise in die Kunden-Preistabelle

#### Unterstützte Formate
- **PDF:** Tabellen mit Spalten wie Modell, Größe, UVP, EK
- **CSV:** Alternativ als CSV hochladbar

---

## 6. Lagerverwaltung

**Navigation:** Admin > Lager (`/admin/lager`)

### Lagerübersicht

**KPI-Karten:**
- Gesamtbestand (alle Größen)
- Verfügbar (>10 Stück) — Grün
- Wenig Bestand (1–10 Stück) — Gelb
- Ausverkauft (0 Stück) — Rot

**Produktliste:**
- Suchbar nach Produktname oder SKU
- Jedes Produkt zeigt Größen mit Ampel-Badge
- Aufklappbar für Details pro Größe
- **Filter:** Alle / Wenig Bestand / Ausverkauft

### CSV-Import aus WinLine (Mesonic)

#### Ablauf

1. **CSV hochladen:** Drag & Drop oder Klick
2. **Erkennung:** System parst die CSV und matcht SKUs gegen den Katalog
3. **Vorschau:**
   - Grün: SKU erkannt und zugeordnet
   - Rot: SKU nicht im Katalog
   - Zusammenfassung: Gesamt, Zugeordnet, Nicht zugeordnet
4. **Bestätigen:** Aktualisiert die Lagerbestände aller zugeordneten SKUs

#### Lagerampel im Katalog

| Farbe | Bedeutung |
|-------|-----------|
| Grün | >10 Stück verfügbar |
| Gelb | 1–10 Stück |
| Rot | 0 Stück + Lieferzeit in Tagen |

---

## 7. Anfragen / Bestellungen

**Navigation:** Admin > Anfragen (`/admin/anfragen`)

### Anfragen-Übersicht

Jede Anfrage zeigt:
- Firmenname, Kontaktperson (E-Mail/Name)
- Datum, Anzahl Positionen, Gesamtwert
- Status-Badge (farbcodiert)

### Status-Workflow

| Status | Farbe | Beschreibung |
|--------|-------|-------------|
| Neu | Blau | Neue Anfrage eingegangen |
| In Bearbeitung | Gelb | Wird bearbeitet |
| Versendet | Lila | Ware versendet, Tracking-Daten hinterlegt |
| Abgeschlossen | Grün | Lieferung abgeschlossen |

**Status ändern:** Dropdown direkt in der Anfrage oder per Drag & Drop im Kanban-Board

### Anfrage-Details (aufklappbar)

| Information | Beschreibung |
|-------------|-------------|
| Positionen | Produkt, Größe, SKU, Farbe, Menge, Nettopreis, Summe |
| Versanddienstleister | Dropdown oder Freitext (z.B. DHL, UPS, DPD) |
| Tracking-Nummer | Sendungsverfolgungsnummer |
| Notizen | Interne Notizen zur Anfrage |

**Speichern:** Tracking-Daten und Notizen werden per Klick auf „Speichern" übernommen.

### Kanban-Board (auf Kundendetailseite)

Auf der Kundendetailseite werden alle Anfragen des Kunden als **Kanban-Board** dargestellt:
- Spalten: Neu → In Bearbeitung → Versendet → Abgeschlossen
- Karten per Drag & Drop verschieben
- Karten aufklappbar für Details und Tracking

---

## 8. Profil & Rollenverwaltung

**Navigation:** Admin > Profil-Icon oben rechts (`/admin/profil`)

### Persönliche Daten

| Feld | Bearbeitbar |
|------|------------|
| Vollständiger Name | Ja |
| E-Mail-Adresse | Nein (read-only) |
| Rolle | Nein (read-only) |

**Button:** „Profil speichern"

### Rollenverwaltung (aufklappbar)

Sichtbar für **Admins** und **Super Admins**.

#### Benutzerliste
- Zeigt alle Benutzer mit Name, E-Mail, Rolle (farbcodiertes Badge)
- Rolle per Dropdown änderbar
- Eigene Rolle kann nicht geändert werden (read-only)

#### Rollen-Einschränkungen

| Aktion | Super Admin | Admin |
|--------|------------|-------|
| Rolle auf „Händler" setzen | Ja | Ja |
| Rolle auf „Admin" setzen | Ja | Ja |
| Rolle auf „Super Admin" setzen | Ja | **Nein** |
| Super Admin herabstufen | Ja | **Nein** |

#### Neuen Benutzer einladen

**Button:** „Benutzer einladen" (klappt Formular auf)

| Feld | Beschreibung |
|------|-------------|
| Name | Vollständiger Name des neuen Benutzers |
| E-Mail | E-Mail-Adresse (erhält Einladungslink) |
| Rolle | Dropdown: Admin / Händler (Super Admin nur für Super Admins sichtbar) |

**Button:** „Einladung senden" — Sendet einen Magic Link per E-Mail.

---

## 9. Rollenmatrix

| Funktion | Super Admin | Admin | Händler |
|----------|:----------:|:-----:|:-------:|
| Dashboard | ✓ | ✓ | — |
| Produkte anlegen/bearbeiten | ✓ | ✓ | — |
| Produkte löschen | ✓ | ✓ | — |
| Kunden verwalten | ✓ | ✓ | — |
| Kunden freischalten | ✓ | ✓ | — |
| Preislisten hochladen | ✓ | ✓ | — |
| Lager-Import (CSV) | ✓ | ✓ | — |
| Anfragen bearbeiten | ✓ | ✓ | — |
| Rollen verwalten (Admin/Händler) | ✓ | ✓ | — |
| Super Admin erstellen | ✓ | — | — |
| Benutzer einladen | ✓ | ✓ | — |
| Eigenes Profil bearbeiten | ✓ | ✓ | ✓ |
| Katalog ansehen | ✓ | ✓ | ✓ |
| Bestellanfrage senden | — | — | ✓ |
| Eigene Anfragen einsehen | — | — | ✓ |

---

## Tastenkürzel & Tipps

- **Drag & Drop:** Produkte, Größen, Farben und Kanban-Karten können per Drag & Drop sortiert werden
- **Auto-Save:** Lagermatrix und Notizen speichern automatisch beim Verlassen des Feldes
- **KI-Übersetzung:** Spare Zeit — fülle nur die deutschen Felder aus und nutze „Auto-Translate"
- **Katalog-Vorschau:** Über den Button „Als Katalog ansehen" auf der Kundendetailseite siehst du den Katalog aus Sicht des Händlers

---

*SWING Flugsportgeräte GmbH — B2B Händlerportal*
