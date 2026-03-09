import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Send,
  ClipboardList,
  UserCircle,
  LayoutDashboard,
  Package,
  Palette,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  CircleDot,
  CheckCircle2,
  Truck,
  Filter,
  BookOpen,
} from "lucide-react";

export default function AnleitungPage() {
  return (
    <div className="min-h-screen bg-swing-gray-light">
      {/* Hero */}
      <div className="dash-hero px-5 py-10 sm:px-8 sm:py-14">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link
            href="/katalog"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            Zum Katalog
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-swing-gold" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Anleitung B2B-Portal
            </h1>
          </div>
          <p className="mt-2 text-sm text-white/50">
            So nutzen Sie das SWING B2B-Portal &mdash; Schritt f&uuml;r Schritt.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:px-8">

        {/* Quick Workflow Example */}
        <section className="card overflow-hidden">
          <div className="bg-swing-gold/10 px-6 py-4 sm:px-8">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-swing-navy">
              Schnelleinstieg &mdash; Ihre erste Bestellanfrage
            </h2>
            <p className="mt-1 text-[13px] text-swing-gray-dark/60">
              Beispiel: Sie m&ouml;chten 2&times; Mirage 2 RS in Gr&ouml;&szlig;e M bestellen.
            </p>
          </div>
          <div className="space-y-0 px-6 py-5 sm:px-8">
            {[
              {
                step: "1",
                icon: <Search size={16} />,
                title: "Produkt finden",
                desc: (
                  <>
                    &Ouml;ffnen Sie den{" "}
                    <Link href="/katalog" className="font-semibold text-swing-navy underline">
                      Katalog
                    </Link>{" "}
                    und suchen Sie nach &quot;Mirage&quot; oder filtern Sie nach Kategorie.
                  </>
                ),
              },
              {
                step: "2",
                icon: <Palette size={16} />,
                title: "Farbe & Gr\u00f6\u00dfe w\u00e4hlen",
                desc: "Klicken Sie auf das Produkt. W\u00e4hlen Sie Ihr gew\u00fcnschtes Farbdesign, dann die Gr\u00f6\u00dfe M.",
              },
              {
                step: "3",
                icon: <ShoppingCart size={16} />,
                title: "In den Warenkorb",
                desc: "Geben Sie die Menge 2 ein und klicken Sie auf \u201eIn den Warenkorb\u201c. Die Anzahl erscheint oben rechts am Warenkorb-Symbol.",
              },
              {
                step: "4",
                icon: <Send size={16} />,
                title: "Anfrage absenden",
                desc: (
                  <>
                    &Ouml;ffnen Sie den{" "}
                    <Link href="/katalog/warenkorb" className="font-semibold text-swing-navy underline">
                      Warenkorb
                    </Link>
                    , pr&uuml;fen Sie Ihre Positionen, f&uuml;gen Sie optional eine Notiz hinzu und klicken Sie auf &quot;Anfrage absenden&quot;.
                  </>
                ),
              },
              {
                step: "5",
                icon: <CheckCircle2 size={16} />,
                title: "Best\u00e4tigung",
                desc: "Sie erhalten eine Best\u00e4tigung. Das SWING-Vertriebsteam bearbeitet Ihre Anfrage und meldet sich bei Ihnen.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 py-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
                    {item.icon}
                  </div>
                  {i < 4 && <div className="mt-1 h-full w-px bg-gray-200" />}
                </div>
                <div className="pb-2">
                  <p className="text-[13px] font-bold text-swing-navy">
                    Schritt {item.step}: {item.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-swing-gray-dark/70">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Table of Contents */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            Inhalt
          </h2>
          <nav className="space-y-1.5">
            {[
              { href: "#katalog", label: "Produktkatalog durchsuchen" },
              { href: "#produkt", label: "Produktdetails & Preise" },
              { href: "#warenkorb", label: "Warenkorb & Bestellanfrage" },
              { href: "#anfragen", label: "Anfragen-\u00dcbersicht" },
              { href: "#dashboard", label: "Ihr Dashboard" },
              { href: "#profil", label: "Profil bearbeiten" },
              { href: "#kontakt", label: "Kontakt & Hilfe" },
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

        {/* 1. Katalog */}
        <section id="katalog" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Search size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Produktkatalog durchsuchen
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Im{" "}
              <Link href="/katalog" className="font-semibold text-swing-navy underline">
                Katalog
              </Link>{" "}
              finden Sie alle verf&uuml;gbaren SWING-Produkte mit Ihren individuellen H&auml;ndlerpreisen.
            </p>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Suchfunktion
              </p>
              <p>
                Geben Sie im Suchfeld den Produktnamen ein (z.B. &quot;Mirage&quot; oder &quot;Brave&quot;). Die Ergebnisse werden sofort gefiltert.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Filter size={12} />
                Filterfunktionen
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <strong>Kategorie:</strong> Gleitschirme, Tandem, Motor, Miniwings, Speedflying, Parakites, Gurtzeuge, Zubeh&ouml;r
                </li>
                <li>
                  <strong>EN-Klasse:</strong> EN-A, EN-A/B, LOW EN-B, MID EN-B, HIGH EN-B, EN-C 2-Liner, EN-D 2-Liner
                </li>
                <li>
                  <strong>Gewichtsklasse:</strong> N-LITE, D-LITE, U-LITE
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Produkt-Badges
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    Coming Soon
                  </span>{" "}
                  &mdash; Demn&auml;chst verf&uuml;gbar
                </li>
                <li>
                  <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                    Preorder
                  </span>{" "}
                  &mdash; Vorbestellung m&ouml;glich
                </li>
                <li>
                  <span className="inline-block rounded bg-gray-200 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
                    Fade Out
                  </span>{" "}
                  &mdash; Auslaufmodell, nur solange Vorrat reicht
                </li>
                <li>
                  <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
                    Aktion
                  </span>{" "}
                  &mdash; Zeitlich begrenztes Sonderangebot
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Lagerampel
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span><strong>Gr&uuml;n:</strong> Sofort verf&uuml;gbar (&gt;10 St&uuml;ck)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span><strong>Gelb:</strong> Geringe St&uuml;ckzahl (1&ndash;10 St&uuml;ck)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span><strong>Rot:</strong> Nicht auf Lager, Lieferzeit beachten</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Product Detail */}
        <section id="produkt" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Package size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Produktdetails &amp; Preise
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Klicken Sie im Katalog auf ein Produkt, um die Detailseite zu &ouml;ffnen. Dort finden Sie:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <strong>Produktbeschreibung</strong> und technische Daten (Gewichtsbereich, Startgewicht, Fl&auml;che etc.)
              </li>
              <li>
                <strong>Farbdesigns</strong> &mdash; W&auml;hlen Sie ein Design per Klick aus. Bei manchen Modellen gibt es limitierte Designs.
              </li>
              <li>
                <strong>Gr&ouml;&szlig;en &amp; Verf&uuml;gbarkeit</strong> &mdash; Jede Gr&ouml;&szlig;e zeigt:
                <ul className="ml-4 mt-1 list-disc space-y-1">
                  <li>Ihren individuellen <strong>H&auml;ndler-EK</strong> (Netto)</li>
                  <li>Die <strong>UVP</strong> (Brutto) zum Vergleich</li>
                  <li>Ihren <strong>Rabatt</strong> in Prozent</li>
                  <li>Den aktuellen <strong>Lagerstand</strong> (Ampel)</li>
                  <li>Die <strong>Lieferzeit</strong> bei Nicht-Verf&uuml;gbarkeit</li>
                </ul>
              </li>
              <li>
                <strong>&Auml;hnliche Produkte</strong> und <strong>Zubeh&ouml;r</strong> am Ende der Seite
              </li>
            </ul>
            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                Hinweis: Die angezeigten Preise sind Ihre individuellen H&auml;ndlerpreise und k&ouml;nnen sich von anderen H&auml;ndlern unterscheiden.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Cart */}
        <section id="warenkorb" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <ShoppingCart size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Warenkorb &amp; Bestellanfrage
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              <strong>Produkt zum Warenkorb hinzuf&uuml;gen:</strong>
            </p>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>W&auml;hlen Sie auf der Produktdetailseite ein <strong>Farbdesign</strong></li>
              <li>Stellen Sie bei der gew&uuml;nschten Gr&ouml;&szlig;e die <strong>Menge</strong> ein (+ / &minus; Buttons)</li>
              <li>
                Klicken Sie <strong>&quot;In den Warenkorb&quot;</strong> &mdash; das Warenkorb-Symbol im Header zeigt die aktuelle Anzahl
              </li>
            </ol>
            <p className="mt-3">
              <strong>Warenkorb pr&uuml;fen &amp; Anfrage absenden:</strong>
            </p>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>
                Klicken Sie auf das Warenkorb-Symbol im Header oder navigieren Sie zum{" "}
                <Link href="/katalog/warenkorb" className="font-semibold text-swing-navy underline">
                  Warenkorb
                </Link>
              </li>
              <li>Pr&uuml;fen Sie Ihre Positionen &mdash; Menge kann direkt angepasst werden</li>
              <li>F&uuml;gen Sie bei Bedarf eine <strong>Notiz</strong> hinzu (z.B. gew&uuml;nschter Liefertermin)</li>
              <li>
                Klicken Sie <strong>&quot;Anfrage absenden&quot;</strong>
              </li>
            </ol>
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-[12px] font-semibold text-blue-800">
                Wichtig: Die Bestellanfrage ist <strong>unverbindlich</strong>. Es handelt sich um eine Anfrage, kein verbindlicher Kauf. Das SWING-Vertriebsteam wird Ihre Anfrage pr&uuml;fen und sich mit einem Angebot bei Ihnen melden.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Inquiries */}
        <section id="anfragen" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <ClipboardList size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Anfragen-&Uuml;bersicht
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Unter{" "}
              <Link href="/katalog/anfragen" className="font-semibold text-swing-navy underline">
                Anfragen
              </Link>{" "}
              sehen Sie alle Ihre bisherigen Bestellanfragen mit aktuellem Status.
            </p>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                Status-Bedeutung
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <CircleDot size={14} className="mt-0.5 shrink-0 text-blue-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">Neu</p>
                    <p className="text-swing-gray-dark/60">Ihre Anfrage ist eingegangen und wird bearbeitet.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={14} className="mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">In Bearbeitung</p>
                    <p className="text-swing-gray-dark/60">Das Vertriebsteam pr&uuml;ft Ihre Anfrage und bereitet ein Angebot vor.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={14} className="mt-0.5 shrink-0 text-purple-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">Versendet</p>
                    <p className="text-swing-gray-dark/60">Ihre Bestellung wurde versandt. Tracking-Informationen sind hinterlegt.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">Abgeschlossen</p>
                    <p className="text-swing-gray-dark/60">Die Bestellung ist vollst&auml;ndig abgewickelt.</p>
                  </div>
                </div>
              </div>
            </div>
            <p>
              Jede Anfrage zeigt die einzelnen Positionen (Produkt, Gr&ouml;&szlig;e, Farbe, Menge) sowie den Gesamtwert.
            </p>
          </div>
        </section>

        {/* 5. Dashboard */}
        <section id="dashboard" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <LayoutDashboard size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Ihr Dashboard
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Das{" "}
              <Link href="/katalog/dashboard" className="font-semibold text-swing-navy underline">
                Dashboard
              </Link>{" "}
              ist Ihre Startseite nach dem Login. Hier finden Sie:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>
                <strong>Kontaktdaten</strong> &mdash; Hotline, E-Mail und Gesch&auml;ftszeiten des SWING-Vertriebsteams
              </li>
              <li>
                <strong>Kennzahlen</strong> &mdash; Gesamtanzahl Anfragen, Gesamtwert, offene und abgeschlossene Anfragen
              </li>
              <li>
                <strong>Firmendaten</strong> &mdash; Ihre Firma, Typ, Freischaltungsstatus und Produktkategorien
              </li>
              <li>
                <strong>Preislisten</strong> &mdash; Ihre hinterlegten Preislisten als PDF zum Download
              </li>
              <li>
                <strong>Nachrichten</strong> &mdash; Notizen vom SWING-Team f&uuml;r Sie (z.B. Sonderangebote, Hinweise)
              </li>
              <li>
                <strong>Letzte Anfragen</strong> &mdash; Ihre aktuellsten Bestellanfragen auf einen Blick
              </li>
            </ul>
          </div>
        </section>

        {/* 6. Profile */}
        <section id="profil" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <UserCircle size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Profil bearbeiten
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Unter{" "}
              <Link href="/katalog/profil" className="font-semibold text-swing-navy underline">
                Profil
              </Link>{" "}
              (Personen-Symbol im Header) k&ouml;nnen Sie Ihre Daten aktualisieren:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>
                <strong>Firmendaten</strong> &mdash; Firmenname, USt-ID
              </li>
              <li>
                <strong>Kontakt</strong> &mdash; Ansprechpartner, E-Mail, Telefon, WhatsApp
              </li>
              <li>
                <strong>Adresse</strong> &mdash; Stra&szlig;e, PLZ, Ort, Land
              </li>
            </ul>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[12px] font-semibold text-amber-800">
                Firmentyp und Produktkategorien werden vom SWING-Team zugewiesen und k&ouml;nnen nicht selbst ge&auml;ndert werden.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Contact */}
        <section id="kontakt" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Phone size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              Kontakt &amp; Hilfe
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              Bei Fragen zum Portal oder zu Bestellungen erreichen Sie das SWING-Vertriebsteam:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Phone size={18} className="mx-auto mb-2 text-swing-navy/40" />
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/40">Hotline</p>
                <a
                  href="tel:+4981413277888"
                  className="mt-1 block text-[13px] font-semibold text-swing-navy transition-colors hover:text-swing-gold"
                >
                  +49 (0)8141 32 77 888
                </a>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Mail size={18} className="mx-auto mb-2 text-swing-navy/40" />
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/40">E-Mail</p>
                <a
                  href="mailto:info@swing.de"
                  className="mt-1 block text-[13px] font-semibold text-swing-navy transition-colors hover:text-swing-gold"
                >
                  info@swing.de
                </a>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Clock size={18} className="mx-auto mb-2 text-swing-navy/40" />
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/40">Gesch&auml;ftszeiten</p>
                <p className="mt-1 text-[13px] font-semibold text-swing-navy">
                  Mo&ndash;Do 9&ndash;12 / 13&ndash;17
                </p>
                <p className="text-[13px] font-semibold text-swing-navy">
                  Fr 9&ndash;12 / 13&ndash;15
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer nav */}
        <div className="flex items-center justify-between pb-4">
          <Link
            href="/katalog"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-swing-navy transition-colors hover:text-swing-gold"
          >
            <ArrowLeft size={14} />
            Zum Katalog
          </Link>
          <div className="flex items-center gap-4 text-[12px] text-swing-gray-dark/40">
            <Link href="/impressum" className="transition-colors hover:text-swing-navy">
              Impressum
            </Link>
            <Link href="/datenschutz" className="transition-colors hover:text-swing-navy">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
