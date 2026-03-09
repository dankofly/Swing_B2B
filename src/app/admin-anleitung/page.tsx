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
  GripVertical,
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
  MapPin,
  FileSpreadsheet,
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
            Vollst&auml;ndige Anleitung f&uuml;r die Verwaltung des SWING B2B-Portals.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:px-8">

        {/* Table of Contents */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            Inhalt
          </h2>
          <nav className="space-y-1.5">
            {[
              { href: "#dashboard", label: "Dashboard &ndash; \u00dcbersicht" },
              { href: "#produkte", label: "Produkte verwalten" },
              { href: "#kunden", label: "Kunden & Freischaltung" },
              { href: "#preislisten", label: "Preislisten einpflegen (KI-Parsing)" },
              { href: "#lager", label: "Lagerbest\u00e4nde importieren (WinLine CSV)" },
              { href: "#anfragen", label: "Bestellanfragen bearbeiten" },
              { href: "#uebersetzungen", label: "\u00dcbersetzungen (DE \u2192 EN / FR)" },
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
                <span dangerouslySetInnerHTML={{ __html: item.label }} />
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
              Dashboard &ndash; &Uuml;bersicht
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Das{" "}
              <Link href="/admin" className="font-semibold text-swing-navy underline">
                Admin-Dashboard
              </Link>{" "}
              zeigt Ihnen alle wichtigen Kennzahlen auf einen Blick:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-blue-600/70">Produkte</p>
                <p>Aktive Produkte, Coming Soon, Preorder &ndash; mit Direktlink zur Produktverwaltung.</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-emerald-600/70">Lagerbestand</p>
                <p>Auf Lager (&gt;10), Geringer Bestand (1&ndash;10), Nicht auf Lager (0) &ndash; mit Direktlink zum Lager.</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-gold">Anfragen</p>
                <p>Offene, in Bearbeitung, versendete und abgeschlossene Anfragen dieses Monats.</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">Kunden</p>
                <p>Anzahl H&auml;ndler, Importeure und Importeure mit Netzwerk.</p>
              </div>
            </div>
            <p>
              Darunter finden Sie die <strong>letzten Anfragen</strong> (mit Status und Firma) sowie die <strong>letzten Preislisten-Uploads</strong> mit Match-Ergebnis.
            </p>
            <p>
              Im Header sehen Sie die aktuelle <strong>Uhrzeit</strong> in verschiedenen Zeitzonen (HQ, Tokyo, New York, Sydney).
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

            {/* Produkte Liste */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Search size={12} />
                Produkt&uuml;bersicht
              </p>
              <p>
                Unter{" "}
                <Link href="/admin/produkte" className="font-semibold text-swing-navy underline">
                  Produkte
                </Link>{" "}
                sehen Sie alle Produkte in einer sortierbaren Liste. Sie k&ouml;nnen:
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li><strong>Suchen</strong> nach Name, Kategorie oder SKU</li>
                <li><strong>Sortieren</strong> per Drag &amp; Drop (Desktop) oder Pfeiltasten (Mobil)</li>
                <li><strong>Status umschalten</strong> &ndash; Aktiv/Inaktiv per Klick auf den Toggle</li>
              </ul>
            </div>

            {/* Neues Produkt */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Package size={12} />
                Neues Produkt anlegen
              </p>
              <p>Klicken Sie auf <strong>&quot;+ Neues Produkt&quot;</strong>. Es &ouml;ffnet sich das Produktformular:</p>
              <ol className="ml-4 mt-2 list-decimal space-y-1.5">
                <li>
                  <strong>Stammdaten:</strong> Name (DE), Kategorie, Badge (Coming Soon, Preorder, Fade Out, Aktion), EN-Klasse, Gewichtsklasse, Beschreibung, Einsatzbereich, Aktionstext
                </li>
                <li>
                  <strong>Bilder:</strong> Mehrere Produktbilder hochladen (Drag &amp; Drop oder Dateiauswahl). Das erste Bild wird als Hauptbild verwendet.
                </li>
                <li>
                  <strong>Gr&ouml;&szlig;en:</strong> F&uuml;gen Sie Varianten hinzu (z.B. XS, S, SM, M, ML, L). Jede Gr&ouml;&szlig;e hat eine <strong>SKU</strong> (eindeutig!) und eine <strong>Lieferzeit</strong> in Wochen.
                </li>
                <li>
                  <strong>Farbdesigns:</strong> Name, Bild (wird auf 500&times;500px skaliert), optional als &quot;Limitiert&quot; markiert.
                </li>
                <li>
                  <strong>&Auml;hnliche Produkte / Zubeh&ouml;r:</strong> Verkn&uuml;pfen Sie andere Produkte als &quot;&Auml;hnlich&quot; oder &quot;Zubeh&ouml;r&quot;.
                </li>
              </ol>
            </div>

            {/* Mehrsprachigkeit */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Languages size={12} />
                Mehrsprachige Produkttexte
              </p>
              <p>
                Jedes Produkt hat Felder f&uuml;r <strong>Deutsch</strong>, <strong>Englisch</strong> und <strong>Franz&ouml;sisch</strong> (Name, Beschreibung, Einsatzbereich, Aktionstext).
              </p>
              <p className="mt-2">
                Klicken Sie auf den <strong>&quot;&Uuml;bersetzen&quot;-Button</strong> (Sparkles-Symbol) im Produktformular. Die KI &uuml;bersetzt automatisch den deutschen Text nach EN und FR.
              </p>
              <div className="mt-2 rounded border border-swing-gold/30 bg-swing-gold/5 px-3 py-2">
                <p className="text-[11px] font-semibold text-swing-navy">
                  <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                  KI-Funktion: Gemini 2.0 Flash &ndash; Kosten pro &Uuml;bersetzung ca. 0,001&ndash;0,003 &euro;
                </p>
              </div>
            </div>

            {/* Bearbeiten & Löschen */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Aktionen pro Produkt
              </p>
              <div className="space-y-1.5">
                <p className="flex items-center gap-2">
                  <Pencil size={13} className="text-swing-navy/40" />
                  <strong>Bearbeiten</strong> &ndash; &Ouml;ffnet das Produktformular mit allen Daten
                </p>
                <p className="flex items-center gap-2">
                  <Warehouse size={13} className="text-swing-navy/40" />
                  <strong>Lagerbestand</strong> &ndash; Manuelle Eingabe pro Gr&ouml;&szlig;e
                </p>
                <p className="flex items-center gap-2">
                  <ToggleRight size={13} className="text-swing-navy/40" />
                  <strong>Aktiv/Inaktiv</strong> &ndash; Inaktive Produkte werden im Katalog nicht angezeigt
                </p>
                <p className="flex items-center gap-2">
                  <Trash2 size={13} className="text-red-400" />
                  <strong>L&ouml;schen</strong> &ndash; Entfernt das Produkt unwiderruflich (Best&auml;tigung erforderlich)
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

            {/* Registrierung & Freischaltung */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <UserPlus size={12} />
                Registrierung &amp; Freischaltung
              </p>
              <ol className="ml-4 list-decimal space-y-1.5">
                <li>Ein H&auml;ndler registriert sich &uuml;ber das Registrierungsformular auf der Startseite</li>
                <li>Sie erhalten eine <strong>E-Mail-Benachrichtigung</strong> mit allen Firmendaten</li>
                <li>In der Kundenverwaltung erscheint der neue H&auml;ndler unter <strong>&quot;Ausstehende Anfragen&quot;</strong> (gelber Puls-Indikator)</li>
                <li>Klicken Sie auf <strong>&quot;Freischalten&quot;</strong>, um den Zugang zu genehmigen</li>
                <li>Der H&auml;ndler erh&auml;lt eine <strong>Freischaltungs-E-Mail</strong> und kann sich einloggen</li>
              </ol>
            </div>

            {/* Kundendetail */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Eye size={12} />
                Kunden-Detailseite
              </p>
              <p>Klicken Sie auf einen Kunden, um die Detailseite zu &ouml;ffnen:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                <li><strong>Stammdaten:</strong> Adresse, Kontaktdaten, USt-ID, Typ</li>
                <li><strong>Preislisten:</strong> PDF/CSV hochladen und per KI zuordnen (siehe n&auml;chster Abschnitt)</li>
                <li><strong>Google Map:</strong> Standort des Kunden auf der Karte</li>
                <li><strong>Notizen:</strong> Interne Anmerkungen (nur f&uuml;r Admins sichtbar)</li>
                <li><strong>Kanban-Board:</strong> Alle Anfragen des Kunden im &Uuml;berblick (Neu &rarr; In Bearbeitung &rarr; Versendet &rarr; Abgeschlossen)</li>
              </ul>
            </div>

            {/* Als Kunde ansehen */}
            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="mb-1 text-[12px] font-bold text-swing-navy">
                <Eye size={12} className="mr-1 inline" />
                &quot;Als Kunde ansehen&quot;
              </p>
              <p>
                Klicken Sie auf der Kunden-Detailseite auf <strong>&quot;Katalog als Kunde&quot;</strong>. Sie sehen den Katalog mit den individuellen Preisen dieses H&auml;ndlers &ndash; ideal zur Kontrolle nach dem Preislisten-Upload.
              </p>
            </div>

            {/* Manuell anlegen */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Kunden manuell anlegen
              </p>
              <p>
                Unter{" "}
                <Link href="/admin/kunden/neu" className="font-semibold text-swing-navy underline">
                  Kunden &rarr; Neu
                </Link>{" "}
                k&ouml;nnen Sie einen H&auml;ndler ohne Selbstregistrierung manuell erfassen und sofort freischalten.
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
              Jeder H&auml;ndler hat individuelle Preise. Diese werden &uuml;ber <strong>PDF-Preislisten</strong> eingepflegt, die von der KI automatisch ausgelesen werden.
            </p>

            {/* Workflow */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-swing-navy/5 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">
                  Workflow: Preisliste hochladen
                </p>
              </div>
              <div className="space-y-0 px-4 py-4">
                {[
                  {
                    step: "1",
                    icon: <Users size={14} />,
                    title: "Kunde ausw\u00e4hlen",
                    desc: "Navigieren Sie zu Kunden \u2192 Kundendetail \u2192 Abschnitt \u201ePreislisten\u201c",
                  },
                  {
                    step: "2",
                    icon: <Upload size={14} />,
                    title: "PDF hochladen",
                    desc: "W\u00e4hlen Sie die Kategorie (Gleitschirme, Miniwings, Parakites) und laden Sie die PDF-Datei hoch.",
                  },
                  {
                    step: "3",
                    icon: <Sparkles size={14} />,
                    title: "KI-Analyse",
                    desc: "Gemini Vision analysiert die PDF-Tabelle und erkennt: Modellname, UVP (Brutto), H\u00e4ndler-EK (Netto), verf\u00fcgbare Gr\u00f6\u00dfen.",
                  },
                  {
                    step: "4",
                    icon: <Eye size={14} />,
                    title: "Vorschau pr\u00fcfen",
                    desc: "Sie sehen eine Tabelle mit allen erkannten Positionen. Gr\u00fcn = Zuordnung erfolgreich, Rot = nicht gefunden. Sie k\u00f6nnen Rabatte pro Position anpassen.",
                  },
                  {
                    step: "5",
                    icon: <CheckCircle2 size={14} />,
                    title: "Best\u00e4tigen",
                    desc: "Klicken Sie \u201eAnwenden f\u00fcr X Produkte\u201c. Die Preise werden in der Datenbank gespeichert und sind sofort im Katalog des H\u00e4ndlers sichtbar.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
                        {item.icon}
                      </div>
                      {i < 4 && <div className="mt-1 h-full w-px bg-gray-200" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-[12px] font-bold text-swing-navy">
                        Schritt {item.step}: {item.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-swing-gray-dark/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[12px] font-semibold text-amber-800">
                <AlertTriangle size={12} className="mr-1 inline" />
                Tipp: Stellen Sie sicher, dass die SKUs in der Preisliste mit den SKUs im Katalog &uuml;bereinstimmen. Die KI matcht Produkte anhand des Modellnamens &ndash; je genauer die Bezeichnung in der PDF, desto besser die Zuordnung.
              </p>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                KI-Funktion: Google Gemini 2.0 Flash (Vision) &ndash; Kosten pro PDF ca. 0,01&ndash;0,05 &euro; je nach Seitenanzahl
              </p>
            </div>

            <p>
              <strong>Kontrolle:</strong> Nutzen Sie danach die Funktion <strong>&quot;Katalog als Kunde&quot;</strong> auf der Kundendetailseite, um zu pr&uuml;fen, ob die Preise korrekt angezeigt werden.
            </p>
          </div>
        </section>

        {/* 5. Lagerbestände */}
        <section id="lager" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Warehouse size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Lagerbest&auml;nde importieren (WinLine CSV)
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Die Lagerbest&auml;nde werden aus dem ERP-System <strong>Mesonic WinLine</strong> per CSV-Export importiert.
            </p>

            {/* Workflow */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-swing-navy/5 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">
                  Workflow: Lagerbest&auml;nde aktualisieren
                </p>
              </div>
              <div className="space-y-0 px-4 py-4">
                {[
                  {
                    step: "1",
                    icon: <FileSpreadsheet size={14} />,
                    title: "CSV aus WinLine exportieren",
                    desc: "Exportieren Sie die aktuelle Bestandsliste als CSV-Datei aus Mesonic WinLine.",
                  },
                  {
                    step: "2",
                    icon: <Upload size={14} />,
                    title: "CSV hochladen",
                    desc: "Navigieren Sie zu Lagerbestand und laden Sie die CSV-Datei im Bereich \u201eWinLine Bestandsliste importieren\u201c hoch.",
                  },
                  {
                    step: "3",
                    icon: <Sparkles size={14} />,
                    title: "KI-Analyse",
                    desc: "Gemini analysiert die Artikelbezeichnungen und ordnet sie automatisch den Katalog-Produkten, Gr\u00f6\u00dfen und Farbdesigns zu. Nur Artikel mit \u201e-NL-\u201c oder \u201e-NE-\u201c werden ber\u00fccksichtigt.",
                  },
                  {
                    step: "4",
                    icon: <Eye size={14} />,
                    title: "Ergebnis pr\u00fcfen",
                    desc: "Sie sehen eine \u00dcbersicht: CSV-Zeilen gesamt, gefilterte Artikel, zugeordnete Artikel (gr\u00fcn) und nicht zugeordnete (rot). Die Artikel sind nach Produkt gruppiert.",
                  },
                  {
                    step: "5",
                    icon: <CheckCircle2 size={14} />,
                    title: "Best\u00e4nde aktualisieren",
                    desc: "Klicken Sie \u201eBest\u00e4nde aktualisieren\u201c. Alle zugeordneten Lagerst\u00e4nde werden in der Datenbank aktualisiert und sind sofort im Katalog sichtbar.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
                        {item.icon}
                      </div>
                      {i < 4 && <div className="mt-1 h-full w-px bg-gray-200" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-[12px] font-bold text-swing-navy">
                        Schritt {item.step}: {item.title}
                      </p>
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
                  <strong>Gr&uuml;n:</strong> Sofort verf&uuml;gbar (&gt;10 St&uuml;ck)
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <strong>Gelb:</strong> Geringe St&uuml;ckzahl (1&ndash;10 St&uuml;ck)
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <strong>Rot:</strong> Nicht auf Lager &ndash; Lieferzeit wird angezeigt
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                KI-Funktion: Google Gemini 2.0 Flash &ndash; Kosten pro CSV-Import ca. 0,005&ndash;0,02 &euro;
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[12px] font-semibold text-amber-800">
                <AlertTriangle size={12} className="mr-1 inline" />
                Tipp: Der manuelle Lagerbestand pro Gr&ouml;&szlig;e kann auch direkt unter Produkte &rarr; Produkt &rarr; Lagerbestand bearbeitet werden, falls einzelne Korrekturen n&ouml;tig sind.
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
              sehen Sie alle Bestellanfragen aller H&auml;ndler.
            </p>

            {/* Status-Workflow */}
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

            <p><strong>Pro Anfrage k&ouml;nnen Sie:</strong></p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>
                <strong>Status &auml;ndern</strong> &ndash; Per Dropdown oder auf der Kundendetailseite per Kanban-Board (Drag &amp; Drop)
              </li>
              <li>
                <strong>Details einsehen</strong> &ndash; Klappen Sie die Anfrage auf, um Positionen zu sehen (Produkt, Gr&ouml;&szlig;e, SKU, Farbe, Menge, Preis)
              </li>
              <li>
                <strong>Notizen hinzuf&uuml;gen</strong> &ndash; Interne Anmerkungen (werden automatisch gespeichert)
              </li>
              <li>
                <strong>Tracking eingeben</strong> &ndash; Bei Status &quot;Versendet&quot;: W&auml;hlen Sie den Versanddienstleister (DPD, DHL, UPS, GLS, FedEx, Post AT) und geben Sie die Trackingnummer ein
              </li>
            </ul>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Truck size={12} />
                Versand &amp; Tracking
              </p>
              <p>
                Sobald Sie eine Trackingnummer eingeben und auf <strong>&quot;Versenden&quot;</strong> klicken, erh&auml;lt der H&auml;ndler automatisch eine <strong>E-Mail mit Tracking-Link</strong> (DHL, DPD, UPS etc.).
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <MessageSquare size={12} />
                E-Mail-Benachrichtigungen
              </p>
              <p>Der H&auml;ndler erh&auml;lt automatisch E-Mails bei:</p>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>Freischaltung seines Accounts</li>
                <li>Status&auml;nderung seiner Anfragen</li>
                <li>Versand mit Trackingnummer</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. Übersetzungen */}
        <section id="uebersetzungen" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Languages size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              &Uuml;bersetzungen (DE &rarr; EN / FR)
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Das Portal ist dreisprachig: <strong>Deutsch</strong> (Standard), <strong>Englisch</strong> und <strong>Franz&ouml;sisch</strong>. Es gibt zwei Arten von &Uuml;bersetzungen:
            </p>

            {/* Produkt-Übersetzung */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Package size={12} />
                1. Produkttexte &uuml;bersetzen
              </p>
              <p>
                Im Produktformular klicken Sie auf den <strong>Sparkles-Button</strong> neben &quot;&Uuml;bersetzungen&quot;. Die KI &uuml;bersetzt Name, Beschreibung, Einsatzbereich und Aktionstext automatisch von DE nach EN und FR.
              </p>
              <p className="mt-1 text-swing-gray-dark/60">
                Wo: Produkte &rarr; Bearbeiten &rarr; Abschnitt &quot;&Uuml;bersetzungen&quot;
              </p>
            </div>

            {/* UI-Übersetzung */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Globe size={12} />
                2. Portal-Oberfl&auml;che &uuml;bersetzen
              </p>
              <p>
                Im Admin-Header finden Sie den <strong>i18n-Button</strong> (Weltkugel mit &quot;i18n&quot;). Dieser &uuml;bersetzt die gesamte Benutzeroberfl&auml;che (Men&uuml;s, Buttons, Texte) nach EN und FR.
              </p>
              <p className="mt-1 text-swing-gray-dark/60">
                Wo: Admin-Header &rarr; i18n-Button (rechts neben dem Sprachumschalter)
              </p>
              <p className="mt-2">
                Der Button zeigt den Fortschritt an (&quot;&Uuml;bersetze &rarr; EN...&quot;, &quot;&Uuml;bersetze &rarr; FR...&quot;). Die &uuml;bersetzten Dateien werden automatisch heruntergeladen und m&uuml;ssen in den Code eingepflegt werden.
              </p>
            </div>

            {/* Kategorien */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <BarChart3 size={12} />
                3. Kategorien &uuml;bersetzen
              </p>
              <p>
                Kategorienamen werden ebenfalls automatisch &uuml;bersetzt. Dies geschieht &uuml;ber die API-Route und aktualisiert die Datenbank direkt.
              </p>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                KI-Funktion: Gemini 2.0 Flash &ndash; Kosten pro UI-&Uuml;bersetzung ca. 0,01&ndash;0,03 &euro;, pro Produkt ca. 0,001&ndash;0,003 &euro;
              </p>
            </div>
          </div>
        </section>

        {/* 8. KI-Funktionen & Kosten */}
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
              Das Portal nutzt <strong>Google Gemini 2.0 Flash</strong> f&uuml;r mehrere Automatisierungen. Jeder KI-Aufruf verbraucht API-Tokens, die Kosten verursachen.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                &Uuml;bersicht aller KI-Funktionen
              </p>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-3 font-bold text-swing-navy/60">Funktion</th>
                    <th className="pb-2 pr-3 font-bold text-swing-navy/60">Modell</th>
                    <th className="pb-2 font-bold text-swing-navy/60">Kosten ca.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 pr-3">PDF-Preisliste parsen</td>
                    <td className="py-2 pr-3 text-swing-gray-dark/60">Gemini 2.0 Flash (Vision)</td>
                    <td className="py-2 font-semibold">0,01&ndash;0,05 &euro;/PDF</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">CSV-Lagerbestand analysieren</td>
                    <td className="py-2 pr-3 text-swing-gray-dark/60">Gemini 2.0 Flash</td>
                    <td className="py-2 font-semibold">0,005&ndash;0,02 &euro;/CSV</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">Produkttext &uuml;bersetzen</td>
                    <td className="py-2 pr-3 text-swing-gray-dark/60">Gemini 2.0 Flash</td>
                    <td className="py-2 font-semibold">0,001&ndash;0,003 &euro;/Produkt</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">UI-Oberfl&auml;che &uuml;bersetzen</td>
                    <td className="py-2 pr-3 text-swing-gray-dark/60">Gemini 2.0 Flash</td>
                    <td className="py-2 font-semibold">0,01&ndash;0,03 &euro;/Sprache</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">Kategorien &uuml;bersetzen</td>
                    <td className="py-2 pr-3 text-swing-gray-dark/60">Gemini 2.0 Flash</td>
                    <td className="py-2 font-semibold">0,001&ndash;0,005 &euro;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-[12px] font-semibold text-blue-800">
                <DollarSign size={12} className="mr-1 inline" />
                <strong>Kosteneinsch&auml;tzung:</strong> Bei normalem Betrieb (20&ndash;50 Preislisten/Monat, w&ouml;chentliche Lager-Updates, gelegentliche &Uuml;bersetzungen) liegen die KI-Kosten bei unter <strong>2&ndash;5 &euro;/Monat</strong>.
              </p>
            </div>

            <p>
              An jeder Stelle im Admin-Bereich, wo KI eingesetzt wird, finden Sie ein <strong>Info-Symbol</strong> (Fragezeichen mit Sparkles). Klicken Sie darauf f&uuml;r Details zur jeweiligen KI-Funktion und den damit verbundenen Kosten.
            </p>
          </div>
        </section>

        {/* 9. Rollen */}
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
                    <td className="py-2.5 pr-3">
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Superadmin</span>
                    </td>
                    <td className="py-2.5">Voller Zugriff auf alles + Rollenverwaltung anderer Benutzer</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">Admin</span>
                    </td>
                    <td className="py-2.5">Produkte, Kunden, Lager, Anfragen verwalten, Preislisten hochladen, &Uuml;bersetzungen</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3">
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-700">Buyer / H&auml;ndler</span>
                    </td>
                    <td className="py-2.5">Katalog ansehen, Preise einsehen, Warenkorb nutzen, Anfragen senden</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Die Rollenverwaltung finden Sie unter{" "}
              <Link href="/admin/profil" className="font-semibold text-swing-navy underline">
                Admin &rarr; Profil
              </Link>{" "}
              (nur f&uuml;r Superadmins sichtbar). Dort k&ouml;nnen Sie Rollen zuweisen und Benutzer Firmen zuordnen.
            </p>
          </div>
        </section>

        {/* 10. Tipps */}
        <section id="tipps" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-gold text-swing-navy">
              <CheckCircle2 size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Tipps &amp; Best Practices
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                <span>
                  <strong>Lagerbest&auml;nde regelm&auml;&szlig;ig aktualisieren</strong> &ndash; Exportieren Sie w&ouml;chentlich die WinLine-CSV und laden Sie sie hoch. So sind die Ampeln im Katalog immer aktuell.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                <span>
                  <strong>Preislisten pr&uuml;fen</strong> &ndash; Nach dem Upload immer &quot;Als Kunde ansehen&quot; nutzen, um die Preise im Katalog zu kontrollieren.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                <span>
                  <strong>Neue Registrierungen zeitnah freischalten</strong> &ndash; H&auml;ndler erwarten eine schnelle Freischaltung. Das Dashboard zeigt ausstehende Anfragen prominent an.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                <span>
                  <strong>SKUs konsistent halten</strong> &ndash; Die KI matcht Preislisten und Lagerbest&auml;nde anhand der SKUs. Stellen Sie sicher, dass SKUs im Portal mit denen in WinLine und den PDF-Preislisten &uuml;bereinstimmen.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                <span>
                  <strong>Produktbilder optimieren</strong> &ndash; Verwenden Sie hochwertige Produktfotos. Farbdesign-Bilder werden automatisch auf 500&times;500px skaliert.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                <span>
                  <strong>Notizen nutzen</strong> &ndash; Auf der Kundendetailseite k&ouml;nnen Sie interne Notizen hinterlegen (z.B. &quot;Sonderkonditionen bis Q2&quot;, &quot;Nur Preorder&quot;). Diese sind nur f&uuml;r Admins sichtbar.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-swing-gold">&bull;</span>
                <span>
                  <strong>Tracking-Nummern eingeben</strong> &ndash; Der H&auml;ndler erh&auml;lt automatisch eine E-Mail mit klickbarem Tracking-Link f&uuml;r den jeweiligen Versanddienstleister.
                </span>
              </li>
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
