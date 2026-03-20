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
import { getLocale } from "@/lib/i18n";

const t = {
  de: {
    backToCatalog: "Zum Katalog",
    title: "Anleitung B2B-Portal",
    subtitle: "So nutzen Sie das SWING B2B-Portal \u2014 Schritt f\u00fcr Schritt.",
    quickStartTitle: "Schnelleinstieg \u2014 Ihre erste Bestellanfrage",
    quickStartDesc: "Beispiel: Sie m\u00f6chten 2\u00d7 Mirage 2 RS in Gr\u00f6\u00dfe M bestellen.",
    steps: {
      findProduct: {
        title: "Produkt finden",
        descPrefix: "\u00d6ffnen Sie den",
        descCatalog: "Katalog",
        descSuffix: "und suchen Sie nach \u201eMirage\u201c oder filtern Sie nach Kategorie.",
      },
      selectSize: {
        title: "Farbe & Gr\u00f6\u00dfe w\u00e4hlen",
        desc: "Klicken Sie auf das Produkt. W\u00e4hlen Sie Ihr gew\u00fcnschtes Farbdesign, dann die Gr\u00f6\u00dfe M.",
      },
      addToCart: {
        title: "In den Warenkorb",
        desc: "Geben Sie die Menge 2 ein und klicken Sie auf \u201eIn den Warenkorb\u201c. Die Anzahl erscheint oben rechts am Warenkorb-Symbol.",
      },
      submitInquiry: {
        title: "Anfrage absenden",
        descPrefix: "\u00d6ffnen Sie den",
        descCart: "Warenkorb",
        descSuffix: ", pr\u00fcfen Sie Ihre Positionen, f\u00fcgen Sie optional eine Notiz hinzu und klicken Sie auf \u201eAnfrage absenden\u201c.",
      },
      confirmation: {
        title: "Best\u00e4tigung",
        desc: "Sie erhalten eine Best\u00e4tigung. Das SWING-Vertriebsteam bearbeitet Ihre Anfrage und meldet sich bei Ihnen.",
      },
    },
    stepLabel: "Schritt",
    tocTitle: "Inhalt",
    tocItems: [
      "Produktkatalog durchsuchen",
      "Produktdetails & Preise",
      "Warenkorb & Bestellanfrage",
      "Anfragen-\u00dcbersicht",
      "Ihr Dashboard",
      "Profil bearbeiten",
      "Kontakt & Hilfe",
    ],
    catalog: {
      title: "Produktkatalog durchsuchen",
      introPrefix: "Im",
      introCatalog: "Katalog",
      introSuffix: "finden Sie alle verf\u00fcgbaren SWING-Produkte mit Ihren individuellen H\u00e4ndlerpreisen.",
      searchTitle: "Suchfunktion",
      searchDesc: "Geben Sie im Suchfeld den Produktnamen ein (z.B. \u201eMirage\u201c oder \u201eBrave\u201c). Die Ergebnisse werden sofort gefiltert.",
      filterTitle: "Filterfunktionen",
      filterCategory: "Kategorie:",
      filterCategoryValues: "Gleitschirme, Tandem, Motor, Miniwings, Speedflying, Parakites, Gurtzeuge, Zubeh\u00f6r",
      filterEN: "EN-Klasse:",
      filterENValues: "EN-A, EN-A/B, LOW EN-B, MID EN-B, HIGH EN-B, EN-C 2-Liner, EN-D 2-Liner",
      filterWeight: "Gewichtsklasse:",
      filterWeightValues: "N-LITE, D-LITE, U-LITE",
      badgesTitle: "Produkt-Badges",
      badgeComingSoon: "Demn\u00e4chst verf\u00fcgbar",
      badgePreorder: "Vorbestellung m\u00f6glich",
      badgeFadeOut: "Auslaufmodell, nur solange Vorrat reicht",
      badgeAktion: "Zeitlich begrenztes Sonderangebot",
      stockTitle: "Lagerampel",
      stockGreen: "Sofort verf\u00fcgbar (>10 St\u00fcck)",
      stockYellow: "Geringe St\u00fcckzahl (1\u201310 St\u00fcck)",
      stockRed: "Nicht auf Lager, Lieferzeit beachten",
    },
    product: {
      title: "Produktdetails & Preise",
      intro: "Klicken Sie im Katalog auf ein Produkt, um die Detailseite zu \u00f6ffnen. Dort finden Sie:",
      description: "Produktbeschreibung",
      descriptionDetail: "und technische Daten (Gewichtsbereich, Startgewicht, Fl\u00e4che etc.)",
      colors: "Farbdesigns",
      colorsDetail: "W\u00e4hlen Sie ein Design per Klick aus. Bei manchen Modellen gibt es limitierte Designs.",
      sizes: "Gr\u00f6\u00dfen & Verf\u00fcgbarkeit",
      sizesDetail: "Jede Gr\u00f6\u00dfe zeigt:",
      dealerPrice: "Ihren individuellen H\u00e4ndler-EK (Netto)",
      uvp: "Die UVP (Brutto) zum Vergleich",
      discount: "Ihren Rabatt in Prozent",
      stock: "Den aktuellen Lagerstand (Ampel)",
      deliveryTime: "Die Lieferzeit bei Nicht-Verf\u00fcgbarkeit",
      related: "\u00c4hnliche Produkte",
      accessories: "Zubeh\u00f6r",
      relatedSuffix: "am Ende der Seite",
      priceNote: "Hinweis: Die angezeigten Preise sind Ihre individuellen H\u00e4ndlerpreise und k\u00f6nnen sich von anderen H\u00e4ndlern unterscheiden.",
    },
    cart: {
      title: "Warenkorb & Bestellanfrage",
      addTitle: "Produkt zum Warenkorb hinzuf\u00fcgen:",
      addStep1: "W\u00e4hlen Sie auf der Produktdetailseite ein Farbdesign",
      addStep2: "Stellen Sie bei der gew\u00fcnschten Gr\u00f6\u00dfe die Menge ein (+ / \u2212 Buttons)",
      addStep3: "Klicken Sie \u201eIn den Warenkorb\u201c \u2014 das Warenkorb-Symbol im Header zeigt die aktuelle Anzahl",
      checkoutTitle: "Warenkorb pr\u00fcfen & Anfrage absenden:",
      checkoutStep1Prefix: "Klicken Sie auf das Warenkorb-Symbol im Header oder navigieren Sie zum",
      checkoutStep1Cart: "Warenkorb",
      checkoutStep2: "Pr\u00fcfen Sie Ihre Positionen \u2014 Menge kann direkt angepasst werden",
      checkoutStep3: "F\u00fcgen Sie bei Bedarf eine Notiz hinzu (z.B. gew\u00fcnschter Liefertermin)",
      checkoutStep4: "Klicken Sie \u201eAnfrage absenden\u201c",
      importantNote: "Wichtig: Die Bestellanfrage ist unverbindlich. Es handelt sich um eine Anfrage, kein verbindlicher Kauf. Das SWING-Vertriebsteam wird Ihre Anfrage pr\u00fcfen und sich mit einem Angebot bei Ihnen melden.",
    },
    inquiries: {
      title: "Anfragen-\u00dcbersicht",
      introPrefix: "Unter",
      introLink: "Anfragen",
      introSuffix: "sehen Sie alle Ihre bisherigen Bestellanfragen mit aktuellem Status.",
      statusTitle: "Status-Bedeutung",
      statusNew: "Neu",
      statusNewDesc: "Ihre Anfrage ist eingegangen und wird bearbeitet.",
      statusProcessing: "In Bearbeitung",
      statusProcessingDesc: "Das Vertriebsteam pr\u00fcft Ihre Anfrage und bereitet ein Angebot vor.",
      statusShipped: "Versendet",
      statusShippedDesc: "Ihre Bestellung wurde versandt. Tracking-Informationen sind hinterlegt.",
      statusCompleted: "Abgeschlossen",
      statusCompletedDesc: "Die Bestellung ist vollst\u00e4ndig abgewickelt.",
      positionsNote: "Jede Anfrage zeigt die einzelnen Positionen (Produkt, Gr\u00f6\u00dfe, Farbe, Menge) sowie den Gesamtwert.",
    },
    dashboard: {
      title: "Ihr Dashboard",
      introPrefix: "Das",
      introLink: "Dashboard",
      introSuffix: "ist Ihre Startseite nach dem Login. Hier finden Sie:",
      contact: "Kontaktdaten",
      contactDetail: "Hotline, E-Mail und Gesch\u00e4ftszeiten des SWING-Vertriebsteams",
      metrics: "Kennzahlen",
      metricsDetail: "Gesamtanzahl Anfragen, Gesamtwert, offene und abgeschlossene Anfragen",
      company: "Firmendaten",
      companyDetail: "Ihre Firma, Typ, Freischaltungsstatus und Produktkategorien",
      pricelists: "Preislisten",
      pricelistsDetail: "Ihre hinterlegten Preislisten als PDF zum Download",
      messages: "Nachrichten",
      messagesDetail: "Notizen vom SWING-Team f\u00fcr Sie (z.B. Sonderangebote, Hinweise)",
      recentInquiries: "Letzte Anfragen",
      recentInquiriesDetail: "Ihre aktuellsten Bestellanfragen auf einen Blick",
    },
    profile: {
      title: "Profil bearbeiten",
      introPrefix: "Unter",
      introLink: "Profil",
      introSuffix: "(Personen-Symbol im Header) k\u00f6nnen Sie Ihre Daten aktualisieren:",
      companyData: "Firmendaten",
      companyDataDetail: "Firmenname, USt-ID",
      contactData: "Kontakt",
      contactDataDetail: "Ansprechpartner, E-Mail, Telefon, WhatsApp",
      address: "Adresse",
      addressDetail: "Stra\u00dfe, PLZ, Ort, Land",
      note: "Firmentyp und Produktkategorien werden vom SWING-Team zugewiesen und k\u00f6nnen nicht selbst ge\u00e4ndert werden.",
    },
    contact: {
      title: "Kontakt & Hilfe",
      intro: "Bei Fragen zum Portal oder zu Bestellungen erreichen Sie das SWING-Vertriebsteam:",
      hotline: "Hotline",
      email: "E-Mail",
      hours: "Gesch\u00e4ftszeiten",
    },
    footerImprint: "Impressum",
    footerPrivacy: "Datenschutz",
    greenLabel: "Gr\u00fcn:",
    yellowLabel: "Gelb:",
    redLabel: "Rot:",
    actionLabel: "Aktion",
  },
  en: {
    backToCatalog: "Back to Catalog",
    title: "B2B Portal Guide",
    subtitle: "How to use the SWING B2B Portal \u2014 step by step.",
    quickStartTitle: "Quick Start \u2014 Your First Order Inquiry",
    quickStartDesc: "Example: You want to order 2\u00d7 Mirage 2 RS in size M.",
    steps: {
      findProduct: {
        title: "Find Product",
        descPrefix: "Open the",
        descCatalog: "Catalog",
        descSuffix: "and search for \u201cMirage\u201d or filter by category.",
      },
      selectSize: {
        title: "Select Color & Size",
        desc: "Click on the product. Choose your desired color design, then size M.",
      },
      addToCart: {
        title: "Add to Cart",
        desc: "Enter quantity 2 and click \u201cAdd to Cart\u201d. The count appears in the top right cart icon.",
      },
      submitInquiry: {
        title: "Submit Inquiry",
        descPrefix: "Open the",
        descCart: "Cart",
        descSuffix: ", review your items, optionally add a note, and click \u201cSubmit Inquiry\u201d.",
      },
      confirmation: {
        title: "Confirmation",
        desc: "You will receive a confirmation. The SWING sales team will process your inquiry and get back to you.",
      },
    },
    stepLabel: "Step",
    tocTitle: "Contents",
    tocItems: [
      "Browse Product Catalog",
      "Product Details & Prices",
      "Cart & Order Inquiry",
      "Inquiries Overview",
      "Your Dashboard",
      "Edit Profile",
      "Contact & Help",
    ],
    catalog: {
      title: "Browse Product Catalog",
      introPrefix: "In the",
      introCatalog: "Catalog",
      introSuffix: "you will find all available SWING products with your individual dealer prices.",
      searchTitle: "Search",
      searchDesc: "Enter the product name in the search field (e.g. \u201cMirage\u201d or \u201cBrave\u201d). Results are filtered instantly.",
      filterTitle: "Filters",
      filterCategory: "Category:",
      filterCategoryValues: "Paragliders, Tandem, Motor, Miniwings, Speedflying, Parakites, Harnesses, Accessories",
      filterEN: "EN Class:",
      filterENValues: "EN-A, EN-A/B, LOW EN-B, MID EN-B, HIGH EN-B, EN-C 2-Liner, EN-D 2-Liner",
      filterWeight: "Weight Class:",
      filterWeightValues: "N-LITE, D-LITE, U-LITE",
      badgesTitle: "Product Badges",
      badgeComingSoon: "Available soon",
      badgePreorder: "Pre-order available",
      badgeFadeOut: "Discontinued, while stocks last",
      badgeAktion: "Limited-time special offer",
      stockTitle: "Stock Indicator",
      stockGreen: "Immediately available (>10 units)",
      stockYellow: "Low stock (1\u201310 units)",
      stockRed: "Out of stock, check delivery time",
    },
    product: {
      title: "Product Details & Prices",
      intro: "Click on a product in the catalog to open the detail page. There you will find:",
      description: "Product description",
      descriptionDetail: "and technical data (weight range, takeoff weight, area, etc.)",
      colors: "Color designs",
      colorsDetail: "Select a design by clicking. Some models have limited edition designs.",
      sizes: "Sizes & Availability",
      sizesDetail: "Each size shows:",
      dealerPrice: "Your individual dealer price (net)",
      uvp: "The RRP (gross) for comparison",
      discount: "Your discount in percent",
      stock: "Current stock level (indicator)",
      deliveryTime: "Delivery time when out of stock",
      related: "Similar products",
      accessories: "Accessories",
      relatedSuffix: "at the bottom of the page",
      priceNote: "Note: The prices shown are your individual dealer prices and may differ from those of other dealers.",
    },
    cart: {
      title: "Cart & Order Inquiry",
      addTitle: "Add product to cart:",
      addStep1: "Select a color design on the product detail page",
      addStep2: "Set the quantity for your desired size (+ / \u2212 buttons)",
      addStep3: "Click \u201cAdd to Cart\u201d \u2014 the cart icon in the header shows the current count",
      checkoutTitle: "Review cart & submit inquiry:",
      checkoutStep1Prefix: "Click the cart icon in the header or navigate to the",
      checkoutStep1Cart: "Cart",
      checkoutStep2: "Review your items \u2014 quantities can be adjusted directly",
      checkoutStep3: "Optionally add a note (e.g. desired delivery date)",
      checkoutStep4: "Click \u201cSubmit Inquiry\u201d",
      importantNote: "Important: The order inquiry is non-binding. This is an inquiry, not a binding purchase. The SWING sales team will review your request and contact you with an offer.",
    },
    inquiries: {
      title: "Inquiries Overview",
      introPrefix: "Under",
      introLink: "Inquiries",
      introSuffix: "you can see all your previous order inquiries with their current status.",
      statusTitle: "Status Meanings",
      statusNew: "New",
      statusNewDesc: "Your inquiry has been received and is being processed.",
      statusProcessing: "In Progress",
      statusProcessingDesc: "The sales team is reviewing your inquiry and preparing an offer.",
      statusShipped: "Shipped",
      statusShippedDesc: "Your order has been shipped. Tracking information is available.",
      statusCompleted: "Completed",
      statusCompletedDesc: "The order has been fully processed.",
      positionsNote: "Each inquiry shows the individual items (product, size, color, quantity) as well as the total value.",
    },
    dashboard: {
      title: "Your Dashboard",
      introPrefix: "The",
      introLink: "Dashboard",
      introSuffix: "is your start page after login. Here you will find:",
      contact: "Contact details",
      contactDetail: "Hotline, email and business hours of the SWING sales team",
      metrics: "Key figures",
      metricsDetail: "Total inquiries, total value, open and completed inquiries",
      company: "Company data",
      companyDetail: "Your company, type, activation status and product categories",
      pricelists: "Price lists",
      pricelistsDetail: "Your stored price lists as PDF for download",
      messages: "Messages",
      messagesDetail: "Notes from the SWING team for you (e.g. special offers, notices)",
      recentInquiries: "Recent inquiries",
      recentInquiriesDetail: "Your latest order inquiries at a glance",
    },
    profile: {
      title: "Edit Profile",
      introPrefix: "Under",
      introLink: "Profile",
      introSuffix: "(person icon in the header) you can update your data:",
      companyData: "Company data",
      companyDataDetail: "Company name, VAT ID",
      contactData: "Contact",
      contactDataDetail: "Contact person, email, phone, WhatsApp",
      address: "Address",
      addressDetail: "Street, postal code, city, country",
      note: "Company type and product categories are assigned by the SWING team and cannot be changed by yourself.",
    },
    contact: {
      title: "Contact & Help",
      intro: "For questions about the portal or orders, contact the SWING sales team:",
      hotline: "Hotline",
      email: "Email",
      hours: "Business Hours",
    },
    footerImprint: "Imprint",
    footerPrivacy: "Privacy Policy",
    greenLabel: "Green:",
    yellowLabel: "Yellow:",
    redLabel: "Red:",
    actionLabel: "Sale",
  },
  fr: {
    backToCatalog: "Retour au catalogue",
    title: "Guide du portail B2B",
    subtitle: "Comment utiliser le portail B2B SWING \u2014 \u00e9tape par \u00e9tape.",
    quickStartTitle: "D\u00e9marrage rapide \u2014 Votre premi\u00e8re demande de commande",
    quickStartDesc: "Exemple : Vous souhaitez commander 2\u00d7 Mirage 2 RS en taille M.",
    steps: {
      findProduct: {
        title: "Trouver le produit",
        descPrefix: "Ouvrez le",
        descCatalog: "Catalogue",
        descSuffix: "et recherchez \u00ab Mirage \u00bb ou filtrez par cat\u00e9gorie.",
      },
      selectSize: {
        title: "Choisir couleur & taille",
        desc: "Cliquez sur le produit. S\u00e9lectionnez le design couleur souhait\u00e9, puis la taille M.",
      },
      addToCart: {
        title: "Ajouter au panier",
        desc: "Entrez la quantit\u00e9 2 et cliquez sur \u00ab Ajouter au panier \u00bb. Le compteur appara\u00eet en haut \u00e0 droite sur l\u2019ic\u00f4ne du panier.",
      },
      submitInquiry: {
        title: "Envoyer la demande",
        descPrefix: "Ouvrez le",
        descCart: "Panier",
        descSuffix: ", v\u00e9rifiez vos articles, ajoutez \u00e9ventuellement une note et cliquez sur \u00ab Envoyer la demande \u00bb.",
      },
      confirmation: {
        title: "Confirmation",
        desc: "Vous recevrez une confirmation. L\u2019\u00e9quipe commerciale SWING traitera votre demande et vous recontactera.",
      },
    },
    stepLabel: "\u00c9tape",
    tocTitle: "Sommaire",
    tocItems: [
      "Parcourir le catalogue",
      "D\u00e9tails produit & prix",
      "Panier & demande de commande",
      "Aper\u00e7u des demandes",
      "Votre tableau de bord",
      "Modifier le profil",
      "Contact & aide",
    ],
    catalog: {
      title: "Parcourir le catalogue",
      introPrefix: "Dans le",
      introCatalog: "Catalogue",
      introSuffix: "vous trouverez tous les produits SWING disponibles avec vos prix revendeur individuels.",
      searchTitle: "Recherche",
      searchDesc: "Entrez le nom du produit dans le champ de recherche (ex. \u00ab Mirage \u00bb ou \u00ab Brave \u00bb). Les r\u00e9sultats sont filtr\u00e9s imm\u00e9diatement.",
      filterTitle: "Filtres",
      filterCategory: "Cat\u00e9gorie :",
      filterCategoryValues: "Parapentes, Tandem, Moteur, Miniwings, Speedflying, Parakites, Sellettes, Accessoires",
      filterEN: "Classe EN :",
      filterENValues: "EN-A, EN-A/B, LOW EN-B, MID EN-B, HIGH EN-B, EN-C 2-Liner, EN-D 2-Liner",
      filterWeight: "Classe de poids :",
      filterWeightValues: "N-LITE, D-LITE, U-LITE",
      badgesTitle: "Badges produit",
      badgeComingSoon: "Bient\u00f4t disponible",
      badgePreorder: "Pr\u00e9commande possible",
      badgeFadeOut: "Mod\u00e8le en fin de s\u00e9rie, dans la limite des stocks",
      badgeAktion: "Offre sp\u00e9ciale limit\u00e9e dans le temps",
      stockTitle: "Indicateur de stock",
      stockGreen: "Disponible imm\u00e9diatement (>10 pi\u00e8ces)",
      stockYellow: "Stock faible (1\u201310 pi\u00e8ces)",
      stockRed: "Rupture de stock, v\u00e9rifier le d\u00e9lai de livraison",
    },
    product: {
      title: "D\u00e9tails produit & prix",
      intro: "Cliquez sur un produit dans le catalogue pour ouvrir la page de d\u00e9tails. Vous y trouverez :",
      description: "Description du produit",
      descriptionDetail: "et donn\u00e9es techniques (plage de poids, poids au d\u00e9collage, surface, etc.)",
      colors: "Designs couleur",
      colorsDetail: "S\u00e9lectionnez un design en cliquant. Certains mod\u00e8les proposent des designs en \u00e9dition limit\u00e9e.",
      sizes: "Tailles & disponibilit\u00e9",
      sizesDetail: "Chaque taille affiche :",
      dealerPrice: "Votre prix revendeur individuel (HT)",
      uvp: "Le prix public (TTC) pour comparaison",
      discount: "Votre remise en pourcentage",
      stock: "Le niveau de stock actuel (indicateur)",
      deliveryTime: "Le d\u00e9lai de livraison en cas de rupture",
      related: "Produits similaires",
      accessories: "Accessoires",
      relatedSuffix: "en bas de la page",
      priceNote: "Remarque : Les prix affich\u00e9s sont vos prix revendeur individuels et peuvent diff\u00e9rer de ceux d\u2019autres revendeurs.",
    },
    cart: {
      title: "Panier & demande de commande",
      addTitle: "Ajouter un produit au panier :",
      addStep1: "S\u00e9lectionnez un design couleur sur la page de d\u00e9tails du produit",
      addStep2: "R\u00e9glez la quantit\u00e9 pour la taille souhait\u00e9e (boutons + / \u2212)",
      addStep3: "Cliquez sur \u00ab Ajouter au panier \u00bb \u2014 l\u2019ic\u00f4ne du panier dans l\u2019en-t\u00eate affiche le nombre actuel",
      checkoutTitle: "V\u00e9rifier le panier & envoyer la demande :",
      checkoutStep1Prefix: "Cliquez sur l\u2019ic\u00f4ne du panier dans l\u2019en-t\u00eate ou naviguez vers le",
      checkoutStep1Cart: "Panier",
      checkoutStep2: "V\u00e9rifiez vos articles \u2014 les quantit\u00e9s peuvent \u00eatre ajust\u00e9es directement",
      checkoutStep3: "Ajoutez \u00e9ventuellement une note (ex. date de livraison souhait\u00e9e)",
      checkoutStep4: "Cliquez sur \u00ab Envoyer la demande \u00bb",
      importantNote: "Important : La demande de commande est sans engagement. Il s\u2019agit d\u2019une demande, pas d\u2019un achat ferme. L\u2019\u00e9quipe commerciale SWING examinera votre demande et vous contactera avec une offre.",
    },
    inquiries: {
      title: "Aper\u00e7u des demandes",
      introPrefix: "Sous",
      introLink: "Demandes",
      introSuffix: "vous pouvez voir toutes vos demandes de commande pr\u00e9c\u00e9dentes avec leur statut actuel.",
      statusTitle: "Signification des statuts",
      statusNew: "Nouveau",
      statusNewDesc: "Votre demande a \u00e9t\u00e9 re\u00e7ue et est en cours de traitement.",
      statusProcessing: "En cours",
      statusProcessingDesc: "L\u2019\u00e9quipe commerciale examine votre demande et pr\u00e9pare une offre.",
      statusShipped: "Exp\u00e9di\u00e9",
      statusShippedDesc: "Votre commande a \u00e9t\u00e9 exp\u00e9di\u00e9e. Les informations de suivi sont disponibles.",
      statusCompleted: "Termin\u00e9",
      statusCompletedDesc: "La commande a \u00e9t\u00e9 enti\u00e8rement trait\u00e9e.",
      positionsNote: "Chaque demande affiche les articles individuels (produit, taille, couleur, quantit\u00e9) ainsi que la valeur totale.",
    },
    dashboard: {
      title: "Votre tableau de bord",
      introPrefix: "Le",
      introLink: "Tableau de bord",
      introSuffix: "est votre page d\u2019accueil apr\u00e8s la connexion. Vous y trouverez :",
      contact: "Coordonn\u00e9es",
      contactDetail: "T\u00e9l\u00e9phone, e-mail et horaires de l\u2019\u00e9quipe commerciale SWING",
      metrics: "Chiffres cl\u00e9s",
      metricsDetail: "Nombre total de demandes, valeur totale, demandes ouvertes et termin\u00e9es",
      company: "Donn\u00e9es de l\u2019entreprise",
      companyDetail: "Votre entreprise, type, statut d\u2019activation et cat\u00e9gories de produits",
      pricelists: "Listes de prix",
      pricelistsDetail: "Vos listes de prix enregistr\u00e9es en PDF \u00e0 t\u00e9l\u00e9charger",
      messages: "Messages",
      messagesDetail: "Notes de l\u2019\u00e9quipe SWING pour vous (ex. offres sp\u00e9ciales, informations)",
      recentInquiries: "Derni\u00e8res demandes",
      recentInquiriesDetail: "Vos demandes de commande les plus r\u00e9centes en un coup d\u2019\u0153il",
    },
    profile: {
      title: "Modifier le profil",
      introPrefix: "Sous",
      introLink: "Profil",
      introSuffix: "(ic\u00f4ne personne dans l\u2019en-t\u00eate) vous pouvez mettre \u00e0 jour vos donn\u00e9es :",
      companyData: "Donn\u00e9es de l\u2019entreprise",
      companyDataDetail: "Nom de l\u2019entreprise, num\u00e9ro de TVA",
      contactData: "Contact",
      contactDataDetail: "Personne de contact, e-mail, t\u00e9l\u00e9phone, WhatsApp",
      address: "Adresse",
      addressDetail: "Rue, code postal, ville, pays",
      note: "Le type d\u2019entreprise et les cat\u00e9gories de produits sont attribu\u00e9s par l\u2019\u00e9quipe SWING et ne peuvent pas \u00eatre modifi\u00e9s par vous-m\u00eame.",
    },
    contact: {
      title: "Contact & aide",
      intro: "Pour toute question concernant le portail ou les commandes, contactez l\u2019\u00e9quipe commerciale SWING :",
      hotline: "T\u00e9l\u00e9phone",
      email: "E-mail",
      hours: "Horaires d\u2019ouverture",
    },
    footerImprint: "Mentions l\u00e9gales",
    footerPrivacy: "Protection des donn\u00e9es",
    greenLabel: "Vert :",
    yellowLabel: "Jaune :",
    redLabel: "Rouge :",
    actionLabel: "Promo",
  },
};

const tocAnchors = ["#katalog", "#produkt", "#warenkorb", "#anfragen", "#dashboard", "#profil", "#kontakt"];

export default async function AnleitungPage() {
  const locale = await getLocale();
  const txt = t[locale];

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
            {txt.backToCatalog}
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

        {/* Quick Workflow Example */}
        <section className="card overflow-hidden">
          <div className="bg-swing-gold/10 px-6 py-4 sm:px-8">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-swing-navy">
              {txt.quickStartTitle}
            </h2>
            <p className="mt-1 text-[13px] text-swing-gray-dark/60">
              {txt.quickStartDesc}
            </p>
          </div>
          <div className="space-y-0 px-6 py-5 sm:px-8">
            {[
              {
                step: "1",
                icon: <Search size={16} />,
                title: txt.steps.findProduct.title,
                desc: (
                  <>
                    {txt.steps.findProduct.descPrefix}{" "}
                    <Link href="/katalog" className="font-semibold text-swing-navy underline">
                      {txt.steps.findProduct.descCatalog}
                    </Link>{" "}
                    {txt.steps.findProduct.descSuffix}
                  </>
                ),
              },
              {
                step: "2",
                icon: <Palette size={16} />,
                title: txt.steps.selectSize.title,
                desc: txt.steps.selectSize.desc,
              },
              {
                step: "3",
                icon: <ShoppingCart size={16} />,
                title: txt.steps.addToCart.title,
                desc: txt.steps.addToCart.desc,
              },
              {
                step: "4",
                icon: <Send size={16} />,
                title: txt.steps.submitInquiry.title,
                desc: (
                  <>
                    {txt.steps.submitInquiry.descPrefix}{" "}
                    <Link href="/katalog/warenkorb" className="font-semibold text-swing-navy underline">
                      {txt.steps.submitInquiry.descCart}
                    </Link>
                    {txt.steps.submitInquiry.descSuffix}
                  </>
                ),
              },
              {
                step: "5",
                icon: <CheckCircle2 size={16} />,
                title: txt.steps.confirmation.title,
                desc: txt.steps.confirmation.desc,
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
                    {txt.stepLabel} {item.step}: {item.title}
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
            {txt.tocTitle}
          </h2>
          <nav className="space-y-1.5">
            {tocAnchors.map((href, i) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] font-medium text-swing-navy transition-colors hover:bg-swing-navy/5"
              >
                <ChevronRight size={12} className="text-swing-gold" />
                {txt.tocItems[i]}
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
              {txt.catalog.title}
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.catalog.introPrefix}{" "}
              <Link href="/katalog" className="font-semibold text-swing-navy underline">
                {txt.catalog.introCatalog}
              </Link>{" "}
              {txt.catalog.introSuffix}
            </p>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.catalog.searchTitle}
              </p>
              <p>{txt.catalog.searchDesc}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                <Filter size={12} />
                {txt.catalog.filterTitle}
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>{txt.catalog.filterCategory}</strong> {txt.catalog.filterCategoryValues}</li>
                <li><strong>{txt.catalog.filterEN}</strong> {txt.catalog.filterENValues}</li>
                <li><strong>{txt.catalog.filterWeight}</strong> {txt.catalog.filterWeightValues}</li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.catalog.badgesTitle}
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    Coming Soon
                  </span>{" "}
                  &mdash; {txt.catalog.badgeComingSoon}
                </li>
                <li>
                  <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                    Preorder
                  </span>{" "}
                  &mdash; {txt.catalog.badgePreorder}
                </li>
                <li>
                  <span className="inline-block rounded bg-gray-200 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
                    Fade Out
                  </span>{" "}
                  &mdash; {txt.catalog.badgeFadeOut}
                </li>
                <li>
                  <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
                    {txt.actionLabel}
                  </span>{" "}
                  &mdash; {txt.catalog.badgeAktion}
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.catalog.stockTitle}
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span><strong>{txt.greenLabel}</strong> {txt.catalog.stockGreen}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span><strong>{txt.yellowLabel}</strong> {txt.catalog.stockYellow}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span><strong>{txt.redLabel}</strong> {txt.catalog.stockRed}</span>
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
              {txt.product.title}
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>{txt.product.intro}</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <strong>{txt.product.description}</strong> {txt.product.descriptionDetail}
              </li>
              <li>
                <strong>{txt.product.colors}</strong> &mdash; {txt.product.colorsDetail}
              </li>
              <li>
                <strong>{txt.product.sizes}</strong> &mdash; {txt.product.sizesDetail}
                <ul className="ml-4 mt-1 list-disc space-y-1">
                  <li>{txt.product.dealerPrice}</li>
                  <li>{txt.product.uvp}</li>
                  <li>{txt.product.discount}</li>
                  <li>{txt.product.stock}</li>
                  <li>{txt.product.deliveryTime}</li>
                </ul>
              </li>
              <li>
                <strong>{txt.product.related}</strong> {locale === "de" ? "und" : locale === "en" ? "and" : "et"} <strong>{txt.product.accessories}</strong> {txt.product.relatedSuffix}
              </li>
            </ul>
            <div className="rounded-lg border border-swing-gold/30 bg-swing-gold/5 p-4">
              <p className="text-[12px] font-semibold text-swing-navy">
                {txt.product.priceNote}
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
              {txt.cart.title}
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p><strong>{txt.cart.addTitle}</strong></p>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>{txt.cart.addStep1}</li>
              <li>{txt.cart.addStep2}</li>
              <li>{txt.cart.addStep3}</li>
            </ol>
            <p className="mt-3"><strong>{txt.cart.checkoutTitle}</strong></p>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>
                {txt.cart.checkoutStep1Prefix}{" "}
                <Link href="/katalog/warenkorb" className="font-semibold text-swing-navy underline">
                  {txt.cart.checkoutStep1Cart}
                </Link>
              </li>
              <li>{txt.cart.checkoutStep2}</li>
              <li>{txt.cart.checkoutStep3}</li>
              <li>{txt.cart.checkoutStep4}</li>
            </ol>
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-[12px] font-semibold text-blue-800">
                {txt.cart.importantNote}
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
              {txt.inquiries.title}
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.inquiries.introPrefix}{" "}
              <Link href="/katalog/anfragen" className="font-semibold text-swing-navy underline">
                {txt.inquiries.introLink}
              </Link>{" "}
              {txt.inquiries.introSuffix}
            </p>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-swing-navy/50">
                {txt.inquiries.statusTitle}
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <CircleDot size={14} className="mt-0.5 shrink-0 text-blue-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">{txt.inquiries.statusNew}</p>
                    <p className="text-swing-gray-dark/60">{txt.inquiries.statusNewDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={14} className="mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">{txt.inquiries.statusProcessing}</p>
                    <p className="text-swing-gray-dark/60">{txt.inquiries.statusProcessingDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={14} className="mt-0.5 shrink-0 text-purple-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">{txt.inquiries.statusShipped}</p>
                    <p className="text-swing-gray-dark/60">{txt.inquiries.statusShippedDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-swing-navy">{txt.inquiries.statusCompleted}</p>
                    <p className="text-swing-gray-dark/60">{txt.inquiries.statusCompletedDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <p>{txt.inquiries.positionsNote}</p>
          </div>
        </section>

        {/* 5. Dashboard */}
        <section id="dashboard" className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
              <LayoutDashboard size={16} />
            </div>
            <h2 className="text-base font-extrabold text-swing-navy">
              {txt.dashboard.title}
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.dashboard.introPrefix}{" "}
              <Link href="/katalog/dashboard" className="font-semibold text-swing-navy underline">
                {txt.dashboard.introLink}
              </Link>{" "}
              {txt.dashboard.introSuffix}
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong>{txt.dashboard.contact}</strong> &mdash; {txt.dashboard.contactDetail}</li>
              <li><strong>{txt.dashboard.metrics}</strong> &mdash; {txt.dashboard.metricsDetail}</li>
              <li><strong>{txt.dashboard.company}</strong> &mdash; {txt.dashboard.companyDetail}</li>
              <li><strong>{txt.dashboard.pricelists}</strong> &mdash; {txt.dashboard.pricelistsDetail}</li>
              <li><strong>{txt.dashboard.messages}</strong> &mdash; {txt.dashboard.messagesDetail}</li>
              <li><strong>{txt.dashboard.recentInquiries}</strong> &mdash; {txt.dashboard.recentInquiriesDetail}</li>
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
              {txt.profile.title}
            </h2>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>
              {txt.profile.introPrefix}{" "}
              <Link href="/katalog/profil" className="font-semibold text-swing-navy underline">
                {txt.profile.introLink}
              </Link>{" "}
              {txt.profile.introSuffix}
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong>{txt.profile.companyData}</strong> &mdash; {txt.profile.companyDataDetail}</li>
              <li><strong>{txt.profile.contactData}</strong> &mdash; {txt.profile.contactDataDetail}</li>
              <li><strong>{txt.profile.address}</strong> &mdash; {txt.profile.addressDetail}</li>
            </ul>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[12px] font-semibold text-amber-800">
                {txt.profile.note}
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
              {txt.contact.title}
            </h2>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-swing-gray-dark/80">
            <p>{txt.contact.intro}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Phone size={18} className="mx-auto mb-2 text-swing-navy/40" />
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/40">{txt.contact.hotline}</p>
                <a
                  href="tel:+4981413277888"
                  className="mt-1 block text-[13px] font-semibold text-swing-navy transition-colors hover:text-swing-gold"
                >
                  +49 (0)8141 32 77 888
                </a>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Mail size={18} className="mx-auto mb-2 text-swing-navy/40" />
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/40">{txt.contact.email}</p>
                <a
                  href="mailto:info@swing.de"
                  className="mt-1 block text-[13px] font-semibold text-swing-navy transition-colors hover:text-swing-gold"
                >
                  info@swing.de
                </a>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <Clock size={18} className="mx-auto mb-2 text-swing-navy/40" />
                <p className="text-[12px] font-bold uppercase tracking-wide text-swing-navy/40">{txt.contact.hours}</p>
                <p className="mt-1 text-[13px] font-semibold text-swing-navy">
                  {locale === "fr" ? "Lu\u2013Je" : locale === "en" ? "Mon\u2013Thu" : "Mo\u2013Do"} 9\u201312 / 13\u201317
                </p>
                <p className="text-[13px] font-semibold text-swing-navy">
                  {locale === "fr" ? "Ve" : locale === "en" ? "Fri" : "Fr"} 9\u201312 / 13\u201315
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
            {txt.backToCatalog}
          </Link>
          <div className="flex items-center gap-4 text-[12px] text-swing-gray-dark/40">
            <Link href="/impressum" className="transition-colors hover:text-swing-navy">
              {txt.footerImprint}
            </Link>
            <Link href="/datenschutz" className="transition-colors hover:text-swing-navy">
              {txt.footerPrivacy}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
