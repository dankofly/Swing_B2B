import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  ClipboardList,
  FileText,
  Languages,
  Sparkles,
  ChevronRight,
  Upload,
  Eye,
  CheckCircle2,
  Search,
  Palette,
  Image,
  UserPlus,
  Shield,
  Truck,
  MessageSquare,
  BarChart3,
  Globe,
  AlertTriangle,
  DollarSign,
  Pencil,
  Trash2,
  ToggleRight,
  FileSpreadsheet,
  Megaphone,
  Zap,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

export default function AdminAnleitungPage() {
  return (
    <div className="min-h-screen bg-swing-gray-light">
      {/* Hero */}
      <div className="dash-hero px-5 py-10 sm:px-8 sm:py-14">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            Zum Admin-Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-swing-gold" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Admin-Handbuch
            </h1>
          </div>
          <p className="mt-2 text-sm text-white/50">
            Vollständige Anleitung für die Verwaltung des SWING B2B-Portals.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:px-8">

        {/* === SCHNELLEINSTIEG === */}
        <section className="card overflow-hidden">
          <div className="bg-swing-gold/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-swing-gold" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-swing-navy">
                Schnelleinstieg
              </h2>
            </div>
            <p className="mt-1 text-[12px] text-swing-gray-dark/60">
              Die drei wichtigsten Workflows auf einen Blick &mdash; für den sofortigen Produktivstart.
            </p>
          </div>

          <div className="divide-y divide-gray-100">

            {/* Quick-Start 1: Bestellanfrage bearbeiten */}
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-100 text-blue-700">
                  <ShoppingCart size={14} />
                </div>
                <h3 className="text-[13px] font-extrabold text-swing-navy">
                  Bestellanfrage bearbeiten (Sales)
                </h3>
              </div>
              <ol className="ml-4 list-decimal space-y-1.5 text-[12px] leading-relaxed text-swing-gray-dark/80">
                <li>
                  <Link href="/admin/anfragen" className="font-semibold text-swing-navy underline">Anfragen</Link> öffnen &mdash; neue Anfragen haben einen <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" /> blauen Puls
                </li>
                <li>Anfrage aufklappen &rarr; Positionen prüfen (Produkt, Größe, Farbe, Menge, Preis)</li>
                <li>Status ändern: <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">In Bearbeitung</span></li>
                <li>Ware kommissionieren und versenden</li>
                <li>
                  Status auf <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">Versendet</span> setzen &rarr; Versanddienstleister wählen (DPD, DHL, UPS&hellip;) &rarr; Trackingnummer eingeben &rarr; <strong>&quot;Versenden&quot;</strong> klicken
                </li>
                <li>Händler erhält automatisch eine E-Mail mit Tracking-Link</li>
                <li>
                  Nach Zustellung: Status auf <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Abgeschlossen</span>
                </li>
              </ol>
              <p className="mt-2 text-[11px] text-swing-gray-dark/50">
                Tipp: Auf der <strong>Kundendetailseite</strong> können Sie Anfragen auch per Kanban-Board (Drag &amp; Drop) bearbeiten.
              </p>
            </div>

            {/* Quick-Start 2: Produkt anlegen */}
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                  <Package size={14} />
                </div>
                <h3 className="text-[13px] font-extrabold text-swing-navy">
                  Neues Produkt anlegen
                </h3>
              </div>
              <ol className="ml-4 list-decimal space-y-1.5 text-[12px] leading-relaxed text-swing-gray-dark/80">
                <li>
                  <Link href="/admin/produkte/neu" className="font-semibold text-swing-navy underline">Produkte &rarr; + Neues Produkt</Link>
                </li>
                <li>
                  <strong>Stammdaten:</strong> Name (DE), Kategorie wählen, EN-Klasse, Gewichtsklasse, Beschreibung, Einsatzbereich
                </li>
                <li>
                  <strong>Badges:</strong> Optional &mdash; Coming Soon, Preorder, Fade Out, Aktion (mit Aktionstext)
                </li>
                <li>
                  <strong>Bilder:</strong> Produktbilder hochladen (Drag &amp; Drop). Erstes Bild = Hauptbild
                </li>
                <li>
                  <strong>Größen:</strong> Varianten hinzufügen (XS, S, M, L&hellip;) &mdash; jede mit eindeutiger <strong>SKU</strong> und <strong>Lieferzeit</strong> in Wochen
                </li>
                <li>
                  <strong>Farbdesigns:</strong> Name + Bild (500&times;500px), optional &quot;Limitiert&quot;
                </li>
                <li>
                  <strong>Übersetzen:</strong> <Sparkles size={10} className="inline text-swing-gold" /> Sparkles-Button klicken &rarr; KI übersetzt Name, Beschreibung, Einsatzbereich nach EN + FR
                </li>
                <li>
                  <strong>Speichern</strong> &rarr; Produkt erscheint sofort im Katalog
                </li>
              </ol>
            </div>

            {/* Quick-Start 3: Kunde anlegen + Preisliste */}
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-swing-gold/20 text-swing-navy">
                  <Users size={14} />
                </div>
                <h3 className="text-[13px] font-extrabold text-swing-navy">
                  Kunde anlegen + Preisliste hochladen
                </h3>
              </div>
              <ol className="ml-4 list-decimal space-y-1.5 text-[12px] leading-relaxed text-swing-gray-dark/80">
                <li>
                  <Link href="/admin/kunden/neu" className="font-semibold text-swing-navy underline">Kunden &rarr; + Neuer Kunde</Link> &mdash; Firmendaten eingeben, Typ wählen (Händler/Importeur), sofort freischalten
                </li>
                <li>
                  Auf der <strong>Kundendetailseite</strong> zum Abschnitt <strong>&quot;Preislisten&quot;</strong> scrollen
                </li>
                <li>
                  Kategorie wählen (Gleitschirme, Miniwings, Parakites&hellip;) &rarr; <strong>PDF hochladen</strong>
                </li>
                <li>
                  <Sparkles size={10} className="inline text-swing-gold" /> KI analysiert die PDF-Tabelle automatisch: Modellname, UVP, Händler-EK, Größen
                </li>
                <li>
                  <strong>Vorschau prüfen:</strong> Grün = Match, Rot = nicht gefunden. Rabatte bei Bedarf anpassen
                </li>
                <li>
                  <strong>&quot;Anwenden&quot;</strong> klicken &rarr; Preise werden gespeichert
                </li>
                <li>
                  <strong>Kontrolle:</strong> &quot;Katalog als Kunde&quot; klicken &rarr; Sie sehen den Katalog mit den individuellen Preisen dieses Händlers
                </li>
              </ol>
              <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[11px] font-semibold text-amber-800">
                  <AlertTriangle size={10} className="mr-1 inline" />
                  SKUs in der Preisliste müssen mit den SKUs im Katalog übereinstimmen. Die KI matcht primär über den Modellnamen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            Ausführliche Dokumentation
          </h2>
          <nav className="grid gap-1.5 sm:grid-cols-2">
            {[
              { href: "#dashboard", label: "Dashboard" },
              { href: "#produkte", label: "Produkte verwalten" },
              { href: "#kunden", label: "Kunden & Freischaltung" },
              { href: "#preislisten", label: "Preislisten (KI-Parsing)" },
              { href: "#lager", label: "Lagerbestände (WinLine CSV)" },
              { href: "#anfragen", label: "Bestellanfragen" },
              { href: "#news", label: "Neuigkeiten (News-Ticker)" },
              { href: "#uebersetzungen", label: "Übersetzungen (DE/EN/FR)" },
              { href: "#ki", label: "KI-Funktionen & Kosten" },
              { href: "#rollen", label: "Benutzerrollen & Rechte" },
              { href: "#tipps", label: "Tipps & Best Practices" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] font-medium text-swing-navy transition-colors hover:bg-swing-navy/5"
              >
                <ChevronRight size={12} className="text-swing-gold" />
                {item.label}
              </a>
            ))}
          </nav>
        </section>

        {/* 1. Dashboard */}
        <section id="dashboard" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <LayoutDashboard size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Dashboard
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Das{" "}
              <Link href="/admin" className="font-semibold text-swing-navy underline">
                Admin-Dashboard
              </Link>{" "}
              zeigt alle wichtigen Kennzahlen auf einen Blick:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-blue-600/70">Produkte</p>
                <p>Aktive, Coming Soon, Preorder &mdash; Direktlink zur Verwaltung.</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-emerald-600/70">Lagerbestand</p>
                <p>Auf Lager (&gt;5), Geringer Bestand (1&ndash;5), Nicht auf Lager (0).</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-gold">Anfragen</p>
                <p>Offene, in Bearbeitung, versendete und abgeschlossene Anfragen.</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">Kunden</p>
                <p>Händler, Importeure und Importeure mit Netzwerk.</p>
              </div>
            </div>
            <p>
              Darunter: <strong>KI-Briefing</strong> (generierte Zusammenfassung des aktuellen Status), <strong>letzte Anfragen</strong> mit Status und Firmennamen, und <strong>Weltzeituhr</strong> (HQ, Tokyo, New York, Sydney).
            </p>
          </div>
        </section>

        {/* 2. Produkte */}
        <section id="produkte" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Package size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Produkte verwalten
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Search size={12} />
                Produktübersicht
              </p>
              <p>
                Unter{" "}
                <Link href="/admin/produkte" className="font-semibold text-swing-navy underline">
                  Produkte
                </Link>{" "}
                sehen Sie alle Produkte in einer sortierbaren Liste:
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li><strong>Suchen</strong> nach Name, Kategorie oder SKU</li>
                <li><strong>Sortieren</strong> per Drag &amp; Drop oder Pfeiltasten</li>
                <li><strong>Status umschalten</strong> &mdash; Aktiv/Inaktiv per Toggle</li>
                <li><strong>Badges</strong> &mdash; Coming Soon, Preorder, Fade Out, Aktion direkt sichtbar</li>
              </ul>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Package size={12} />
                Produktformular
              </p>
              <ol className="ml-4 list-decimal space-y-1.5">
                <li><strong>Stammdaten:</strong> Name (DE), Kategorie, EN-Klasse, Gewichtsklasse, Beschreibung, Einsatzbereich, UVP brutto</li>
                <li><strong>Badges:</strong> Coming Soon, Preorder, Fade Out, Aktion (mit Aktionstext)</li>
                <li><strong>Bilder:</strong> Mehrere Produktbilder (Drag &amp; Drop), erstes = Hauptbild</li>
                <li><strong>Größen:</strong> Varianten (XS, S, M, L&hellip;) mit SKU und Lieferzeit in Wochen</li>
                <li><strong>Farbdesigns:</strong> Name + Bild (500&times;500px), optional &quot;Limitiert&quot;, optional Klassifizierung (N-LITE, D-LITE, U-LITE)</li>
                <li><strong>Ähnliche Produkte / Zubehör:</strong> Verknüpfung mit anderen Produkten</li>
                <li><strong>Übersetzungen:</strong> <Sparkles size={10} className="inline text-swing-gold" /> KI-Button übersetzt DE &rarr; EN + FR</li>
              </ol>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Aktionen pro Produkt
              </p>
              <div className="space-y-1.5">
                <p className="flex items-center gap-2">
                  <Pencil size={13} className="text-swing-navy/40" />
                  <strong>Bearbeiten</strong> &mdash; Produktformular mit allen Daten
                </p>
                <p className="flex items-center gap-2">
                  <Warehouse size={13} className="text-swing-navy/40" />
                  <strong>Lagerbestand</strong> &mdash; Manuelle Eingabe pro Größe + Farbe
                </p>
                <p className="flex items-center gap-2">
                  <ToggleRight size={13} className="text-swing-navy/40" />
                  <strong>Aktiv/Inaktiv</strong> &mdash; Inaktive werden im Katalog ausgeblendet
                </p>
                <p className="flex items-center gap-2">
                  <Trash2 size={13} className="text-red-400" />
                  <strong>Löschen</strong> &mdash; Unwiderruflich (Bestätigung erforderlich)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Kunden */}
        <section id="kunden" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Users size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Kunden &amp; Freischaltung
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <UserPlus size={12} />
                Registrierung &amp; Freischaltung
              </p>
              <ol className="ml-4 list-decimal space-y-1.5">
                <li>Händler registriert sich über die Startseite</li>
                <li>Sie erhalten eine <strong>E-Mail-Benachrichtigung</strong></li>
                <li>In der Kundenliste erscheint der Händler mit gelbem <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" /> Puls-Indikator</li>
                <li><strong>&quot;Freischalten&quot;</strong> klicken &rarr; Händler erhält Freischaltungs-E-Mail</li>
              </ol>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Kunden manuell anlegen
              </p>
              <p>
                <Link href="/admin/kunden/neu" className="font-semibold text-swing-navy underline">
                  Kunden &rarr; + Neuer Kunde
                </Link>{" "}
                &mdash; Firmendaten eingeben, Typ wählen (Händler, Importeur, Importeur mit Netzwerk), sofort freischalten.
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Eye size={12} />
                Kunden-Detailseite
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Stammdaten:</strong> Adresse, Kontakt, USt-ID, Firmentyp, Website</li>
                <li><strong>Preislisten:</strong> PDF hochladen &rarr; KI-Parsing (pro Kategorie)</li>
                <li><strong>Google Map:</strong> Standort des Kunden</li>
                <li><strong>Interne Notizen:</strong> Nur für Admins sichtbar (z.B. &quot;Sonderkonditionen Q2&quot;)</li>
                <li><strong>Kundennotizen:</strong> Für den Kunden sichtbar markierbar</li>
                <li><strong>Kanban-Board:</strong> Alle Anfragen im Überblick (Drag &amp; Drop)</li>
                <li><strong>&quot;Katalog als Kunde&quot;</strong> &mdash; Katalog mit individuellen Preisen ansehen</li>
              </ul>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Eye size={12} className="mr-1 inline" />
                <strong>Tipp:</strong> Nutzen Sie &quot;Katalog als Kunde&quot; nach jedem Preislisten-Upload, um die Preise im Katalog zu kontrollieren.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Preislisten */}
        <section id="preislisten" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <FileText size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Preislisten einpflegen (KI-Parsing)
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Jeder Händler hat individuelle Preise. Diese werden über <strong>PDF-Preislisten</strong> eingepflegt.
            </p>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-swing-navy/5 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">
                  Workflow: Preisliste hochladen
                </p>
              </div>
              <div className="space-y-0 px-4 py-4">
                {[
                  { step: "1", icon: <Users size={14} />, title: "Kunde auswählen", desc: "Kunden → Kundendetail → Abschnitt \u201EPreislisten\u201C" },
                  { step: "2", icon: <Upload size={14} />, title: "PDF hochladen", desc: "Kategorie wählen (Gleitschirme, Miniwings, Parakites…) und PDF-Datei hochladen." },
                  { step: "3", icon: <Sparkles size={14} />, title: "KI-Analyse", desc: "Gemini Vision analysiert die PDF-Tabelle: Modellname, UVP (Brutto), Händler-EK (Netto), Größen." },
                  { step: "4", icon: <Eye size={14} />, title: "Vorschau prüfen", desc: "Grün = Zuordnung OK, Rot = nicht gefunden. Rabatte können pro Position angepasst werden." },
                  { step: "5", icon: <CheckCircle2 size={14} />, title: "Bestätigen", desc: "\u201EAnwenden für X Produkte\u201C — Preise werden gespeichert und sind sofort im Katalog sichtbar." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
                        {item.icon}
                      </div>
                      {i < 4 && <div className="mt-1 h-full w-px bg-gray-200" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-[12px] font-bold text-swing-navy">Schritt {item.step}: {item.title}</p>
                      <p className="mt-0.5 text-[12px] text-swing-gray-dark/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                KI-Funktion: Google Gemini 2.0 Flash (Vision) — Kosten pro PDF ca. 0,01–0,05 €
              </p>
            </div>
          </div>
        </section>

        {/* 5. Lagerbestände */}
        <section id="lager" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Warehouse size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Lagerbestände importieren (WinLine CSV)
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Lagerbestände werden aus <strong>Mesonic WinLine</strong> per CSV importiert. Die CSV ist die <strong>einzige Wahrheit</strong> — nach dem Import werden alle Lagerbestände auf die CSV-Werte gesetzt.
            </p>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-swing-navy/5 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">
                  Workflow: Lagerbestände aktualisieren
                </p>
              </div>
              <div className="space-y-0 px-4 py-4">
                {[
                  { step: "1", icon: <FileSpreadsheet size={14} />, title: "CSV aus WinLine exportieren", desc: "Aktuelle Bestandsliste als CSV exportieren." },
                  { step: "2", icon: <Upload size={14} />, title: "CSV hochladen", desc: "Lagerbestand → \u201EWinLine Bestandsliste importieren\u201C → Datei wählen." },
                  { step: "3", icon: <Sparkles size={14} />, title: "Automatische Zuordnung", desc: "Artikelbezeichnungen werden deterministisch + per KI den Katalog-Produkten zugeordnet. Nur Artikel mit \u201E-NL-\u201C oder \u201E-NE-\u201C werden berücksichtigt." },
                  { step: "4", icon: <Eye size={14} />, title: "Ergebnis prüfen", desc: "Übersicht: Zugeordnete Artikel (grün) und nicht zugeordnete (rot), nach Produkt gruppiert." },
                  { step: "5", icon: <CheckCircle2 size={14} />, title: "Bestände aktualisieren", desc: "\u201EBestände aktualisieren\u201C klicken — alle Lagerbestände werden synchronisiert. Produkte, die nicht in der CSV vorkommen, werden auf 0 gesetzt." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
                        {item.icon}
                      </div>
                      {i < 4 && <div className="mt-1 h-full w-px bg-gray-200" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-[12px] font-bold text-swing-navy">Schritt {item.step}: {item.title}</p>
                      <p className="mt-0.5 text-[12px] text-swing-gray-dark/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Lagerampel im Katalog
              </p>
              <div className="space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <strong>Grün:</strong> Sofort verfügbar (&gt;10 Stück)
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <strong>Gelb:</strong> Geringe Stückzahl (1–10 Stück)
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <strong>Rot:</strong> Nicht auf Lager — Lieferzeit wird angezeigt
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[12px] font-semibold text-amber-800">
                <AlertTriangle size={12} className="mr-1 inline" />
                Manueller Lagerbestand pro Größe/Farbe kann auch direkt unter Produkte → Produkt → Lagerbestand bearbeitet werden.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Anfragen */}
        <section id="anfragen" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <ClipboardList size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Bestellanfragen bearbeiten
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Unter{" "}
              <Link href="/admin/anfragen" className="font-semibold text-swing-navy underline">
                Anfragen
              </Link>{" "}
              sehen Sie alle Bestellanfragen aller Händler.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Status-Workflow
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="rounded bg-blue-100 px-2.5 py-1 font-semibold text-blue-700">Neu</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="rounded bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">In Bearbeitung</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="rounded bg-purple-100 px-2.5 py-1 font-semibold text-purple-700">Versendet</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="rounded bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">Abgeschlossen</span>
              </div>
            </div>

            <p><strong>Pro Anfrage können Sie:</strong></p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong>Status ändern</strong> — Per Dropdown oder Kanban-Board auf der Kundendetailseite</li>
              <li><strong>Details einsehen</strong> — Positionen aufklappen (Produkt, Größe, SKU, Farbe, Menge, Preis)</li>
              <li><strong>Notizen hinzufügen</strong> — Interne Anmerkungen (werden automatisch gespeichert)</li>
              <li><strong>Tracking eingeben</strong> — Versanddienstleister (DPD, DHL, UPS, GLS, FedEx, Post AT) + Trackingnummer</li>
            </ul>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <MessageSquare size={12} />
                Automatische E-Mails
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Bei <strong>Freischaltung</strong> des Accounts</li>
                <li>Bei <strong>Statusänderung</strong> einer Anfrage</li>
                <li>Bei <strong>Versand</strong> mit klickbarem Tracking-Link</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. News */}
        <section id="news" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Megaphone size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Neuigkeiten (News-Ticker)
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Unter{" "}
              <Link href="/admin/news" className="font-semibold text-swing-navy underline">
                Neuigkeiten
              </Link>{" "}
              verwalten Sie den News-Ticker, der allen Händlern im Katalog angezeigt wird.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Funktionen
              </p>
              <ul className="ml-4 list-disc space-y-1.5">
                <li><strong>Neue Nachricht:</strong> Deutschen Text eingeben, dann <Languages size={10} className="inline" /> &quot;Auto&quot;-Button für automatische EN + FR Übersetzung</li>
                <li><strong>Sprach-Tabs:</strong> DE / EN / FR — grüner Punkt zeigt ob Übersetzung vorhanden</li>
                <li><strong>Aktivieren/Deaktivieren:</strong> Auge-Symbol pro Nachricht</li>
                <li><strong>Bearbeiten:</strong> Auf den Text klicken zum Editieren</li>
                <li><strong>Löschen:</strong> Papierkorb-Symbol (mit Bestätigung)</li>
                <li><strong>Vorschau:</strong> Live-Ticker-Vorschau am unteren Rand</li>
              </ul>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                Der &quot;Auto&quot;-Button übersetzt die deutsche Nachricht per KI nach EN und FR.
              </p>
            </div>

            <p>
              <strong>Typische News:</strong> Neue Produkte, Aktionen, Preisänderungen, Lieferstatus-Updates, Messe-Hinweise.
            </p>
          </div>
        </section>

        {/* 8. Übersetzungen */}
        <section id="uebersetzungen" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Languages size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Übersetzungen (DE → EN / FR)
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Das Portal ist dreisprachig: <strong>Deutsch</strong> (Standard), <strong>Englisch</strong> und <strong>Französisch</strong>. Händler wählen die Sprache im Header.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                  <Package size={11} />
                  Produkttexte
                </p>
                <p className="text-[12px]">Im Produktformular den <Sparkles size={10} className="inline text-swing-gold" /> Button klicken.</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                  <BarChart3 size={11} />
                  Kategorien
                </p>
                <p className="text-[12px]">Werden automatisch per API übersetzt und in der DB gespeichert.</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                  <Megaphone size={11} />
                  News
                </p>
                <p className="text-[12px]">Im News-Manager den &quot;Auto&quot;-Button pro Nachricht klicken.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. KI-Funktionen & Kosten */}
        <section id="ki" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-gold text-swing-navy">
              <Sparkles size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              KI-Funktionen &amp; Kosten
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Das Portal nutzt <strong>Google Gemini 2.0 Flash</strong> für Automatisierungen. Alle KI-Stellen sind mit einem <Sparkles size={10} className="inline text-swing-gold" /> Symbol markiert.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-3 font-bold text-swing-navy/60">Funktion</th>
                    <th className="pb-2 font-bold text-swing-navy/60">Kosten ca.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="py-2 pr-3">PDF-Preisliste parsen</td><td className="py-2 font-semibold">0,01–0,05 €/PDF</td></tr>
                  <tr><td className="py-2 pr-3">CSV-Lagerbestand analysieren</td><td className="py-2 font-semibold">0,005–0,02 €/CSV</td></tr>
                  <tr><td className="py-2 pr-3">Produkttext übersetzen</td><td className="py-2 font-semibold">0,001–0,003 €/Produkt</td></tr>
                  <tr><td className="py-2 pr-3">News übersetzen</td><td className="py-2 font-semibold">0,001 €/Nachricht</td></tr>
                  <tr><td className="py-2 pr-3">Kategorien übersetzen</td><td className="py-2 font-semibold">0,001–0,005 €</td></tr>
                  <tr><td className="py-2 pr-3">Dashboard KI-Briefing</td><td className="py-2 font-semibold">0,005–0,01 €/Aufruf</td></tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-[12px] font-semibold text-blue-800">
                <DollarSign size={12} className="mr-1 inline" />
                <strong>Gesamt:</strong> Bei normalem Betrieb (20–50 Preislisten/Monat, wöchentliche Lager-Updates) unter <strong>2–5 €/Monat</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* 10. Rollen */}
        <section id="rollen" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Shield size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Benutzerrollen &amp; Rechte
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <div className="rounded-lg bg-gray-50 p-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-3 font-bold text-swing-navy/60">Rolle</th>
                    <th className="pb-2 font-bold text-swing-navy/60">Rechte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2.5 pr-3"><span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Superadmin</span></td>
                    <td className="py-2.5">Voller Zugriff + Rollenverwaltung</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3"><span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">Admin</span></td>
                    <td className="py-2.5">Produkte, Kunden, Lager, Anfragen, News, Preislisten, Übersetzungen</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3"><span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-700">Händler</span></td>
                    <td className="py-2.5">Katalog, eigene Preise, Warenkorb, Anfragen senden, Anfrage-Historie</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Rollenverwaltung unter{" "}
              <Link href="/admin/profil" className="font-semibold text-swing-navy underline">
                Admin → Profil
              </Link>{" "}
              (nur Superadmins).
            </p>
          </div>
        </section>

        {/* 11. Tipps */}
        <section id="tipps" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-gold text-swing-navy">
              <CheckCircle2 size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Tipps &amp; Best Practices
            </h2>
          </div>
          <div className="text-[13px] leading-relaxed text-swing-gray-dark/80">
            <ul className="space-y-3">
              {[
                { title: "Lagerbestände wöchentlich aktualisieren", desc: "WinLine-CSV exportieren und hochladen — so sind die Ampeln im Katalog immer aktuell." },
                { title: "Preislisten nach Upload prüfen", desc: "Immer \u201EKatalog als Kunde\u201C nutzen, um die Preiszuordnung zu kontrollieren." },
                { title: "Registrierungen zeitnah freischalten", desc: "Händler erwarten schnelle Reaktion. Das Dashboard zeigt ausstehende Anfragen prominent." },
                { title: "SKUs konsistent halten", desc: "KI matcht Preislisten und Lager anhand SKUs. Portal, WinLine und PDFs müssen übereinstimmen." },
                { title: "Produktbilder hochwertig halten", desc: "Farbdesign-Bilder werden auf 500×500px skaliert. Produktbilder in möglichst hoher Qualität." },
                { title: "Notizen nutzen", desc: "Auf der Kundendetailseite können interne Notizen hinterlegt werden (z.B. \u201ESonderkonditionen bis Q2\u201C)." },
                { title: "Tracking-Nummern eingeben", desc: "Der Händler erhält automatisch eine E-Mail mit klickbarem Tracking-Link." },
                { title: "News-Ticker pflegen", desc: "Aktuelle Informationen zu neuen Produkten, Aktionen oder Lieferstatus im News-Ticker veröffentlichen." },
              ].map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                  <span><strong>{tip.title}</strong> — {tip.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer nav */}
        <div className="flex items-center justify-between pb-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-swing-navy transition-colors hover:text-swing-gold"
          >
            <ArrowLeft size={14} />
            Zum Admin-Dashboard
          </Link>
          <Link
            href="/anleitung"
            className="text-[12px] text-swing-gray-dark/40 transition-colors hover:text-swing-navy"
          >
            Kunden-Anleitung
          </Link>
        </div>
      </div>
    </div>
  );
}
