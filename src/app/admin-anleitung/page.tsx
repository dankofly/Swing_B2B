import Link from "next/link";
import { getLocale } from "@/lib/i18n";
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

const t = {
  de: {
    // Hero section
    backToDashboard: "Zum Admin-Dashboard",
    title: "Admin-Handbuch",
    subtitle: "Vollständige Anleitung für die Verwaltung des SWING B2B-Portals.",

    // Quick start section
    quickStart: "Schnelleinstieg",
    quickStartDesc: "Die drei wichtigsten Workflows auf einen Blick — für den sofortigen Produktivstart.",

    // Quick start workflows
    workflow1Title: "Bestellanfrage bearbeiten (Sales)",
    workflow1Steps: [
      "Anfragen öffnen — neue Anfragen haben einen blauen Puls",
      "Anfrage aufklappen → Positionen prüfen (Produkt, Größe, Farbe, Menge, Preis)",
      "Status ändern:",
      "Ware kommissionieren und versenden",
      "Status auf",
      "setzen → Versanddienstleister wählen (DPD, DHL, UPS…) → Trackingnummer eingeben → \"Versenden\" klicken",
      "Händler erhält automatisch eine E-Mail mit Tracking-Link",
      "Nach Zustellung: Status auf"
    ],
    inProcessing: "In Bearbeitung",
    shipped: "Versendet",
    completed: "Abgeschlossen",
    workflow1Tip: "Tipp: Auf der Kundendetailseite können Sie Anfragen auch per Kanban-Board (Drag & Drop) bearbeiten.",

    workflow2Title: "Neues Produkt anlegen",
    workflow2Steps: [
      "Produkte → + Neues Produkt",
      "Stammdaten: Name (DE), Kategorie wählen, EN-Klasse, Gewichtsklasse, Beschreibung, Einsatzbereich",
      "Badges: Optional — Coming Soon, Preorder, Fade Out, Aktion (mit Aktionstext)",
      "Bilder: Produktbilder hochladen (Drag & Drop). Erstes Bild = Hauptbild",
      "Größen: Varianten hinzufügen (XS, S, M, L…) — jede mit eindeutiger SKU und Lieferzeit in Wochen",
      "Farbdesigns: Name + Bild (500×500px), optional \"Limitiert\"",
      "Übersetzen: Sparkles-Button klicken → KI übersetzt Name, Beschreibung, Einsatzbereich nach EN + FR",
      "Speichern → Produkt erscheint sofort im Katalog"
    ],

    workflow3Title: "Kunde anlegen + Preisliste hochladen",
    workflow3Steps: [
      "Kunden → + Neuer Kunde — Firmendaten eingeben, Typ wählen (Händler/Importeur), sofort freischalten",
      "Auf der Kundendetailseite zum Abschnitt \"Preislisten\" scrollen",
      "Kategorie wählen (Gleitschirme, Miniwings, Parakites…) → PDF hochladen",
      "KI analysiert die PDF-Tabelle automatisch: Modellname, UVP, Händler-EK, Größen",
      "Vorschau prüfen: Grün = Match, Rot = nicht gefunden. Rabatte bei Bedarf anpassen",
      "\"Anwenden\" klicken → Preise werden gespeichert",
      "Kontrolle: \"Katalog als Kunde\" klicken → Sie sehen den Katalog mit den individuellen Preisen dieses Händlers"
    ],
    workflow3Warning: "SKUs in der Preisliste müssen mit den SKUs im Katalog übereinstimmen. Die KI matcht primär über den Modellnamen.",

    // Table of contents
    detailedDocsTitle: "Ausführliche Dokumentation",
    tocItems: {
      dashboard: "Dashboard",
      products: "Produkte verwalten",
      customers: "Kunden & Freischaltung",
      pricelists: "Preislisten (KI-Parsing)",
      inventory: "Lagerbestände (WinLine CSV)",
      inquiries: "Bestellanfragen",
      news: "Neuigkeiten (News-Ticker)",
      translations: "Übersetzungen (DE/EN/FR)",
      ai: "KI-Funktionen & Kosten",
      roles: "Benutzerrollen & Rechte",
      tips: "Tipps & Best Practices"
    },

    // Sections
    dashboardTitle: "Dashboard",
    dashboardDesc: "Das Admin-Dashboard zeigt alle wichtigen Kennzahlen auf einen Blick:",
    dashboardMetrics: {
      products: "Aktive, Coming Soon, Preorder — Direktlink zur Verwaltung.",
      inventory: "Auf Lager (>5), Geringer Bestand (1–5), Nicht auf Lager (0).",
      inquiries: "Offene, in Bearbeitung, versendete und abgeschlossene Anfragen.",
      customers: "Händler, Importeure und Importeure mit Netzwerk."
    },
    dashboardFeatures: "Darunter: KI-Briefing (generierte Zusammenfassung des aktuellen Status), letzte Anfragen mit Status und Firmennamen, und Weltzeituhr (HQ, Tokyo, New York, Sydney).",

    productsTitle: "Produkte verwalten",
    productOverviewTitle: "Produktübersicht",
    productOverviewDesc: "Unter Produkte sehen Sie alle Produkte in einer sortierbaren Liste:",
    productOverviewFeatures: [
      "Suchen nach Name, Kategorie oder SKU",
      "Sortieren per Drag & Drop oder Pfeiltasten",
      "Status umschalten — Aktiv/Inaktiv per Toggle",
      "Badges — Coming Soon, Preorder, Fade Out, Aktion direkt sichtbar"
    ],
    productFormTitle: "Produktformular",
    productFormSteps: [
      "Stammdaten: Name (DE), Kategorie, EN-Klasse, Gewichtsklasse, Beschreibung, Einsatzbereich, UVP brutto",
      "Badges: Coming Soon, Preorder, Fade Out, Aktion (mit Aktionstext)",
      "Bilder: Mehrere Produktbilder (Drag & Drop), erstes = Hauptbild",
      "Größen: Varianten (XS, S, M, L…) mit SKU und Lieferzeit in Wochen",
      "Farbdesigns: Name + Bild (500×500px), optional \"Limitiert\", optional Klassifizierung (N-LITE, D-LITE, U-LITE)",
      "Ähnliche Produkte / Zubehör: Verknüpfung mit anderen Produkten",
      "Übersetzungen: KI-Button übersetzt DE → EN + FR"
    ],
    productActionsTitle: "Aktionen pro Produkt",
    productActions: [
      { icon: "Pencil", title: "Bearbeiten", desc: "Produktformular mit allen Daten" },
      { icon: "Warehouse", title: "Lagerbestand", desc: "Manuelle Eingabe pro Größe + Farbe" },
      { icon: "ToggleRight", title: "Aktiv/Inaktiv", desc: "Inaktive werden im Katalog ausgeblendet" },
      { icon: "Trash2", title: "Löschen", desc: "Unwiderruflich (Bestätigung erforderlich)" }
    ],

    customersTitle: "Kunden & Freischaltung",
    registrationTitle: "Registrierung & Freischaltung",
    registrationSteps: [
      "Händler registriert sich über die Startseite",
      "Sie erhalten eine E-Mail-Benachrichtigung",
      "In der Kundenliste erscheint der Händler mit gelbem Puls-Indikator",
      "\"Freischalten\" klicken → Händler erhält Freischaltungs-E-Mail"
    ],
    manualCustomerTitle: "Kunden manuell anlegen",
    manualCustomerDesc: "Kunden → + Neuer Kunde — Firmendaten eingeben, Typ wählen (Händler, Importeur, Importeur mit Netzwerk), sofort freischalten.",
    customerDetailTitle: "Kunden-Detailseite",
    customerDetailFeatures: [
      "Stammdaten: Adresse, Kontakt, USt-ID, Firmentyp, Website",
      "Preislisten: PDF hochladen → KI-Parsing (pro Kategorie)",
      "Google Map: Standort des Kunden",
      "Interne Notizen: Nur für Admins sichtbar (z.B. \"Sonderkonditionen Q2\")",
      "Kundennotizen: Für den Kunden sichtbar markierbar",
      "Kanban-Board: Alle Anfragen im Überblick (Drag & Drop)",
      "\"Katalog als Kunde\" — Katalog mit individuellen Preisen ansehen"
    ],
    customerTip: "Tipp: Nutzen Sie \"Katalog als Kunde\" nach jedem Preislisten-Upload, um die Preise im Katalog zu kontrollieren.",

    pricelistsTitle: "Preislisten einpflegen (KI-Parsing)",
    pricelistsDesc: "Jeder Händler hat individuelle Preise. Diese werden über PDF-Preislisten eingepflegt.",
    pricelistWorkflow: "Workflow: Preisliste hochladen",
    pricelistSteps: [
      { step: "1", title: "Kunde auswählen", desc: "Kunden → Kundendetail → Abschnitt \u201EPreislisten\u201C" },
      { step: "2", title: "PDF hochladen", desc: "Kategorie wählen (Gleitschirme, Miniwings, Parakites…) und PDF-Datei hochladen." },
      { step: "3", title: "KI-Analyse", desc: "Gemini Vision analysiert die PDF-Tabelle: Modellname, UVP (Brutto), Händler-EK (Netto), Größen." },
      { step: "4", title: "Vorschau prüfen", desc: "Grün = Zuordnung OK, Rot = nicht gefunden. Rabatte können pro Position angepasst werden." },
      { step: "5", title: "Bestätigen", desc: "\u201EAnwenden für X Produkte\u201C — Preise werden gespeichert und sind sofort im Katalog sichtbar." }
    ],
    pricelistAiNote: "KI-Funktion: Google Gemini 2.0 Flash (Vision) — Kosten pro PDF ca. 0,01–0,05 €",

    inventoryTitle: "Lagerbestände importieren (WinLine CSV)",
    inventoryDesc: "Lagerbestände werden aus Mesonic WinLine per CSV importiert. Die CSV ist die einzige Wahrheit — nach dem Import werden alle Lagerbestände auf die CSV-Werte gesetzt.",
    inventoryWorkflow: "Workflow: Lagerbestände aktualisieren",
    inventorySteps: [
      { step: "1", title: "CSV aus WinLine exportieren", desc: "Aktuelle Bestandsliste als CSV exportieren." },
      { step: "2", title: "CSV hochladen", desc: "Lagerbestand → \u201EWinLine Bestandsliste importieren\u201C → Datei wählen." },
      { step: "3", title: "Automatische Zuordnung", desc: "Artikelbezeichnungen werden deterministisch + per KI den Katalog-Produkten zugeordnet. Nur Artikel mit \u201E-NL-\u201C oder \u201E-NE-\u201C werden berücksichtigt." },
      { step: "4", title: "Ergebnis prüfen", desc: "Übersicht: Zugeordnete Artikel (grün) und nicht zugeordnete (rot), nach Produkt gruppiert." },
      { step: "5", title: "Bestände aktualisieren", desc: "\u201EBestände aktualisieren\u201C klicken — alle Lagerbestände werden synchronisiert. Produkte, die nicht in der CSV vorkommen, werden auf 0 gesetzt." }
    ],
    inventoryIndicatorTitle: "Lagerampel im Katalog",
    inventoryIndicators: [
      { color: "emerald", status: "Grün:", desc: "Sofort verfügbar (>10 Stück)" },
      { color: "amber", status: "Gelb:", desc: "Geringe Stückzahl (1–10 Stück)" },
      { color: "red", status: "Rot:", desc: "Nicht auf Lager — Lieferzeit wird angezeigt" }
    ],
    inventoryManualNote: "Manueller Lagerbestand pro Größe/Farbe kann auch direkt unter Produkte → Produkt → Lagerbestand bearbeitet werden.",

    inquiriesTitle: "Bestellanfragen bearbeiten",
    inquiriesDesc: "Unter Anfragen sehen Sie alle Bestellanfragen aller Händler.",
    statusWorkflowTitle: "Status-Workflow",
    statusNew: "Neu",
    statusInProgress: "In Bearbeitung",
    statusShipped: "Versendet",
    statusCompleted: "Abgeschlossen",
    inquiryActions: "Pro Anfrage können Sie:",
    inquiryActionsList: [
      "Status ändern — Per Dropdown oder Kanban-Board auf der Kundendetailseite",
      "Details einsehen — Positionen aufklappen (Produkt, Größe, SKU, Farbe, Menge, Preis)",
      "Notizen hinzufügen — Interne Anmerkungen (werden automatisch gespeichert)",
      "Tracking eingeben — Versanddienstleister (DPD, DHL, UPS, GLS, FedEx, Post AT) + Trackingnummer"
    ],
    automaticEmailsTitle: "Automatische E-Mails",
    automaticEmails: [
      "Bei Freischaltung des Accounts",
      "Bei Statusänderung einer Anfrage",
      "Bei Versand mit klickbarem Tracking-Link"
    ],

    newsTitle: "Neuigkeiten (News-Ticker)",
    newsDesc: "Unter Neuigkeiten verwalten Sie den News-Ticker, der allen Händlern im Katalog angezeigt wird.",
    newsFeaturesTitle: "Funktionen",
    newsFeatures: [
      "Neue Nachricht: Deutschen Text eingeben, dann \"Auto\"-Button für automatische EN + FR Übersetzung",
      "Sprach-Tabs: DE / EN / FR — grüner Punkt zeigt ob Übersetzung vorhanden",
      "Aktivieren/Deaktivieren: Auge-Symbol pro Nachricht",
      "Bearbeiten: Auf den Text klicken zum Editieren",
      "Löschen: Papierkorb-Symbol (mit Bestätigung)",
      "Vorschau: Live-Ticker-Vorschau am unteren Rand"
    ],
    newsAutoNote: "Der \"Auto\"-Button übersetzt die deutsche Nachricht per KI nach EN und FR.",
    newsTypical: "Typische News: Neue Produkte, Aktionen, Preisänderungen, Lieferstatus-Updates, Messe-Hinweise.",

    translationsTitle: "Übersetzungen (DE → EN / FR)",
    translationsDesc: "Das Portal ist dreisprachig: Deutsch (Standard), Englisch und Französisch. Händler wählen die Sprache im Header.",
    translationTypes: [
      { type: "Produkttexte", action: "Im Produktformular den Button klicken." },
      { type: "Kategorien", action: "Werden automatisch per API übersetzt und in der DB gespeichert." },
      { type: "News", action: "Im News-Manager den \"Auto\"-Button pro Nachricht klicken." }
    ],

    aiTitle: "KI-Funktionen & Kosten",
    aiDesc: "Das Portal nutzt Google Gemini 2.0 Flash für Automatisierungen. Alle KI-Stellen sind mit einem Symbol markiert.",
    aiCostTable: {
      headers: ["Funktion", "Kosten ca."],
      rows: [
        ["PDF-Preisliste parsen", "0,01–0,05 €/PDF"],
        ["CSV-Lagerbestand analysieren", "0,005–0,02 €/CSV"],
        ["Produkttext übersetzen", "0,001–0,003 €/Produkt"],
        ["News übersetzen", "0,001 €/Nachricht"],
        ["Kategorien übersetzen", "0,001–0,005 €"],
        ["Dashboard KI-Briefing", "0,005–0,01 €/Aufruf"]
      ]
    },
    aiTotalCost: "Gesamt: Bei normalem Betrieb (20–50 Preislisten/Monat, wöchentliche Lager-Updates) unter 2–5 €/Monat.",

    rolesTitle: "Benutzerrollen & Rechte",
    rolesTable: {
      headers: ["Rolle", "Rechte"],
      rows: [
        ["Superadmin", "Voller Zugriff + Rollenverwaltung"],
        ["Admin", "Produkte, Kunden, Lager, Anfragen, News, Preislisten, Übersetzungen"],
        ["Händler", "Katalog, eigene Preise, Warenkorb, Anfragen senden, Anfrage-Historie"]
      ]
    },
    roleManagement: "Rollenverwaltung unter Admin → Profil (nur Superadmins).",

    tipsTitle: "Tipps & Best Practices",
    tips: [
      { title: "Lagerbestände wöchentlich aktualisieren", desc: "WinLine-CSV exportieren und hochladen — so sind die Ampeln im Katalog immer aktuell." },
      { title: "Preislisten nach Upload prüfen", desc: "Immer \u201EKatalog als Kunde\u201C nutzen, um die Preiszuordnung zu kontrollieren." },
      { title: "Registrierungen zeitnah freischalten", desc: "Händler erwarten schnelle Reaktion. Das Dashboard zeigt ausstehende Anfragen prominent." },
      { title: "SKUs konsistent halten", desc: "KI matcht Preislisten und Lager anhand SKUs. Portal, WinLine und PDFs müssen übereinstimmen." },
      { title: "Produktbilder hochwertig halten", desc: "Farbdesign-Bilder werden auf 500×500px skaliert. Produktbilder in möglichst hoher Qualität." },
      { title: "Notizen nutzen", desc: "Auf der Kundendetailseite können interne Notizen hinterlegt werden (z.B. \u201ESonderkonditionen bis Q2\u201C)." },
      { title: "Tracking-Nummern eingeben", desc: "Der Händler erhält automatisch eine E-Mail mit klickbarem Tracking-Link." },
      { title: "News-Ticker pflegen", desc: "Aktuelle Informationen zu neuen Produkten, Aktionen oder Lieferstatus im News-Ticker veröffentlichen." }
    ],

    // Footer
    customerGuide: "Kunden-Anleitung"
  },
  en: {
    // Hero section
    backToDashboard: "Back to Admin Dashboard",
    title: "Admin Manual",
    subtitle: "Complete guide for managing the SWING B2B portal.",

    // Quick start section
    quickStart: "Quick Start",
    quickStartDesc: "The three most important workflows at a glance — for immediate productivity.",

    // Quick start workflows
    workflow1Title: "Process Order Inquiry (Sales)",
    workflow1Steps: [
      "Open Inquiries — new inquiries have a blue pulse indicator",
      "Expand inquiry → Check positions (product, size, color, quantity, price)",
      "Change status:",
      "Pick and ship goods",
      "Set status to",
      "→ Select shipping carrier (DPD, DHL, UPS…) → Enter tracking number → Click \"Ship\"",
      "Dealer automatically receives an email with tracking link",
      "After delivery: Set status to"
    ],
    inProcessing: "In Processing",
    shipped: "Shipped",
    completed: "Completed",
    workflow1Tip: "Tip: On the customer detail page, you can also manage inquiries via Kanban board (drag & drop).",

    workflow2Title: "Create New Product",
    workflow2Steps: [
      "Products → + New Product",
      "Master data: Name (DE), select category, EN class, weight class, description, application area",
      "Badges: Optional — Coming Soon, Preorder, Fade Out, Action (with action text)",
      "Images: Upload product images (drag & drop). First image = main image",
      "Sizes: Add variants (XS, S, M, L…) — each with unique SKU and delivery time in weeks",
      "Color designs: Name + image (500×500px), optionally \"Limited\"",
      "Translate: Click Sparkles button → AI translates name, description, application area to EN + FR",
      "Save → Product appears immediately in catalog"
    ],

    workflow3Title: "Create Customer + Upload Price List",
    workflow3Steps: [
      "Customers → + New Customer — Enter company data, select type (Dealer/Importer), activate immediately",
      "Scroll to \"Price Lists\" section on customer detail page",
      "Select category (Paragliders, Miniwings, Parakites…) → Upload PDF",
      "AI automatically analyzes PDF table: Model name, RRP, dealer cost, sizes",
      "Check preview: Green = match, red = not found. Adjust discounts if needed",
      "Click \"Apply\" → Prices are saved",
      "Control: Click \"Catalog as customer\" → You see the catalog with this dealer's individual prices"
    ],
    workflow3Warning: "SKUs in the price list must match the SKUs in the catalog. The AI matches primarily via model name.",

    // Table of contents
    detailedDocsTitle: "Detailed Documentation",
    tocItems: {
      dashboard: "Dashboard",
      products: "Product Management",
      customers: "Customers & Activation",
      pricelists: "Price Lists (AI Parsing)",
      inventory: "Inventory (WinLine CSV)",
      inquiries: "Order Inquiries",
      news: "News (News Ticker)",
      translations: "Translations (DE/EN/FR)",
      ai: "AI Functions & Costs",
      roles: "User Roles & Rights",
      tips: "Tips & Best Practices"
    },

    // Sections
    dashboardTitle: "Dashboard",
    dashboardDesc: "The Admin Dashboard shows all important metrics at a glance:",
    dashboardMetrics: {
      products: "Active, Coming Soon, Preorder — direct link to management.",
      inventory: "In stock (>5), low stock (1–5), out of stock (0).",
      inquiries: "Open, in processing, shipped and completed inquiries.",
      customers: "Dealers, importers and importers with network."
    },
    dashboardFeatures: "Below: AI briefing (generated summary of current status), latest inquiries with status and company names, and world clock (HQ, Tokyo, New York, Sydney).",

    productsTitle: "Product Management",
    productOverviewTitle: "Product Overview",
    productOverviewDesc: "Under Products you see all products in a sortable list:",
    productOverviewFeatures: [
      "Search by name, category or SKU",
      "Sort via drag & drop or arrow keys",
      "Toggle status — Active/Inactive via toggle",
      "Badges — Coming Soon, Preorder, Fade Out, Action directly visible"
    ],
    productFormTitle: "Product Form",
    productFormSteps: [
      "Master data: Name (DE), category, EN class, weight class, description, application area, RRP gross",
      "Badges: Coming Soon, Preorder, Fade Out, Action (with action text)",
      "Images: Multiple product images (drag & drop), first = main image",
      "Sizes: Variants (XS, S, M, L…) with SKU and delivery time in weeks",
      "Color designs: Name + image (500×500px), optionally \"Limited\", optional classification (N-LITE, D-LITE, U-LITE)",
      "Similar products / accessories: Link with other products",
      "Translations: AI button translates DE → EN + FR"
    ],
    productActionsTitle: "Actions per Product",
    productActions: [
      { icon: "Pencil", title: "Edit", desc: "Product form with all data" },
      { icon: "Warehouse", title: "Inventory", desc: "Manual entry per size + color" },
      { icon: "ToggleRight", title: "Active/Inactive", desc: "Inactive products are hidden in catalog" },
      { icon: "Trash2", title: "Delete", desc: "Irreversible (confirmation required)" }
    ],

    customersTitle: "Customers & Activation",
    registrationTitle: "Registration & Activation",
    registrationSteps: [
      "Dealer registers via homepage",
      "You receive an email notification",
      "In customer list, dealer appears with yellow pulse indicator",
      "Click \"Activate\" → Dealer receives activation email"
    ],
    manualCustomerTitle: "Create Customers Manually",
    manualCustomerDesc: "Customers → + New Customer — Enter company data, select type (Dealer, Importer, Importer with Network), activate immediately.",
    customerDetailTitle: "Customer Detail Page",
    customerDetailFeatures: [
      "Master data: Address, contact, VAT ID, company type, website",
      "Price lists: Upload PDF → AI parsing (per category)",
      "Google Map: Customer location",
      "Internal notes: Only visible to admins (e.g. \"Special terms Q2\")",
      "Customer notes: Can be marked visible to customer",
      "Kanban board: All inquiries overview (drag & drop)",
      "\"Catalog as customer\" — View catalog with individual prices"
    ],
    customerTip: "Tip: Use \"Catalog as customer\" after each price list upload to check prices in the catalog.",

    pricelistsTitle: "Import Price Lists (AI Parsing)",
    pricelistsDesc: "Each dealer has individual prices. These are imported via PDF price lists.",
    pricelistWorkflow: "Workflow: Upload Price List",
    pricelistSteps: [
      { step: "1", title: "Select Customer", desc: "Customers → Customer Detail → \"Price Lists\" section" },
      { step: "2", title: "Upload PDF", desc: "Select category (Paragliders, Miniwings, Parakites…) and upload PDF file." },
      { step: "3", title: "AI Analysis", desc: "Gemini Vision analyzes PDF table: Model name, RRP (gross), dealer cost (net), sizes." },
      { step: "4", title: "Check Preview", desc: "Green = assignment OK, red = not found. Discounts can be adjusted per position." },
      { step: "5", title: "Confirm", desc: "\"Apply for X products\" — Prices are saved and immediately visible in catalog." }
    ],
    pricelistAiNote: "AI Function: Google Gemini 2.0 Flash (Vision) — Cost per PDF approx. €0.01–0.05",

    inventoryTitle: "Import Inventory (WinLine CSV)",
    inventoryDesc: "Inventory is imported from Mesonic WinLine via CSV. The CSV is the single source of truth — after import, all inventory levels are set to CSV values.",
    inventoryWorkflow: "Workflow: Update Inventory",
    inventorySteps: [
      { step: "1", title: "Export CSV from WinLine", desc: "Export current inventory list as CSV." },
      { step: "2", title: "Upload CSV", desc: "Inventory → \"Import WinLine Inventory List\" → Select file." },
      { step: "3", title: "Automatic Assignment", desc: "Article descriptions are deterministically + AI assigned to catalog products. Only articles with \"-NL-\" or \"-NE-\" are considered." },
      { step: "4", title: "Check Result", desc: "Overview: Assigned articles (green) and unassigned (red), grouped by product." },
      { step: "5", title: "Update Inventory", desc: "Click \"Update Inventory\" — all inventory levels are synchronized. Products not in CSV are set to 0." }
    ],
    inventoryIndicatorTitle: "Inventory Indicator in Catalog",
    inventoryIndicators: [
      { color: "emerald", status: "Green:", desc: "Immediately available (>10 pieces)" },
      { color: "amber", status: "Yellow:", desc: "Low quantity (1–10 pieces)" },
      { color: "red", status: "Red:", desc: "Out of stock — delivery time shown" }
    ],
    inventoryManualNote: "Manual inventory per size/color can also be edited directly under Products → Product → Inventory.",

    inquiriesTitle: "Process Order Inquiries",
    inquiriesDesc: "Under Inquiries you see all order inquiries from all dealers.",
    statusWorkflowTitle: "Status Workflow",
    statusNew: "New",
    statusInProgress: "In Processing",
    statusShipped: "Shipped",
    statusCompleted: "Completed",
    inquiryActions: "Per inquiry you can:",
    inquiryActionsList: [
      "Change status — Via dropdown or Kanban board on customer detail page",
      "View details — Expand positions (product, size, SKU, color, quantity, price)",
      "Add notes — Internal annotations (automatically saved)",
      "Enter tracking — Shipping carrier (DPD, DHL, UPS, GLS, FedEx, Austria Post) + tracking number"
    ],
    automaticEmailsTitle: "Automatic Emails",
    automaticEmails: [
      "Upon account activation",
      "Upon inquiry status change",
      "Upon shipping with clickable tracking link"
    ],

    newsTitle: "News (News Ticker)",
    newsDesc: "Under News you manage the news ticker displayed to all dealers in the catalog.",
    newsFeaturesTitle: "Features",
    newsFeatures: [
      "New message: Enter German text, then \"Auto\" button for automatic EN + FR translation",
      "Language tabs: DE / EN / FR — green dot shows if translation exists",
      "Activate/Deactivate: Eye symbol per message",
      "Edit: Click on text to edit",
      "Delete: Trash symbol (with confirmation)",
      "Preview: Live ticker preview at bottom"
    ],
    newsAutoNote: "The \"Auto\" button translates the German message via AI to EN and FR.",
    newsTypical: "Typical news: New products, promotions, price changes, delivery status updates, trade show announcements.",

    translationsTitle: "Translations (DE → EN / FR)",
    translationsDesc: "The portal is trilingual: German (default), English and French. Dealers select the language in the header.",
    translationTypes: [
      { type: "Product texts", action: "Click the button in the product form." },
      { type: "Categories", action: "Automatically translated via API and saved in DB." },
      { type: "News", action: "Click the \"Auto\" button per message in news manager." }
    ],

    aiTitle: "AI Functions & Costs",
    aiDesc: "The portal uses Google Gemini 2.0 Flash for automation. All AI features are marked with a symbol.",
    aiCostTable: {
      headers: ["Function", "Cost approx."],
      rows: [
        ["Parse PDF price list", "€0.01–0.05/PDF"],
        ["Analyze CSV inventory", "€0.005–0.02/CSV"],
        ["Translate product text", "€0.001–0.003/product"],
        ["Translate news", "€0.001/message"],
        ["Translate categories", "€0.001–0.005"],
        ["Dashboard AI briefing", "€0.005–0.01/call"]
      ]
    },
    aiTotalCost: "Total: With normal operation (20–50 price lists/month, weekly inventory updates) under €2–5/month.",

    rolesTitle: "User Roles & Rights",
    rolesTable: {
      headers: ["Role", "Rights"],
      rows: [
        ["Superadmin", "Full access + role management"],
        ["Admin", "Products, customers, inventory, inquiries, news, price lists, translations"],
        ["Dealer", "Catalog, own prices, shopping cart, send inquiries, inquiry history"]
      ]
    },
    roleManagement: "Role management under Admin → Profile (superadmins only).",

    tipsTitle: "Tips & Best Practices",
    tips: [
      { title: "Update inventory weekly", desc: "Export and upload WinLine CSV — keeps catalog indicators always current." },
      { title: "Check price lists after upload", desc: "Always use \"Catalog as customer\" to verify price assignment." },
      { title: "Activate registrations promptly", desc: "Dealers expect quick response. Dashboard shows pending requests prominently." },
      { title: "Keep SKUs consistent", desc: "AI matches price lists and inventory via SKUs. Portal, WinLine and PDFs must match." },
      { title: "Keep product images high quality", desc: "Color design images are scaled to 500×500px. Product images in highest possible quality." },
      { title: "Use notes", desc: "Internal notes can be stored on customer detail page (e.g. \"Special terms until Q2\")." },
      { title: "Enter tracking numbers", desc: "Dealer automatically receives email with clickable tracking link." },
      { title: "Maintain news ticker", desc: "Publish current information about new products, promotions or delivery status in news ticker." }
    ],

    // Footer
    customerGuide: "Customer Guide"
  },
  fr: {
    // Hero section
    backToDashboard: "Retour au tableau de bord admin",
    title: "Manuel d'administration",
    subtitle: "Guide complet pour la gestion du portail B2B SWING.",

    // Quick start section
    quickStart: "Démarrage rapide",
    quickStartDesc: "Les trois flux de travail les plus importants en un coup d'œil — pour une productivité immédiate.",

    // Quick start workflows
    workflow1Title: "Traiter une demande de commande (Ventes)",
    workflow1Steps: [
      "Ouvrir Demandes — les nouvelles demandes ont un indicateur bleu pulsant",
      "Développer la demande → Vérifier les positions (produit, taille, couleur, quantité, prix)",
      "Changer le statut :",
      "Prélever et expédier la marchandise",
      "Définir le statut sur",
      "→ Sélectionner le transporteur (DPD, DHL, UPS…) → Saisir le numéro de suivi → Cliquer sur « Expédier »",
      "Le revendeur reçoit automatiquement un e-mail avec le lien de suivi",
      "Après livraison : Définir le statut sur"
    ],
    inProcessing: "En cours de traitement",
    shipped: "Expédié",
    completed: "Terminé",
    workflow1Tip: "Astuce : Sur la page de détail du client, vous pouvez également gérer les demandes via le tableau Kanban (glisser-déposer).",

    workflow2Title: "Créer un nouveau produit",
    workflow2Steps: [
      "Produits → + Nouveau produit",
      "Données de base : Nom (DE), sélectionner catégorie, classe EN, classe de poids, description, domaine d'application",
      "Badges : Optionnel — Bientôt disponible, Précommande, Fin de série, Action (avec texte d'action)",
      "Images : Télécharger images produit (glisser-déposer). Première image = image principale",
      "Tailles : Ajouter variantes (XS, S, M, L…) — chacune avec SKU unique et délai de livraison en semaines",
      "Designs de couleur : Nom + image (500×500px), optionnellement « Limité »",
      "Traduire : Cliquer sur le bouton Sparkles → L'IA traduit nom, description, domaine d'application vers EN + FR",
      "Enregistrer → Le produit apparaît immédiatement dans le catalogue"
    ],

    workflow3Title: "Créer un client + Télécharger la liste de prix",
    workflow3Steps: [
      "Clients → + Nouveau client — Saisir données entreprise, sélectionner type (Revendeur/Importateur), activer immédiatement",
      "Faire défiler jusqu'à la section « Listes de prix » sur la page de détail client",
      "Sélectionner catégorie (Parapentes, Miniwings, Parakites…) → Télécharger PDF",
      "L'IA analyse automatiquement le tableau PDF : Nom de modèle, PVP, coût revendeur, tailles",
      "Vérifier l'aperçu : Vert = correspondance, rouge = non trouvé. Ajuster les remises si nécessaire",
      "Cliquer sur « Appliquer » → Les prix sont sauvegardés",
      "Contrôle : Cliquer sur « Catalogue en tant que client » → Vous voyez le catalogue avec les prix individuels de ce revendeur"
    ],
    workflow3Warning: "Les SKUs dans la liste de prix doivent correspondre aux SKUs du catalogue. L'IA fait correspondre principalement via le nom du modèle.",

    // Table of contents
    detailedDocsTitle: "Documentation détaillée",
    tocItems: {
      dashboard: "Tableau de bord",
      products: "Gestion des produits",
      customers: "Clients et activation",
      pricelists: "Listes de prix (Analyse IA)",
      inventory: "Inventaire (WinLine CSV)",
      inquiries: "Demandes de commande",
      news: "Actualités (Ticker d'actualités)",
      translations: "Traductions (DE/EN/FR)",
      ai: "Fonctions IA et coûts",
      roles: "Rôles utilisateur et droits",
      tips: "Conseils et bonnes pratiques"
    },

    // Sections
    dashboardTitle: "Tableau de bord",
    dashboardDesc: "Le tableau de bord admin affiche toutes les métriques importantes en un coup d'œil :",
    dashboardMetrics: {
      products: "Actif, Bientôt disponible, Précommande — lien direct vers la gestion.",
      inventory: "En stock (>5), stock faible (1–5), rupture de stock (0).",
      inquiries: "Demandes ouvertes, en cours de traitement, expédiées et terminées.",
      customers: "Revendeurs, importateurs et importateurs avec réseau."
    },
    dashboardFeatures: "En dessous : Briefing IA (résumé généré du statut actuel), dernières demandes avec statut et noms d'entreprises, et horloge mondiale (HQ, Tokyo, New York, Sydney).",

    productsTitle: "Gestion des produits",
    productOverviewTitle: "Vue d'ensemble des produits",
    productOverviewDesc: "Sous Produits, vous voyez tous les produits dans une liste triable :",
    productOverviewFeatures: [
      "Rechercher par nom, catégorie ou SKU",
      "Trier via glisser-déposer ou touches fléchées",
      "Basculer le statut — Actif/Inactif via toggle",
      "Badges — Bientôt disponible, Précommande, Fin de série, Action directement visibles"
    ],
    productFormTitle: "Formulaire produit",
    productFormSteps: [
      "Données de base : Nom (DE), catégorie, classe EN, classe de poids, description, domaine d'application, PVP brut",
      "Badges : Bientôt disponible, Précommande, Fin de série, Action (avec texte d'action)",
      "Images : Plusieurs images produit (glisser-déposer), première = image principale",
      "Tailles : Variantes (XS, S, M, L…) avec SKU et délai de livraison en semaines",
      "Designs de couleur : Nom + image (500×500px), optionnellement « Limité », classification optionnelle (N-LITE, D-LITE, U-LITE)",
      "Produits similaires / accessoires : Lien avec d'autres produits",
      "Traductions : Le bouton IA traduit DE → EN + FR"
    ],
    productActionsTitle: "Actions par produit",
    productActions: [
      { icon: "Pencil", title: "Modifier", desc: "Formulaire produit avec toutes les données" },
      { icon: "Warehouse", title: "Inventaire", desc: "Saisie manuelle par taille + couleur" },
      { icon: "ToggleRight", title: "Actif/Inactif", desc: "Les produits inactifs sont masqués dans le catalogue" },
      { icon: "Trash2", title: "Supprimer", desc: "Irréversible (confirmation requise)" }
    ],

    customersTitle: "Clients et activation",
    registrationTitle: "Inscription et activation",
    registrationSteps: [
      "Le revendeur s'inscrit via la page d'accueil",
      "Vous recevez une notification par e-mail",
      "Dans la liste clients, le revendeur apparaît avec un indicateur pulsant jaune",
      "Cliquer sur « Activer » → Le revendeur reçoit un e-mail d'activation"
    ],
    manualCustomerTitle: "Créer des clients manuellement",
    manualCustomerDesc: "Clients → + Nouveau client — Saisir données entreprise, sélectionner type (Revendeur, Importateur, Importateur avec réseau), activer immédiatement.",
    customerDetailTitle: "Page de détail client",
    customerDetailFeatures: [
      "Données de base : Adresse, contact, ID TVA, type d'entreprise, site web",
      "Listes de prix : Télécharger PDF → Analyse IA (par catégorie)",
      "Google Map : Localisation du client",
      "Notes internes : Visibles uniquement aux admins (ex. « Conditions spéciales T2 »)",
      "Notes client : Peuvent être marquées visibles au client",
      "Tableau Kanban : Vue d'ensemble de toutes les demandes (glisser-déposer)",
      "« Catalogue en tant que client » — Voir le catalogue avec prix individuels"
    ],
    customerTip: "Astuce : Utilisez « Catalogue en tant que client » après chaque téléchargement de liste de prix pour vérifier les prix dans le catalogue.",

    pricelistsTitle: "Importer les listes de prix (Analyse IA)",
    pricelistsDesc: "Chaque revendeur a des prix individuels. Ceux-ci sont importés via des listes de prix PDF.",
    pricelistWorkflow: "Flux de travail : Télécharger la liste de prix",
    pricelistSteps: [
      { step: "1", title: "Sélectionner le client", desc: "Clients → Détail client → Section « Listes de prix »" },
      { step: "2", title: "Télécharger PDF", desc: "Sélectionner catégorie (Parapentes, Miniwings, Parakites…) et télécharger fichier PDF." },
      { step: "3", title: "Analyse IA", desc: "Gemini Vision analyse le tableau PDF : Nom de modèle, PVP (brut), coût revendeur (net), tailles." },
      { step: "4", title: "Vérifier l'aperçu", desc: "Vert = attribution OK, rouge = non trouvé. Les remises peuvent être ajustées par position." },
      { step: "5", title: "Confirmer", desc: "« Appliquer pour X produits » — Les prix sont sauvegardés et immédiatement visibles dans le catalogue." }
    ],
    pricelistAiNote: "Fonction IA : Google Gemini 2.0 Flash (Vision) — Coût par PDF env. 0,01–0,05 €",

    inventoryTitle: "Importer l'inventaire (WinLine CSV)",
    inventoryDesc: "L'inventaire est importé de Mesonic WinLine via CSV. Le CSV est la source unique de vérité — après l'import, tous les niveaux d'inventaire sont définis aux valeurs CSV.",
    inventoryWorkflow: "Flux de travail : Mettre à jour l'inventaire",
    inventorySteps: [
      { step: "1", title: "Exporter CSV de WinLine", desc: "Exporter la liste d'inventaire actuelle en CSV." },
      { step: "2", title: "Télécharger CSV", desc: "Inventaire → « Importer liste inventaire WinLine » → Sélectionner fichier." },
      { step: "3", title: "Attribution automatique", desc: "Les descriptions d'articles sont attribuées de manière déterministe + par IA aux produits du catalogue. Seuls les articles avec « -NL- » ou « -NE- » sont considérés." },
      { step: "4", title: "Vérifier le résultat", desc: "Vue d'ensemble : Articles attribués (vert) et non attribués (rouge), groupés par produit." },
      { step: "5", title: "Mettre à jour l'inventaire", desc: "Cliquer sur « Mettre à jour l'inventaire » — tous les niveaux d'inventaire sont synchronisés. Les produits non présents dans le CSV sont mis à 0." }
    ],
    inventoryIndicatorTitle: "Indicateur d'inventaire dans le catalogue",
    inventoryIndicators: [
      { color: "emerald", status: "Vert :", desc: "Immédiatement disponible (>10 pièces)" },
      { color: "amber", status: "Jaune :", desc: "Quantité faible (1–10 pièces)" },
      { color: "red", status: "Rouge :", desc: "Rupture de stock — délai de livraison affiché" }
    ],
    inventoryManualNote: "L'inventaire manuel par taille/couleur peut aussi être modifié directement sous Produits → Produit → Inventaire.",

    inquiriesTitle: "Traiter les demandes de commande",
    inquiriesDesc: "Sous Demandes, vous voyez toutes les demandes de commande de tous les revendeurs.",
    statusWorkflowTitle: "Flux de statut",
    statusNew: "Nouveau",
    statusInProgress: "En cours de traitement",
    statusShipped: "Expédié",
    statusCompleted: "Terminé",
    inquiryActions: "Par demande, vous pouvez :",
    inquiryActionsList: [
      "Changer le statut — Via menu déroulant ou tableau Kanban sur la page de détail client",
      "Voir les détails — Développer les positions (produit, taille, SKU, couleur, quantité, prix)",
      "Ajouter des notes — Annotations internes (automatiquement sauvegardées)",
      "Saisir le suivi — Transporteur (DPD, DHL, UPS, GLS, FedEx, Post AT) + numéro de suivi"
    ],
    automaticEmailsTitle: "E-mails automatiques",
    automaticEmails: [
      "Lors de l'activation du compte",
      "Lors du changement de statut d'une demande",
      "Lors de l'expédition avec lien de suivi cliquable"
    ],

    newsTitle: "Actualités (Ticker d'actualités)",
    newsDesc: "Sous Actualités, vous gérez le ticker d'actualités affiché à tous les revendeurs dans le catalogue.",
    newsFeaturesTitle: "Fonctionnalités",
    newsFeatures: [
      "Nouveau message : Saisir le texte allemand, puis bouton « Auto » pour traduction automatique EN + FR",
      "Onglets de langue : DE / EN / FR — point vert indique si la traduction existe",
      "Activer/Désactiver : Symbole œil par message",
      "Modifier : Cliquer sur le texte pour modifier",
      "Supprimer : Symbole corbeille (avec confirmation)",
      "Aperçu : Aperçu ticker en direct en bas"
    ],
    newsAutoNote: "Le bouton « Auto » traduit le message allemand via IA vers EN et FR.",
    newsTypical: "Actualités typiques : Nouveaux produits, promotions, changements de prix, mises à jour de statut de livraison, annonces de salons.",

    translationsTitle: "Traductions (DE → EN / FR)",
    translationsDesc: "Le portail est trilingue : Allemand (par défaut), Anglais et Français. Les revendeurs sélectionnent la langue dans l'en-tête.",
    translationTypes: [
      { type: "Textes produit", action: "Cliquer sur le bouton dans le formulaire produit." },
      { type: "Catégories", action: "Automatiquement traduites via API et sauvegardées en DB." },
      { type: "Actualités", action: "Cliquer sur le bouton « Auto » par message dans le gestionnaire d'actualités." }
    ],

    aiTitle: "Fonctions IA et coûts",
    aiDesc: "Le portail utilise Google Gemini 2.0 Flash pour l'automatisation. Toutes les fonctionnalités IA sont marquées d'un symbole.",
    aiCostTable: {
      headers: ["Fonction", "Coût env."],
      rows: [
        ["Analyser liste prix PDF", "0,01–0,05 €/PDF"],
        ["Analyser inventaire CSV", "0,005–0,02 €/CSV"],
        ["Traduire texte produit", "0,001–0,003 €/produit"],
        ["Traduire actualités", "0,001 €/message"],
        ["Traduire catégories", "0,001–0,005 €"],
        ["Briefing IA tableau de bord", "0,005–0,01 €/appel"]
      ]
    },
    aiTotalCost: "Total : Avec un fonctionnement normal (20–50 listes de prix/mois, mises à jour d'inventaire hebdomadaires) sous 2–5 €/mois.",

    rolesTitle: "Rôles utilisateur et droits",
    rolesTable: {
      headers: ["Rôle", "Droits"],
      rows: [
        ["Superadmin", "Accès complet + gestion des rôles"],
        ["Admin", "Produits, clients, inventaire, demandes, actualités, listes de prix, traductions"],
        ["Revendeur", "Catalogue, propres prix, panier, envoyer demandes, historique des demandes"]
      ]
    },
    roleManagement: "Gestion des rôles sous Admin → Profil (superadmins seulement).",

    tipsTitle: "Conseils et bonnes pratiques",
    tips: [
      { title: "Mettre à jour l'inventaire hebdomadairement", desc: "Exporter et télécharger CSV WinLine — garde les indicateurs du catalogue toujours à jour." },
      { title: "Vérifier les listes de prix après téléchargement", desc: "Toujours utiliser « Catalogue en tant que client » pour vérifier l'attribution des prix." },
      { title: "Activer rapidement les inscriptions", desc: "Les revendeurs attendent une réponse rapide. Le tableau de bord affiche les demandes en attente de manière prominente." },
      { title: "Garder les SKUs cohérents", desc: "L'IA fait correspondre les listes de prix et l'inventaire via les SKUs. Portail, WinLine et PDFs doivent correspondre." },
      { title: "Garder les images produit de haute qualité", desc: "Les images de design de couleur sont mises à l'échelle à 500×500px. Images produit dans la plus haute qualité possible." },
      { title: "Utiliser les notes", desc: "Des notes internes peuvent être stockées sur la page de détail client (ex. « Conditions spéciales jusqu'au T2 »)." },
      { title: "Saisir les numéros de suivi", desc: "Le revendeur reçoit automatiquement un e-mail avec lien de suivi cliquable." },
      { title: "Maintenir le ticker d'actualités", desc: "Publier des informations actuelles sur les nouveaux produits, promotions ou statut de livraison dans le ticker d'actualités." }
    ],

    // Footer
    customerGuide: "Guide client"
  }
};

export default async function AdminAnleitungPage() {
  const locale = await getLocale();
  const txt = t[locale];

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
            {txt.backToDashboard}
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-swing-gold" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {txt.title}
            </h1>
          </div>
          <p className="mt-2 text-sm text-white/50">
            {txt.subtitle}
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
                {txt.quickStart}
              </h2>
            </div>
            <p className="mt-1 text-[12px] text-swing-gray-dark/60">
              {txt.quickStartDesc}
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
                  {txt.workflow1Title}
                </h3>
              </div>
              <ol className="ml-4 list-decimal space-y-1.5 text-[12px] leading-relaxed text-swing-gray-dark/80">
                <li>
                  <Link href="/admin/anfragen" className="font-semibold text-swing-navy underline">{locale === 'de' ? 'Anfragen' : locale === 'en' ? 'Inquiries' : 'Demandes'}</Link> {txt.workflow1Steps[0].replace('Anfragen öffnen — neue Anfragen haben einen', '').trim()} <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" /> {locale === 'de' ? 'blauen Puls' : locale === 'en' ? 'blue pulse indicator' : 'indicateur bleu pulsant'}
                </li>
                <li>{txt.workflow1Steps[1]}</li>
                <li>{txt.workflow1Steps[2]} <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{txt.inProcessing}</span></li>
                <li>{txt.workflow1Steps[3]}</li>
                <li>
                  {txt.workflow1Steps[4]} <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">{txt.shipped}</span> {txt.workflow1Steps[5]}
                </li>
                <li>{txt.workflow1Steps[6]}</li>
                <li>
                  {txt.workflow1Steps[7]} <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{txt.completed}</span>
                </li>
              </ol>
              <p className="mt-2 text-[11px] text-swing-gray-dark/50">
                {txt.workflow1Tip}
              </p>
            </div>

            {/* Quick-Start 2: Produkt anlegen */}
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                  <Package size={14} />
                </div>
                <h3 className="text-[13px] font-extrabold text-swing-navy">
                  {txt.workflow2Title}
                </h3>
              </div>
              <ol className="ml-4 list-decimal space-y-1.5 text-[12px] leading-relaxed text-swing-gray-dark/80">
                <li>
                  <Link href="/admin/produkte/neu" className="font-semibold text-swing-navy underline">{txt.workflow2Steps[0]}</Link>
                </li>
                <li>
                  <strong>{locale === 'de' ? 'Stammdaten:' : locale === 'en' ? 'Master data:' : 'Données de base :'}</strong> {txt.workflow2Steps[1].replace(/^Stammdaten: |^Master data: |^Données de base : /, '')}
                </li>
                <li>
                  <strong>{locale === 'de' ? 'Badges:' : locale === 'en' ? 'Badges:' : 'Badges :'}</strong> {txt.workflow2Steps[2].replace(/^Badges: /, '')}
                </li>
                <li>
                  <strong>{locale === 'de' ? 'Bilder:' : locale === 'en' ? 'Images:' : 'Images :'}</strong> {txt.workflow2Steps[3].replace(/^Bilder: |^Images: /, '')}
                </li>
                <li>
                  <strong>{locale === 'de' ? 'Größen:' : locale === 'en' ? 'Sizes:' : 'Tailles :'}</strong> {txt.workflow2Steps[4].replace(/^Größen: |^Sizes: |^Tailles : /, '')}
                </li>
                <li>
                  <strong>{locale === 'de' ? 'Farbdesigns:' : locale === 'en' ? 'Color designs:' : 'Designs de couleur :'}</strong> {txt.workflow2Steps[5].replace(/^Farbdesigns: |^Color designs: |^Designs de couleur : /, '')}
                </li>
                <li>
                  <strong>{locale === 'de' ? 'Übersetzen:' : locale === 'en' ? 'Translate:' : 'Traduire :'}</strong> <Sparkles size={10} className="inline text-swing-gold" /> {txt.workflow2Steps[6].replace(/^Übersetzen: |^Translate: |^Traduire : /, '').replace('Sparkles-Button', locale === 'de' ? 'Sparkles-Button' : locale === 'en' ? 'Sparkles button' : 'bouton Sparkles')}
                </li>
                <li>
                  <strong>{locale === 'de' ? 'Speichern' : locale === 'en' ? 'Save' : 'Enregistrer'}</strong> {txt.workflow2Steps[7].replace(/^Speichern |^Save |^Enregistrer /, '')}
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
                  {txt.workflow3Title}
                </h3>
              </div>
              <ol className="ml-4 list-decimal space-y-1.5 text-[12px] leading-relaxed text-swing-gray-dark/80">
                <li>
                  <Link href="/admin/kunden/neu" className="font-semibold text-swing-navy underline">{txt.workflow3Steps[0].split(' — ')[0]}</Link> — {txt.workflow3Steps[0].split(' — ')[1]}
                </li>
                <li>
                  {txt.workflow3Steps[1].replace('"Preislisten"', locale === 'de' ? '"Preislisten"' : locale === 'en' ? '"Price Lists"' : '"Listes de prix"')}
                </li>
                <li>
                  {txt.workflow3Steps[2]}
                </li>
                <li>
                  <Sparkles size={10} className="inline text-swing-gold" /> {txt.workflow3Steps[3]}
                </li>
                <li>
                  {txt.workflow3Steps[4]}
                </li>
                <li>
                  {txt.workflow3Steps[5].replace('"Anwenden"', locale === 'de' ? '"Anwenden"' : locale === 'en' ? '"Apply"' : '"Appliquer"')}
                </li>
                <li>
                  {txt.workflow3Steps[6].replace('"Katalog als Kunde"', locale === 'de' ? '"Katalog als Kunde"' : locale === 'en' ? '"Catalog as customer"' : '"Catalogue en tant que client"')}
                </li>
              </ol>
              <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[11px] font-semibold text-amber-800">
                  <AlertTriangle size={10} className="mr-1 inline" />
                  {txt.workflow3Warning}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {txt.detailedDocsTitle}
          </h2>
          <nav className="grid gap-1.5 sm:grid-cols-2">
            {[
              { href: "#dashboard", label: txt.tocItems.dashboard },
              { href: "#produkte", label: txt.tocItems.products },
              { href: "#kunden", label: txt.tocItems.customers },
              { href: "#preislisten", label: txt.tocItems.pricelists },
              { href: "#lager", label: txt.tocItems.inventory },
              { href: "#anfragen", label: txt.tocItems.inquiries },
              { href: "#news", label: txt.tocItems.news },
              { href: "#uebersetzungen", label: txt.tocItems.translations },
              { href: "#ki", label: txt.tocItems.ai },
              { href: "#rollen", label: txt.tocItems.roles },
              { href: "#tipps", label: txt.tocItems.tips },
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
              {txt.dashboardTitle}
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.dashboardDesc.split('Admin-Dashboard')[0]}
              <Link href="/admin" className="font-semibold text-swing-navy underline">
                {locale === 'de' ? 'Admin-Dashboard' : locale === 'en' ? 'Admin Dashboard' : 'Tableau de bord admin'}
              </Link>
              {txt.dashboardDesc.split('Admin-Dashboard')[1] || txt.dashboardDesc.split('Admin Dashboard')[1] || txt.dashboardDesc.split('Tableau de bord admin')[1]}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-blue-600/70">{locale === 'de' ? 'Produkte' : locale === 'en' ? 'Products' : 'Produits'}</p>
                <p>{txt.dashboardMetrics.products}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-emerald-600/70">{locale === 'de' ? 'Lagerbestand' : locale === 'en' ? 'Inventory' : 'Inventaire'}</p>
                <p>{txt.dashboardMetrics.inventory}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-gold">{locale === 'de' ? 'Anfragen' : locale === 'en' ? 'Inquiries' : 'Demandes'}</p>
                <p>{txt.dashboardMetrics.inquiries}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">{locale === 'de' ? 'Kunden' : locale === 'en' ? 'Customers' : 'Clients'}</p>
                <p>{txt.dashboardMetrics.customers}</p>
              </div>
            </div>
            <p>
              {txt.dashboardFeatures}
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
              {txt.productsTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Search size={12} />
                {txt.productOverviewTitle}
              </p>
              <p>
                {txt.productOverviewDesc.split('Produkte')[0]}
                <Link href="/admin/produkte" className="font-semibold text-swing-navy underline">
                  {locale === 'de' ? 'Produkte' : locale === 'en' ? 'Products' : 'Produits'}
                </Link>
                {txt.productOverviewDesc.split('Produkte')[1] || txt.productOverviewDesc.split('Products')[1] || txt.productOverviewDesc.split('Produits')[1]}
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1">
                {txt.productOverviewFeatures.map((feature, i) => (
                  <li key={i}><strong>{feature.split(':')[0] || feature.split(' ')[0]}</strong>{feature.includes(':') ? ':' : ''} {feature.split(':')[1] || feature.substring(feature.indexOf(' ') + 1)}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Package size={12} />
                {txt.productFormTitle}
              </p>
              <ol className="ml-4 list-decimal space-y-1.5">
                {txt.productFormSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.productActionsTitle}
              </p>
              <div className="space-y-1.5">
                {txt.productActions.map((action, i) => (
                  <p key={i} className="flex items-center gap-2">
                    {action.icon === 'Pencil' && <Pencil size={13} className="text-swing-navy/40" />}
                    {action.icon === 'Warehouse' && <Warehouse size={13} className="text-swing-navy/40" />}
                    {action.icon === 'ToggleRight' && <ToggleRight size={13} className="text-swing-navy/40" />}
                    {action.icon === 'Trash2' && <Trash2 size={13} className="text-red-400" />}
                    <strong>{action.title}</strong> — {action.desc}
                  </p>
                ))}
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
              {txt.customersTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <UserPlus size={12} />
                {txt.registrationTitle}
              </p>
              <ol className="ml-4 list-decimal space-y-1.5">
                {txt.registrationSteps.map((step, i) => (
                  <li key={i}>
                    {i === 2 ? (
                      <>
                        {step.split('gelbem')[0] || step.split('yellow')[0] || step.split('jaune')[0]}
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                        {step.split('Puls-Indikator')[1] || step.split('pulse indicator')[1] || step.split('indicateur pulsant')[1]}
                      </>
                    ) : i === 3 ? (
                      <>
                        {step.split('"')[0]}"{locale === 'de' ? 'Freischalten' : locale === 'en' ? 'Activate' : 'Activer'}" {step.split('"')[2] || step.split('"')[1]?.substring(step.split('"')[1].indexOf(' ') + 1)}
                      </>
                    ) : (
                      step
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.manualCustomerTitle}
              </p>
              <p>
                <Link href="/admin/kunden/neu" className="font-semibold text-swing-navy underline">
                  {txt.manualCustomerDesc.split(' — ')[0]}
                </Link>
                {txt.manualCustomerDesc.includes(' — ') ? ' — ' + txt.manualCustomerDesc.split(' — ')[1] : ''}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Eye size={12} />
                {txt.customerDetailTitle}
              </p>
              <ul className="ml-4 list-disc space-y-1">
                {txt.customerDetailFeatures.map((feature, i) => (
                  <li key={i}>
                    <strong>{feature.split(':')[0]}:</strong> {feature.split(':')[1]}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Eye size={12} className="mr-1 inline" />
                {txt.customerTip}
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
              {txt.pricelistsTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.pricelistsDesc}
            </p>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-swing-navy/5 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">
                  {txt.pricelistWorkflow}
                </p>
              </div>
              <div className="space-y-0 px-4 py-4">
                {txt.pricelistSteps.map((item, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
                        {item.step === "1" && <Users size={14} />}
                        {item.step === "2" && <Upload size={14} />}
                        {item.step === "3" && <Sparkles size={14} />}
                        {item.step === "4" && <Eye size={14} />}
                        {item.step === "5" && <CheckCircle2 size={14} />}
                      </div>
                      {i < 4 && <div className="mt-1 h-full w-px bg-gray-200" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-[12px] font-bold text-swing-navy">{locale === 'de' ? 'Schritt' : locale === 'en' ? 'Step' : 'Étape'} {item.step}: {item.title}</p>
                      <p className="mt-0.5 text-[12px] text-swing-gray-dark/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                {txt.pricelistAiNote}
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
              {txt.inventoryTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.inventoryDesc}
            </p>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-swing-navy/5 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/60">
                  {txt.inventoryWorkflow}
                </p>
              </div>
              <div className="space-y-0 px-4 py-4">
                {txt.inventorySteps.map((item, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
                        {item.step === "1" && <FileSpreadsheet size={14} />}
                        {item.step === "2" && <Upload size={14} />}
                        {item.step === "3" && <Sparkles size={14} />}
                        {item.step === "4" && <Eye size={14} />}
                        {item.step === "5" && <CheckCircle2 size={14} />}
                      </div>
                      {i < 4 && <div className="mt-1 h-full w-px bg-gray-200" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-[12px] font-bold text-swing-navy">{locale === 'de' ? 'Schritt' : locale === 'en' ? 'Step' : 'Étape'} {item.step}: {item.title}</p>
                      <p className="mt-0.5 text-[12px] text-swing-gray-dark/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.inventoryIndicatorTitle}
              </p>
              <div className="space-y-1.5">
                {txt.inventoryIndicators.map((indicator, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full bg-${indicator.color}-500`} />
                    <strong>{indicator.status}</strong> {indicator.desc}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[12px] font-semibold text-amber-800">
                <AlertTriangle size={12} className="mr-1 inline" />
                {txt.inventoryManualNote}
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
              {txt.inquiriesTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.inquiriesDesc.split('Anfragen')[0] || txt.inquiriesDesc.split('Inquiries')[0] || txt.inquiriesDesc.split('Demandes')[0]}
              <Link href="/admin/anfragen" className="font-semibold text-swing-navy underline">
                {locale === 'de' ? 'Anfragen' : locale === 'en' ? 'Inquiries' : 'Demandes'}
              </Link>
              {txt.inquiriesDesc.split('Anfragen')[1] || txt.inquiriesDesc.split('Inquiries')[1] || txt.inquiriesDesc.split('Demandes')[1]}
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.statusWorkflowTitle}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="rounded bg-blue-100 px-2.5 py-1 font-semibold text-blue-700">{txt.statusNew}</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="rounded bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">{txt.statusInProgress}</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="rounded bg-purple-100 px-2.5 py-1 font-semibold text-purple-700">{txt.statusShipped}</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="rounded bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">{txt.statusCompleted}</span>
              </div>
            </div>

            <p><strong>{txt.inquiryActions}</strong></p>
            <ul className="ml-4 list-disc space-y-1.5">
              {txt.inquiryActionsList.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <MessageSquare size={12} />
                {txt.automaticEmailsTitle}
              </p>
              <ul className="ml-4 list-disc space-y-1">
                {txt.automaticEmails.map((email, i) => (
                  <li key={i}>{email}</li>
                ))}
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
              {txt.newsTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.newsDesc.split('Neuigkeiten')[0] || txt.newsDesc.split('News')[0] || txt.newsDesc.split('Actualités')[0]}
              <Link href="/admin/news" className="font-semibold text-swing-navy underline">
                {locale === 'de' ? 'Neuigkeiten' : locale === 'en' ? 'News' : 'Actualités'}
              </Link>
              {txt.newsDesc.split('Neuigkeiten')[1] || txt.newsDesc.split('News')[1] || txt.newsDesc.split('Actualités')[1]}
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.newsFeaturesTitle}
              </p>
              <ul className="ml-4 list-disc space-y-1.5">
                {txt.newsFeatures.map((feature, i) => (
                  <li key={i}>
                    {i === 0 ? (
                      <>
                        <strong>{feature.split(':')[0]}:</strong> {feature.split(':')[1]?.split('"Auto"')[0]}<Languages size={10} className="inline" /> "{locale === 'de' ? 'Auto' : 'Auto'}"{feature.split('"Auto"')[1]}
                      </>
                    ) : (
                      <>
                        <strong>{feature.split(':')[0]}:</strong> {feature.split(':')[1]}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                <Sparkles size={11} className="mr-1 inline text-swing-gold" />
                {txt.newsAutoNote}
              </p>
            </div>

            <p>
              <strong>{locale === 'de' ? 'Typische News:' : locale === 'en' ? 'Typical news:' : 'Actualités typiques :'}</strong> {txt.newsTypical.split(': ')[1] || txt.newsTypical.split(': ')[0]}
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
              {txt.translationsTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.translationsDesc}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {txt.translationTypes.map((type, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                    {i === 0 && <Package size={11} />}
                    {i === 1 && <BarChart3 size={11} />}
                    {i === 2 && <Megaphone size={11} />}
                    {type.type}
                  </p>
                  <p className="text-[12px]">
                    {i === 0 && locale === 'de' && (
                      <>Im Produktformular den <Sparkles size={10} className="inline text-swing-gold" /> Button klicken.</>
                    )}
                    {i === 0 && locale === 'en' && (
                      <>Click the <Sparkles size={10} className="inline text-swing-gold" /> button in the product form.</>
                    )}
                    {i === 0 && locale === 'fr' && (
                      <>Cliquer sur le bouton <Sparkles size={10} className="inline text-swing-gold" /> dans le formulaire produit.</>
                    )}
                    {i !== 0 && type.action}
                  </p>
                </div>
              ))}
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
              {txt.aiTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.aiDesc.split('Google Gemini 2.0 Flash')[0]}
              <strong>Google Gemini 2.0 Flash</strong>
              {txt.aiDesc.split('Google Gemini 2.0 Flash')[1]} <Sparkles size={10} className="inline text-swing-gold" /> {locale === 'de' ? 'Symbol markiert' : locale === 'en' ? 'symbol marked' : 'symbole marqué'}.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-3 font-bold text-swing-navy/60">{txt.aiCostTable.headers[0]}</th>
                    <th className="pb-2 font-bold text-swing-navy/60">{txt.aiCostTable.headers[1]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {txt.aiCostTable.rows.map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-3">{row[0]}</td>
                      <td className="py-2 font-semibold">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-[12px] font-semibold text-blue-800">
                <DollarSign size={12} className="mr-1 inline" />
                <strong>{locale === 'de' ? 'Gesamt:' : locale === 'en' ? 'Total:' : 'Total :'}</strong> {txt.aiTotalCost.split('Gesamt: ')[1] || txt.aiTotalCost.split('Total: ')[1] || txt.aiTotalCost.split('Total : ')[1] || txt.aiTotalCost}
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
              {txt.rolesTitle}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <div className="rounded-lg bg-gray-50 p-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 pr-3 font-bold text-swing-navy/60">{txt.rolesTable.headers[0]}</th>
                    <th className="pb-2 font-bold text-swing-navy/60">{txt.rolesTable.headers[1]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2.5 pr-3"><span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Superadmin</span></td>
                    <td className="py-2.5">{txt.rolesTable.rows[0][1]}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3"><span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">Admin</span></td>
                    <td className="py-2.5">{txt.rolesTable.rows[1][1]}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3"><span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-700">{locale === 'de' ? 'Händler' : locale === 'en' ? 'Dealer' : 'Revendeur'}</span></td>
                    <td className="py-2.5">{txt.rolesTable.rows[2][1]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              {txt.roleManagement.split('Admin → Profil')[0]}
              <Link href="/admin/profil" className="font-semibold text-swing-navy underline">
                Admin → {locale === 'de' ? 'Profil' : locale === 'en' ? 'Profile' : 'Profil'}
              </Link>
              {txt.roleManagement.split('Admin → Profil')[1]}
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
              {txt.tipsTitle}
            </h2>
          </div>
          <div className="text-[13px] leading-relaxed text-swing-gray-dark/80">
            <ul className="space-y-3">
              {txt.tips.map((tip, i) => (
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
            {txt.backToDashboard}
          </Link>
          <Link
            href="/anleitung"
            className="text-[12px] text-swing-gray-dark/40 transition-colors hover:text-swing-navy"
          >
            {txt.customerGuide}
          </Link>
        </div>
      </div>
    </div>
  );
}