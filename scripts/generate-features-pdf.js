const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700;1,800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Montserrat', sans-serif;
    color: #414142;
    font-size: 9.5pt;
    line-height: 1.55;
    background: #fff;
  }

  .cover {
    page-break-after: always;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #173045 0%, #1F2A55 50%, #173045 100%);
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .cover::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    border-radius: 50%;
    border: 1px solid rgba(252, 185, 35, 0.08);
  }

  .cover::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 450px;
    border-radius: 50%;
    border: 1px solid rgba(252, 185, 35, 0.12);
  }

  .cover-brand {
    font-size: 36pt;
    font-weight: 800;
    font-style: italic;
    letter-spacing: 6px;
    color: #FCB923;
    position: relative;
    z-index: 1;
  }

  .cover-sub {
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-top: 8px;
    position: relative;
    z-index: 1;
  }

  .cover-title {
    font-size: 18pt;
    font-weight: 700;
    margin-top: 50px;
    color: white;
    position: relative;
    z-index: 1;
  }

  .cover-date {
    font-size: 9pt;
    color: rgba(255,255,255,0.25);
    margin-top: 12px;
    position: relative;
    z-index: 1;
  }

  .cover-footer {
    position: absolute;
    bottom: 40px;
    font-size: 8pt;
    color: rgba(255,255,255,0.15);
    letter-spacing: 1px;
  }

  .content {
    padding: 50px 60px;
  }

  h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #173045;
    margin-bottom: 6px;
    letter-spacing: 1px;
  }

  h2 {
    font-size: 13pt;
    font-weight: 700;
    font-style: italic;
    color: #1F2A55;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 32px;
    margin-bottom: 14px;
    padding-bottom: 6px;
    border-bottom: 2px solid #FCB923;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #173045;
    margin-top: 18px;
    margin-bottom: 6px;
  }

  ul {
    margin-left: 16px;
    margin-bottom: 8px;
  }

  li {
    margin-bottom: 3px;
    padding-left: 4px;
  }

  li::marker {
    color: #FCB923;
  }

  strong {
    color: #173045;
    font-weight: 600;
  }

  .section-divider {
    border: none;
    border-top: 1px solid #e8e8e8;
    margin: 28px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px;
    font-size: 9pt;
  }

  thead th {
    background: #173045;
    color: white;
    padding: 8px 12px;
    text-align: left;
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  tbody td {
    padding: 7px 12px;
    border-bottom: 1px solid #eee;
  }

  tbody tr:nth-child(even) {
    background: #f9f9f9;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 2px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-gold {
    background: #FCB923;
    color: #173045;
  }

  .badge-navy {
    background: #173045;
    color: white;
  }

  .badge-green {
    background: #dcfce7;
    color: #166534;
  }

  .badge-amber {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-red {
    background: #fee2e2;
    color: #991b1b;
  }

  .planned-tag {
    display: inline-block;
    background: linear-gradient(135deg, #FCB923, #E0A520);
    color: #173045;
    padding: 3px 10px;
    border-radius: 2px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-left: 6px;
    vertical-align: middle;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 14px 0;
  }

  .stat-card {
    background: #f6f6f6;
    padding: 14px;
    border-radius: 2px;
    text-align: center;
    border-left: 3px solid #FCB923;
  }

  .stat-value {
    font-size: 20pt;
    font-weight: 800;
    color: #173045;
  }

  .stat-label {
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #999;
    margin-top: 2px;
  }

  .traffic-light {
    display: flex;
    gap: 16px;
    margin: 10px 0;
  }

  .traffic-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot-green { background: #22c55e; }
  .dot-amber { background: #f59e0b; }
  .dot-red { background: #ef4444; }

  .flow-box {
    background: #f6f6f6;
    border-left: 3px solid #FCB923;
    padding: 14px 18px;
    margin: 12px 0;
    font-size: 9pt;
    line-height: 1.8;
  }

  .flow-arrow {
    color: #FCB923;
    font-weight: 700;
  }

  .page-break {
    page-break-before: always;
  }

  @media print {
    .content { padding: 40px 50px; }
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-brand">SWING PARAGLIDERS</div>
  <div class="cover-sub">B2B Händlerportal</div>
  <div class="cover-title">Feature-Übersicht</div>
  <div class="cover-date">Stand: März 2026</div>
  <div class="cover-footer">SWING Flugsportgeräte GmbH &middot; swing.de</div>
</div>

<!-- CONTENT -->
<div class="content">

<h1>Feature-Übersicht</h1>
<p style="color:#999; font-size:8.5pt; margin-bottom:20px;">Komplette Funktionsübersicht des SWING B2B Händlerportals — implementierte Features und geplante Erweiterungen.</p>

<!-- ==================== KUNDENBEREICH ==================== -->
<h2>Kundenbereich (Händler)</h2>

<h3>Authentifizierung</h3>
<ul>
  <li><strong>Registrierung</strong> — Firmendaten, Kontaktperson, Adresse, Produktkategorien, Passwort (26-Länder-Dropdown)</li>
  <li><strong>Login</strong> — E-Mail + Passwort mit Fehlerbehandlung</li>
  <li><strong>Passwort vergessen</strong> — Reset-Link per E-Mail</li>
  <li><strong>Passwort zurücksetzen</strong> — Neues Passwort mit automatischer Weiterleitung</li>
</ul>

<h3>Landing Page</h3>
<ul>
  <li>Hero-Bereich mit SWING Branding und dekorativen Ringen</li>
  <li>Feature-Karten (Individuelle Preise, Lagerampel, Bestellanfragen)</li>
  <li>Login/Registrierung CTAs</li>
  <li>Footer mit Impressum, Datenschutz, swing.de Link</li>
</ul>

<h3>Produktkatalog</h3>
<ul>
  <li><strong>Produktübersicht</strong> — Responsive Grid-Ansicht (1/2/3 Spalten)</li>
  <li><strong>Volltextsuche</strong> — Nach Produktnamen</li>
  <li><strong>Schnelle Kategorie-Tabs</strong> — Paragleiter, Tandem, Motor, Miniwings, Speedflying, Parakites, Gurtzeuge, Rettungen, Zubehör</li>
  <li><strong>Erweiterte Filter</strong> — EN-Klasse (A–D), Gewichtsklasse (N-LITE, D-LITE, U-LITE)</li>
  <li><strong>Lagerampel pro Größe</strong> — Farbcodierte Bestandsanzeige</li>
  <li><strong>Badges</strong> — Coming Soon, Preorder, Fade Out, Limited Edition, EN-Klasse</li>
</ul>

<h3>Produktdetail</h3>
<ul>
  <li><strong>Hero-Bereich</strong> — Kategorie, Name, Beschreibung, Status-Badges, Website-Link</li>
  <li><strong>Technische Daten</strong> — Spec-Karte mit allen technischen Werten</li>
  <li><strong>Farbdesign-Auswahl</strong> — Bildergalerie mit Limited-Edition-Badge</li>
  <li><strong>Größen-/Preistabelle</strong> — Individuelle EK-Preise, UVP-Vergleich, Rabatt %, Lieferzeit</li>
  <li><strong>Lagerampel</strong> — Verfügbar / Nur X Stk. / Ausverkauft / Lieferzeit in Wochen</li>
  <li><strong>Warenkorb-Integration</strong> — Mengenauswahl + animiertes Feedback</li>
</ul>

<h3>Warenkorb</h3>
<ul>
  <li><strong>Artikelübersicht</strong> — Gruppiert nach Produkt + Farbdesign</li>
  <li><strong>Mengen bearbeiten</strong> — Live-Update der Summen</li>
  <li><strong>Zusammenfassung</strong> — Positionen, Gesamtmenge, Netto-Gesamtpreis</li>
  <li><strong>Notizfeld</strong> — Freitext für Bestellhinweise</li>
  <li><strong>Anfrage absenden</strong> — Mit Erfolgsmeldung und "Was passiert jetzt"-Erklärung</li>
  <li><strong>LocalStorage-Persistenz</strong> — Warenkorb bleibt bei Seitenneuladen</li>
</ul>

<h3>Bestellanfragen</h3>
<ul>
  <li><strong>Anfrage-Historie</strong> — Chronologische Übersicht aller Bestellanfragen</li>
  <li><strong>Status-Stepper</strong> — 4-Schritte-Fortschritt (Neu → In Bearbeitung → Versendet → Abgeschlossen)</li>
  <li><strong>Detail-Ansicht</strong> — Aufklappbar mit Positionen, Preisen, Mengen, Summen</li>
  <li><strong>Tracking-Info</strong> — Versanddienstleister + Sendungsnummer (kopierbar)</li>
  <li><strong>Zeitstempel</strong> — Pro Status-Änderung</li>
</ul>

<h3>Dashboard</h3>
<ul>
  <li><strong>Willkommensnachricht</strong> — Personalisiert mit Vorname</li>
  <li><strong>KPI-Karten</strong> — Gesamtanfragen, Gesamtwert (EUR), Offene Anfragen, Versendet</li>
  <li><strong>Firmendaten</strong> — Name, Typ, Freischaltungsstatus, Produktkategorien</li>
  <li><strong>Statusverteilung</strong> — Animierter Fortschrittsbalken mit Legende</li>
  <li><strong>Kundennotizen</strong> — Vom Admin sichtbar geschaltete Hinweise</li>
  <li><strong>Letzte Anfragen</strong> — Die 5 neuesten mit Schnellzugriff</li>
  <li><strong>Kontaktleiste</strong> — Telefon, E-Mail, Geschäftszeiten</li>
</ul>

<h3>Profil & Navigation</h3>
<ul>
  <li><strong>Firmendaten bearbeiten</strong> — Name, USt-ID, Kontaktdaten, Adresse</li>
  <li><strong>Header</strong> — SWING Logo, Katalog, Dashboard, Anfragen, Profil, Warenkorb (Zähler)</li>
  <li><strong>Sprachumschaltung</strong> — Deutsch, Englisch, Französisch</li>
  <li><strong>Footer</strong> — Impressum, Datenschutz, swing.de</li>
</ul>

<hr class="section-divider">

<!-- ==================== ADMIN ==================== -->
<h2>Admin-Bereich</h2>

<h3>Dashboard</h3>
<ul>
  <li><strong>KPI-Karten</strong> — Produkte (aktiv/coming soon/preorder), Lager, Anfragen (pro Status/Monat), Kunden (nach Typ)</li>
  <li><strong>Letzte Anfragen</strong> — Die 6 neuesten mit Status, Firma, Kontakt</li>
  <li><strong>Weltzeituhr</strong> — Wien, Tokio, New York, Sydney</li>
</ul>

<h3>Produktverwaltung</h3>
<ul>
  <li><strong>Produktliste</strong> — Sortierbar mit Drag-and-Drop Reihenfolge</li>
  <li><strong>Produkt erstellen/bearbeiten</strong> — Name, Slug, Beschreibung, Kategorie, Status-Flags, EN-Klasse, Gewichtsklasse, Website-URL</li>
  <li><strong>Größenvarianten</strong> — Label, SKU, Lieferzeit (Wochen), Sortierung</li>
  <li><strong>Farbdesigns</strong> — Name, Bild-Upload (Supabase Storage), Limited Edition Flag</li>
  <li><strong>Lager-Matrix</strong> — Farbe x Größe Bestandseditor pro Produkt</li>
  <li><strong>Aktivieren/Deaktivieren/Löschen</strong> — Mit Kaskade</li>
</ul>

<h3>Kundenverwaltung</h3>
<ul>
  <li><strong>Kundenliste</strong> — Alle Firmen mit Suche und Filter</li>
  <li><strong>Kunde erstellen</strong> — Manuelle Anlage mit allen Firmendaten</li>
  <li><strong>Kundendetail</strong> — Stammdaten, Freischaltung, Google Maps, WhatsApp, Zeitzone, Preislisten, Notizen (mit Kunden-Sichtbarkeit), Kanban-Board, Statistiken</li>
  <li><strong>Katalog als Kunde ansehen</strong> — Admin browst Katalog mit Kundenpreisen + Banner auf allen Seiten</li>
</ul>

<h3>Preislisten (Gemini Vision AI)</h3>
<ul>
  <li><strong>PDF-Upload</strong> — Preislisten als PDF hochladen</li>
  <li><strong>Gemini Vision Parsing</strong> — Automatische Tabellenerkennung (Modell, UVP, EK, Größen, Rabatt)</li>
  <li><strong>SKU-Matching</strong> — Automatische Zuordnung zu Katalog-Produkten</li>
  <li><strong>Vorschau + Bestätigung</strong> — Admin prüft und speichert</li>
</ul>

<h3>Lagerbestand</h3>
<ul>
  <li><strong>Übersichtskacheln</strong> — Gesamtbestand, Verfügbar, Niedrig, Ausverkauft</li>
  <li><strong>Komplette Produktübersicht</strong> — Aufklappbare Liste mit Ampel-Badges, SKU, Suche, Filter</li>
  <li><strong>CSV-Import (Mesonic WinLine)</strong> — Gemini AI parst ERP-Bezeichnungen, automatische Zuordnung</li>
</ul>

<h3>Anfragen & Rollen</h3>
<ul>
  <li><strong>Anfragenliste</strong> — Alle Kundenanfragen mit Status, Positionen, Werten</li>
  <li><strong>Status ändern</strong> — Neu → In Bearbeitung → Versendet → Abgeschlossen (mit Zeitstempeln)</li>
  <li><strong>Tracking-Daten</strong> — Versanddienstleister + Sendungsnummer</li>
  <li><strong>Rollenverwaltung</strong> (Superadmin) — Benutzerrollen ändern</li>
</ul>

<hr class="section-divider">

<!-- ==================== ÜBERGREIFEND ==================== -->
<h2>Übergreifend</h2>

<ul>
  <li><strong>Dreisprachig</strong> — Deutsch, Englisch, Französisch (alle UI-Texte)</li>
  <li><strong>Row-Level Security</strong> — Supabase RLS für alle Datenbankzugriffe</li>
  <li><strong>Middleware</strong> — Auth-Schutz + Rollenprüfung für Admin-Routen</li>
  <li><strong>Responsive Design</strong> — Desktop + Tablet + Mobil</li>
</ul>

<h3>Lagerampel-System</h3>
<div class="traffic-light">
  <div class="traffic-item"><div class="dot dot-green"></div> <strong>&gt;10 Stk.</strong> — Sofort verfügbar</div>
  <div class="traffic-item"><div class="dot dot-amber"></div> <strong>1–10 Stk.</strong> — Wenige verfügbar</div>
  <div class="traffic-item"><div class="dot dot-red"></div> <strong>0 Stk.</strong> — Ausverkauft + Lieferzeit</div>
</div>

<h3>Bestellanfrage-Flow</h3>
<div class="flow-box">
  Katalog durchstöbern <span class="flow-arrow">→</span> Produkt auswählen (Größe + Farbe + Menge) <span class="flow-arrow">→</span> In den Warenkorb <span class="flow-arrow">→</span> Warenkorb prüfen <span class="flow-arrow">→</span> Anfrage absenden <span class="flow-arrow">→</span> <span class="badge badge-navy">Neu</span> <span class="flow-arrow">→</span> <span class="badge badge-amber">In Bearbeitung</span> <span class="flow-arrow">→</span> <span class="badge badge-green">Versendet</span> <span class="flow-arrow">→</span> <span class="badge badge-gold">Abgeschlossen</span>
</div>

<hr class="section-divider">

<!-- ==================== GEPLANT ==================== -->
<div class="page-break"></div>

<h2>Geplante Features <span class="planned-tag">Roadmap</span></h2>

<h3>1. KI-gestützte Datenpflege</h3>
<ul>
  <li><strong>Produktdaten per KI einpflegen</strong> — Automatische Erkennung und Import aus Datenblättern, Website-Texten oder Bildern via Gemini Vision</li>
  <li><strong>Bulk-Import</strong> — Mehrere Produkte gleichzeitig aus strukturierten Dokumenten anlegen</li>
  <li><strong>Smart Suggestions</strong> — KI-Vorschläge für Kategorisierung, Tags und technische Daten</li>
  <li><strong>Automatische Bilderkennung</strong> — Farbdesigns aus Produktfotos extrahieren</li>
</ul>

<h3>2. Mobile WebApp (PWA)</h3>
<ul>
  <li><strong>Progressive Web App</strong> — Installierbar auf Smartphone, Offline-fähig</li>
  <li><strong>Push-Benachrichtigungen</strong> — Status-Updates für Anfragen direkt aufs Handy</li>
  <li><strong>Touch-optimierte Navigation</strong> — Swipe-Gesten, große Touch-Targets</li>
  <li><strong>Offline-Warenkorb</strong> — Produkte auch ohne Verbindung in den Warenkorb legen</li>
  <li><strong>Barcode/QR-Scanner</strong> — Schneller Produktzugriff per Kamera</li>
</ul>

<h3>3. Werbebanner & Aktionen</h3>
<ul>
  <li><strong>Banner-Editor</strong> — Aktionsbanner erstellen und gestalten (Bild, Text, Link, Zeitraum)</li>
  <li><strong>Katalog-Einblendung</strong> — Banner im Katalog-Header oder als Overlay</li>
  <li><strong>Zeitgesteuert</strong> — Start-/Enddatum für automatische Schaltung</li>
  <li><strong>Zielgruppen</strong> — Banner für bestimmte Kundentypen oder Regionen</li>
  <li><strong>Aktionspreise</strong> — Temporäre Sonderpreise mit Countdown-Anzeige</li>
</ul>

<h3>4. E-Mail-Benachrichtigungen (Resend)</h3>
<ul>
  <li><strong>Bestellbestätigung</strong> — Automatische E-Mail an Händler nach Anfrage-Eingang</li>
  <li><strong>Statusänderungen</strong> — E-Mail bei "In Bearbeitung", "Versendet" (mit Tracking-Link), "Abgeschlossen"</li>
  <li><strong>Admin-Benachrichtigung</strong> — E-Mail an vertrieb@swing.de bei neuer Anfrage</li>
  <li><strong>Willkommens-E-Mail</strong> — Nach Registrierung und Freischaltung</li>
  <li><strong>Preislisten-Update</strong> — Benachrichtigung bei neuen Preisen</li>
  <li><strong>Lagerbestand-Warnung</strong> — Automatische Info bei kritischen Bestandsänderungen</li>
</ul>

<hr class="section-divider">

<!-- ==================== TECH-STACK ==================== -->
<h2>Tech-Stack</h2>

<table>
  <thead><tr><th>Komponente</th><th>Technologie</th></tr></thead>
  <tbody>
    <tr><td>Frontend</td><td>Next.js 15 (App Router) + TypeScript</td></tr>
    <tr><td>Styling</td><td>Tailwind CSS v4 (SWING CI)</td></tr>
    <tr><td>Datenbank</td><td>Supabase (PostgreSQL + Row-Level Security)</td></tr>
    <tr><td>Auth</td><td>Supabase Auth</td></tr>
    <tr><td>Storage</td><td>Supabase Storage (Bilder, PDFs)</td></tr>
    <tr><td>KI / PDF-Parsing</td><td>Google Gemini 2.0 Flash Vision</td></tr>
    <tr><td>E-Mail</td><td>Resend (geplant)</td></tr>
    <tr><td>Hosting</td><td>Netlify</td></tr>
    <tr><td>Icons</td><td>Lucide React</td></tr>
    <tr><td>Font</td><td>Montserrat (300–700)</td></tr>
    <tr><td>i18n</td><td>Custom Cookie-basiert (DE/EN/FR)</td></tr>
  </tbody>
</table>

<h2>Kennzahlen</h2>

<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">28+</div><div class="stat-label">Seiten / Routen</div></div>
  <div class="stat-card"><div class="stat-value">25+</div><div class="stat-label">Komponenten</div></div>
  <div class="stat-card"><div class="stat-value">25+</div><div class="stat-label">Server Actions</div></div>
  <div class="stat-card"><div class="stat-value">14</div><div class="stat-label">Datenbank-Tabellen</div></div>
  <div class="stat-card"><div class="stat-value">20+</div><div class="stat-label">RLS-Policies</div></div>
  <div class="stat-card"><div class="stat-value">3</div><div class="stat-label">Sprachen (DE/EN/FR)</div></div>
</div>

<div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; color: #ccc; font-size: 7.5pt; letter-spacing: 1px;">
  SWING Flugsportgeräte GmbH &middot; swing.de &middot; Stand März 2026
</div>

</div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });

  await page.pdf({
    path: 'c:/Users/DanKof/projects/swing-b2b/SWING_B2B_Features.pdf',
    format: 'A4',
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    printBackground: true,
    preferCSSPageSize: false,
  });

  console.log('PDF saved to SWING_B2B_Features.pdf');
  await browser.close();
})();
