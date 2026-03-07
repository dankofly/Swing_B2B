import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORIES = [
  { name: "Gleitschirme", slug: "gleitschirme", sort_order: 0 },
  { name: "Tandem", slug: "tandem", sort_order: 1 },
  { name: "Motorschirme", slug: "motorschirme", sort_order: 2 },
  { name: "Miniwings / Hike & Fly", slug: "miniwings", sort_order: 3 },
  { name: "Speedflying / Speedriding", slug: "speedflying", sort_order: 4 },
  { name: "Parakites", slug: "parakites", sort_order: 5 },
  { name: "Gurtzeuge", slug: "gurtzeuge", sort_order: 6 },
  { name: "Rettungsgeräte", slug: "rettungsgeraete", sort_order: 7 },
  { name: "Zubehör", slug: "zubehoer", sort_order: 8 },
];

function colorSvg(name: string, bg: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${bg}" rx="8"/>
  <ellipse cx="200" cy="110" rx="140" ry="55" fill="${accent}" opacity="0.3"/>
  <path d="M60,120 Q200,30 340,120 Q200,95 60,120Z" fill="${accent}" opacity="0.7"/>
  <path d="M80,120 Q200,50 320,120 Q200,100 80,120Z" fill="${accent}" opacity="0.9"/>
  <line x1="160" y1="120" x2="185" y2="220" stroke="${accent}" stroke-width="1" opacity="0.3"/>
  <line x1="240" y1="120" x2="215" y2="220" stroke="${accent}" stroke-width="1" opacity="0.3"/>
  <text x="200" y="265" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="white" opacity="0.8">${name}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function productSvg(name: string, bg: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${bg}"/>
  <ellipse cx="400" cy="200" rx="280" ry="100" fill="${accent}" opacity="0.3"/>
  <path d="M120,200 Q400,50 680,200 Q400,170 120,200Z" fill="${accent}" opacity="0.6"/>
  <path d="M160,200 Q400,80 640,200 Q400,180 160,200Z" fill="${accent}" opacity="0.8"/>
  <text x="400" y="500" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="white" opacity="0.9">SWING</text>
  <text x="400" y="540" text-anchor="middle" font-family="sans-serif" font-size="18" fill="white" opacity="0.6">${name}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function sizes(prefix: string, labels: string[], stocks: number[], deliveries: number[]) {
  return labels.map((label, i) => ({
    size_label: label,
    sku: `${prefix}-${label}`,
    stock_quantity: stocks[i],
    delivery_days: deliveries[i],
    sort_order: i,
  }));
}

function colors(
  list: { name: string; bg: string; accent: string; slogan: string; classification: string | null }[]
) {
  return list.map((c, i) => ({
    color_name: c.name,
    slogan: c.slogan,
    classification: c.classification,
    color_image_url: () => colorSvg(c.name, c.bg, c.accent),
    sort_order: i,
  }));
}

const PRODUCTS = [
  // =============================================
  // GLEITSCHIRME (aus Preisliste 2025-04)
  // =============================================
  {
    name: "Mito 2 RS",
    slug: "mito-2-rs",
    description: "Einfachstes Aufziehverhalten ohne Überschießen. RAST für mehr Kontrolle und Komfort. Der ideale Einsteigerschirm.",
    category: "gleitschirme",
    classification: null,
    use_case: "Schulung & Thermik",
    website_url: "https://www.swing.de/gleitschirme/mito-2-rs.html",
    is_active: true,
    image: () => productSvg("MITO 2 RS", "#1F2A55", "#FCC923"),
    tech_specs: { "EN-Zertifizierung": "EN-A", Kategorie: "training/allround", Zellen: "40", Streckung: "5.05", Startgewicht: "60 - 130 kg" },
    sizes: sizes("MITO2RS", ["XS", "S", "SM", "ML", "L"], [3, 12, 8, 15, 0], [14, 0, 0, 0, 21]),
    colors: colors([
      { name: "Cosmic", bg: "#1a237e", accent: "#7c4dff", slogan: "Einfachstes Aufziehverhalten", classification: null },
      { name: "Gold", bg: "#f57f17", accent: "#fff176", slogan: "RAST für mehr Kontrolle", classification: null },
      { name: "Lime", bg: "#33691e", accent: "#c6ff00", slogan: "Farblich markierte Einhängeschlaufen", classification: null },
    ]),
  },
  {
    name: "Verso RS",
    slug: "verso-rs",
    description: "Der vielseitige Leichtschirm. Minimales Packmaß und geringes Gewicht — ideal für Hike & Fly und den Einstieg.",
    category: "gleitschirme",
    classification: "D-LITE",
    use_case: "Hike & Fly",
    website_url: "https://www.swing.de/gleitschirme/verso-rs.html",
    is_active: true,
    image: () => productSvg("VERSO RS", "#4a148c", "#ce93d8"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "versatility", Streckung: "5.00", Startgewicht: "55 - 110 kg" },
    sizes: sizes("VERSO-RS", ["XXS", "XS", "S", "SM", "ML"], [4, 6, 14, 11, 5], [0, 0, 0, 0, 0]),
    colors: colors([
      { name: "Violet", bg: "#4a148c", accent: "#e040fb", slogan: "Ultraleicht und kompakt", classification: "D-LITE" },
      { name: "Mint", bg: "#004d40", accent: "#64ffda", slogan: "Minimales Packmaß", classification: "D-LITE" },
    ]),
  },
  {
    name: "Miura 2 RS",
    slug: "miura-2-rs",
    description: "Der vielseitige Thermikschirm für fortgeschrittene Piloten. Präzises Handling und exzellente Steigleistung.",
    category: "gleitschirme",
    classification: "N-LITE",
    use_case: "Thermik & Strecke",
    website_url: "https://www.swing.de/gleitschirme/miura-2-rs.html",
    is_active: true,
    image: () => productSvg("MIURA 2 RS", "#1b5e20", "#a5d6a7"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "low level intermediate", Zellen: "50", Streckung: "5.50", Startgewicht: "65 - 130 kg" },
    sizes: sizes("MIURA2RS", ["XS", "S", "M", "L", "XL"], [4, 9, 6, 8, 3], [0, 0, 0, 0, 14]),
    colors: colors([
      { name: "Forest", bg: "#1b5e20", accent: "#69f0ae", slogan: "Präzises Handling", classification: "N-LITE" },
      { name: "Silver", bg: "#37474f", accent: "#b0bec5", slogan: "Exzellente Steigleistung", classification: "N-LITE" },
    ]),
  },
  {
    name: "Miura 2 RS D-Lite",
    slug: "miura-2-rs-d-lite",
    description: "Die Leichtversion des bewährten Miura 2 RS. Gleiche Performance bei deutlich reduziertem Gewicht für Hike & Fly.",
    category: "gleitschirme",
    classification: "D-LITE",
    use_case: "Thermik & Hike & Fly",
    website_url: "https://www.swing.de/gleitschirme/miura-2-rs.html",
    is_active: true,
    image: () => productSvg("MIURA 2 RS D-Lite", "#2e7d32", "#c8e6c9"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "low level intermediate", Zellen: "50", Streckung: "5.50", Startgewicht: "65 - 130 kg" },
    sizes: sizes("MIURA2RS-DL", ["XS", "S", "M", "L", "XL"], [2, 5, 7, 4, 1], [0, 0, 0, 0, 21]),
    colors: colors([
      { name: "Sage", bg: "#2e7d32", accent: "#a5d6a7", slogan: "Leicht und leistungsstark", classification: "D-LITE" },
      { name: "Cloud", bg: "#546e7a", accent: "#cfd8dc", slogan: "Hike & Fly Performance", classification: "D-LITE" },
    ]),
  },
  {
    name: "Nyra RS",
    slug: "nyra-rs",
    description: "Leichtschirm mit sportlichem Charakter. Ausgezeichnete Thermikleistung bei minimalem Gewicht.",
    category: "gleitschirme",
    classification: "D-LITE",
    use_case: "Thermik & Hike & Fly",
    website_url: "https://www.swing.de/gleitschirme/nyra-rs.html",
    is_active: true,
    image: () => productSvg("NYRA RS", "#006064", "#80deea"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "mid level intermediate", Zellen: "46", Streckung: "5.35", Startgewicht: "58 - 115 kg" },
    sizes: sizes("NYRA-RS", ["XS", "S", "M", "L", "XL"], [3, 8, 12, 4, 2], [0, 0, 0, 14, 14]),
    colors: colors([
      { name: "Teal", bg: "#006064", accent: "#84ffff", slogan: "Sportlich und leicht", classification: "D-LITE" },
      { name: "Coral", bg: "#bf360c", accent: "#ff9e80", slogan: "Ausgezeichnete Thermikleistung", classification: "D-LITE" },
    ]),
  },
  {
    name: "Nyos 2 RS",
    slug: "nyos-2-rs",
    description: "Der sportliche XC-Cruiser für ambitionierte Piloten. Hervorragende Gleitleistung gepaart mit hoher passiver Sicherheit.",
    category: "gleitschirme",
    classification: "N-LITE",
    use_case: "XC & Strecke",
    website_url: "https://www.swing.de/gleitschirme/nyos-rs.html",
    is_active: true,
    image: () => productSvg("NYOS 2 RS", "#b71c1c", "#ffffff"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "xc cruiser", Zellen: "48", Streckung: "5.40", Startgewicht: "65 - 130 kg" },
    sizes: sizes("NYOS2RS", ["XS", "S", "SM", "ML", "L"], [2, 7, 5, 4, 11], [14, 0, 0, 0, 0]),
    colors: colors([
      { name: "Racing Red", bg: "#c62828", accent: "#ff8a80", slogan: "Sportlicher XC-Cruiser", classification: "N-LITE" },
      { name: "Sky Blue", bg: "#0d47a1", accent: "#82b1ff", slogan: "Hervorragende Gleitleistung", classification: "N-LITE" },
    ]),
  },
  {
    name: "Stellar RS",
    slug: "stellar-rs",
    description: "Der sportliche XC-Sportster. D-LITE Leichtbau trifft ambitionierte Streckenflug-Performance.",
    category: "gleitschirme",
    classification: "D-LITE",
    use_case: "XC & Strecke",
    website_url: "https://www.swing.de/gleitschirme/stellar-rs.html",
    is_active: true,
    image: () => productSvg("STELLAR RS", "#1a237e", "#ffd740"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "xc sportster", Zellen: "54", Streckung: "5.80", Startgewicht: "65 - 125 kg" },
    sizes: sizes("STELLAR-RS", ["XS", "S", "SM", "ML", "L"], [1, 3, 0, 2, 4], [0, 0, 21, 0, 0]),
    colors: colors([
      { name: "Midnight Gold", bg: "#1a237e", accent: "#ffd740", slogan: "Hochleistung trifft Leichtbau", classification: "D-LITE" },
    ]),
  },
  {
    name: "Libra RS",
    slug: "libra-rs",
    description: "Sport 2-Liner mit D-LITE Gewicht. Kompromisslose XC-Performance für erfahrene Piloten.",
    category: "gleitschirme",
    classification: "D-LITE",
    use_case: "XC & Wettbewerb",
    website_url: "https://www.swing.de/gleitschirme/libra-rs.html",
    is_active: true,
    image: () => productSvg("LIBRA RS", "#880e4f", "#f48fb1"),
    tech_specs: { "EN-Zertifizierung": "EN-C", Kategorie: "sport 2-liner", Zellen: "56", Streckung: "5.90", Startgewicht: "60 - 120 kg" },
    sizes: sizes("LIBRA-RS", ["XS", "S", "SM", "ML", "L"], [0, 5, 9, 4, 2], [28, 0, 0, 0, 0]),
    colors: colors([
      { name: "Berry", bg: "#880e4f", accent: "#ff80ab", slogan: "Kompromisslose XC-Performance", classification: "D-LITE" },
      { name: "Sand", bg: "#5d4037", accent: "#d7ccc8", slogan: "Sport 2-Liner", classification: "D-LITE" },
    ]),
  },
  {
    name: "Sphera RS",
    slug: "sphera-rs",
    description: "XC-Performance Schirm für erfahrene Streckenpiloten. Maximale Leistung für ambitionierte Wettbewerbspiloten.",
    category: "gleitschirme",
    classification: "N-LITE",
    use_case: "XC & Wettbewerb",
    website_url: "https://www.swing.de/gleitschirme/sphera-rs.html",
    is_active: true,
    image: () => productSvg("SPHERA RS", "#0d47a1", "#64b5f6"),
    tech_specs: { "EN-Zertifizierung": "EN-D", Kategorie: "xc performance", Zellen: "62", Streckung: "6.20", Startgewicht: "65 - 120 kg" },
    sizes: sizes("SPHERA-RS", ["S", "SM", "ML", "L"], [1, 3, 2, 0], [0, 0, 0, 28]),
    colors: colors([
      { name: "Ocean", bg: "#0d47a1", accent: "#82b1ff", slogan: "Maximale XC-Performance", classification: "N-LITE" },
      { name: "Stealth", bg: "#263238", accent: "#546e7a", slogan: "Kompromisslose Leistung", classification: "N-LITE" },
    ]),
  },

  // =============================================
  // TANDEM
  // =============================================
  {
    name: "Twin 3 RS",
    slug: "twin-3-rs",
    description: "Der zuverlässige Tandemschirm für professionelle Tandempiloten. Einfaches Startverhalten und komfortables Fliegen.",
    category: "tandem",
    classification: "N-LITE",
    use_case: "Tandem",
    website_url: "https://www.swing.de/gleitschirme/twin-3-rs.html",
    is_active: true,
    image: () => productSvg("TWIN 3 RS", "#1F2A55", "#90caf9"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "biplace", Zellen: "44", Streckung: "5.20", Startgewicht: "100 - 230 kg" },
    sizes: sizes("TWIN3RS", ["39", "42"], [4, 6], [0, 0]),
    colors: colors([
      { name: "Navy", bg: "#1F2A55", accent: "#5c6bc0", slogan: "Zuverlässig und komfortabel", classification: "N-LITE" },
      { name: "Orange", bg: "#e65100", accent: "#ffab40", slogan: "Professionell Tandem fliegen", classification: "N-LITE" },
    ]),
  },

  // =============================================
  // MOTORSCHIRME
  // =============================================
  {
    name: "Sting RS",
    slug: "sting-rs",
    description: "Der vielseitige Motorschirm für Freiflug- und Motorpiloten. Schnelles Aufziehen, stabiler Flug und hervorragende Manövrierbarkeit.",
    category: "motorschirme",
    classification: null,
    use_case: "Motorschirm",
    website_url: "https://www.swing.de/gleitschirme/sting-rs.html",
    is_active: true,
    image: () => productSvg("STING RS", "#f57f17", "#fff9c4"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Kategorie: "dual purpose ppg", Zellen: "42", Streckung: "5.10", Startgewicht: "70 - 170 kg" },
    sizes: sizes("STING-RS", ["22", "24", "26", "28", "31", "34"], [2, 3, 7, 5, 4, 1], [14, 0, 0, 0, 0, 14]),
    colors: colors([
      { name: "Yellow", bg: "#f57f17", accent: "#fff176", slogan: "Vielseitig und stabil", classification: null },
      { name: "White", bg: "#eceff1", accent: "#90a4ae", slogan: "Schnelles Aufziehen", classification: null },
    ]),
  },

  // =============================================
  // MINIWINGS / HIKE & FLY
  // =============================================
  {
    name: "Mirage 2 RS",
    slug: "mirage-2-rs",
    description: "Die ultraleichte Miniwing für Hike & Fly Enthusiasten. Extremes Leichtgewicht und ausgezeichnete Flugeigenschaften.",
    category: "miniwings",
    classification: "U-LITE",
    use_case: "Hike & Fly",
    website_url: "https://www.swing.de/gleitschirme/mirage-2-rs.html",
    is_active: true,
    image: () => productSvg("MIRAGE 2 RS", "#00695c", "#a7ffeb"),
    tech_specs: { "EN-Zertifizierung": "EN-B", Zellen: "40", Streckung: "5.15", Startgewicht: "55 - 100 kg" },
    sizes: sizes("MIRAGE2RS", ["XS", "S", "M", "L"], [8, 15, 12, 6], [0, 0, 0, 0]),
    colors: colors([
      { name: "Emerald", bg: "#00695c", accent: "#64ffda", slogan: "Ultraleicht für Hike & Fly", classification: "U-LITE" },
      { name: "Fire", bg: "#c62828", accent: "#ff5252", slogan: "Extremes Leichtgewicht", classification: "U-LITE" },
    ]),
  },

  // =============================================
  // SPEEDFLYING / SPEEDRIDING
  // =============================================
  {
    name: "Spitfire 3",
    slug: "spitfire-3",
    description: "Der moderne Speedflying-Schirm. Präzise Steuerung, hohe Geschwindigkeit und dynamisches Flugverhalten.",
    category: "speedflying",
    classification: null,
    use_case: "Speedflying",
    website_url: "https://www.swing.de/gleitschirme/spitfire-3.html",
    is_active: true,
    image: () => productSvg("SPITFIRE 3", "#c62828", "#ff8a80"),
    tech_specs: { Zellen: "22", Streckung: "4.20", Startgewicht: "60 - 120 kg" },
    sizes: sizes("SPIT3", ["10", "12", "14", "16"], [4, 6, 5, 3], [0, 0, 0, 14]),
    colors: colors([
      { name: "Red", bg: "#c62828", accent: "#ff5252", slogan: "Dynamisch und präzise", classification: null },
      { name: "Black", bg: "#212121", accent: "#757575", slogan: "Hohe Geschwindigkeit", classification: null },
    ]),
  },
  {
    name: "Spitfire Classic",
    slug: "spitfire-classic",
    description: "Der bewährte Speedriding-Schirm. Gutmütiges Verhalten und solide Performance für den Einstieg.",
    category: "speedflying",
    classification: null,
    use_case: "Speedriding",
    website_url: "https://www.swing.de/gleitschirme/spitfire-classic.html",
    is_active: true,
    image: () => productSvg("SPITFIRE CLASSIC", "#ff6f00", "#ffe082"),
    tech_specs: { Zellen: "20", Streckung: "4.00", Startgewicht: "60 - 120 kg" },
    sizes: sizes("SPIT-CL", ["12", "14", "16"], [3, 5, 4], [0, 0, 0]),
    colors: colors([
      { name: "Orange", bg: "#ff6f00", accent: "#ffd54f", slogan: "Bewährt und solide", classification: null },
    ]),
  },

  // =============================================
  // PARAKITES
  // =============================================
  {
    name: "Wave RS D-Lite",
    slug: "wave-rs-d-lite",
    description: "Der vielseitige Parakite. Stabil, sicher und mit hervorragender Windrange für Strand und Wasser.",
    category: "parakites",
    classification: "D-LITE",
    use_case: "Parakite",
    website_url: "https://www.swing.de/gleitschirme/wave-rs.html",
    is_active: true,
    image: () => productSvg("WAVE RS D-Lite", "#01579b", "#4fc3f7"),
    tech_specs: { Zellen: "18", Streckung: "3.80" },
    sizes: sizes("WAVE-RS-DL", ["10", "11.5", "13", "15", "18"], [10, 8, 12, 6, 4], [0, 0, 0, 0, 14]),
    colors: colors([
      { name: "Aqua", bg: "#01579b", accent: "#80d8ff", slogan: "Stabil und vielseitig", classification: "D-LITE" },
      { name: "Sunset", bg: "#e65100", accent: "#ffcc02", slogan: "Hervorragende Windrange", classification: "D-LITE" },
    ]),
  },

  // =============================================
  // GURTZEUGE
  // =============================================
  {
    name: "Brave 5",
    slug: "brave-5",
    description: "Das komfortable Sitzgurtzeug für Genussflieger. Bequemer Sitz und zuverlässiger Protektor.",
    category: "gurtzeuge",
    classification: null,
    use_case: "Allround",
    website_url: "https://www.swing.de/gurtzeuge/brave-5.html",
    is_active: true,
    image: () => productSvg("BRAVE 5", "#37474f", "#b0bec5"),
    tech_specs: { Typ: "Sitzgurtzeug", Gewicht: "5.2 - 5.8 kg", Protektor: "Airbag + Schaumstoff" },
    sizes: sizes("BRAVE5", ["Einheitsgröße"], [20], [0]),
    colors: colors([
      { name: "Anthrazit", bg: "#37474f", accent: "#78909c", slogan: "Komfortabel und zuverlässig", classification: null },
    ]),
  },
  {
    name: "Connect Reverse 3",
    slug: "connect-reverse-3",
    description: "Das Wendegurtzeug der dritten Generation. Einfacher Einstieg, kompaktes Packmaß und optimaler Rückenschutz.",
    category: "gurtzeuge",
    classification: null,
    use_case: "Allround",
    website_url: "https://www.swing.de/gurtzeuge/connect-reverse-3.html",
    is_active: true,
    image: () => productSvg("CONNECT REVERSE 3", "#263238", "#90caf9"),
    tech_specs: { Typ: "Wendegurtzeug", Gewicht: "3.8 - 4.3 kg", Protektor: "Airbag + Schaum" },
    sizes: sizes("CONN-R3", ["S", "M", "L", "XL"], [18, 22, 14, 8], [0, 0, 0, 0]),
    colors: colors([
      { name: "Black", bg: "#212121", accent: "#616161", slogan: "Kompaktes Packmaß", classification: null },
      { name: "Blue", bg: "#0d47a1", accent: "#42a5f5", slogan: "Optimaler Rückenschutz", classification: null },
    ]),
  },
  {
    name: "Connect Race Lite",
    slug: "connect-race-lite",
    description: "Ultraleichtes Liegegurtzeug für XC-Piloten. Aerodynamisches Design und minimales Gewicht. Verfügbar mit Schaum- oder Luftprotektor.",
    category: "gurtzeuge",
    classification: null,
    use_case: "XC & Strecke",
    website_url: "https://www.swing.de/gurtzeuge/connect-race-lite.html",
    is_active: true,
    image: () => productSvg("CONNECT RACE LITE", "#1F2A55", "#FCC923"),
    tech_specs: { Typ: "Liegegurtzeug", Gewicht: "3.2 - 3.8 kg", Protektor: "Schaum oder Luft" },
    sizes: sizes("CONN-RL", ["S", "M", "L", "XL"], [6, 10, 5, 3], [0, 0, 0, 14]),
    colors: colors([
      { name: "Navy", bg: "#1F2A55", accent: "#5c6bc0", slogan: "Ultraleicht und aerodynamisch", classification: null },
    ]),
  },

  // =============================================
  // RETTUNGSGERÄTE
  // =============================================
  {
    name: "Escape",
    slug: "rundkappe-escape",
    description: "Die bewährte Rundkappe für zuverlässige Rettung. Einfache Handhabung und konstante Sinkrate.",
    category: "rettungsgeraete",
    classification: null,
    use_case: "Rettung",
    website_url: "https://www.swing.de/rettungsgeraete/escape.html",
    is_active: true,
    image: () => productSvg("ESCAPE", "#d84315", "#ffccbc"),
    tech_specs: { Typ: "Rundkappe", Sinkrate: "< 5.5 m/s", Zertifizierung: "EN 12491" },
    sizes: sizes("ESCAPE", ["M", "L", "XL"], [35, 40, 28], [0, 0, 0]),
    colors: colors([
      { name: "Red", bg: "#c62828", accent: "#ff8a80", slogan: "Bewährt und zuverlässig", classification: null },
    ]),
  },
  {
    name: "Cross",
    slug: "x-kappe-cross",
    description: "Rogallo-Rettungsgerät mit extrem schneller Öffnungszeit und minimalem Höhenverlust. Steuerbare Kappe für gezielte Landung.",
    category: "rettungsgeraete",
    classification: null,
    use_case: "Rettung",
    website_url: "https://www.swing.de/rettungsgeraete/cross.html",
    is_active: true,
    image: () => productSvg("CROSS", "#e65100", "#ffffff"),
    tech_specs: { Typ: "Rogallo-Rettungsgerät", Sinkrate: "< 4.5 m/s", Zertifizierung: "EN 12491" },
    sizes: sizes("CROSS", ["S", "M", "L"], [25, 30, 20], [0, 0, 0]),
    colors: colors([
      { name: "Orange", bg: "#e65100", accent: "#ffab40", slogan: "Extrem schnelle Öffnungszeit", classification: null },
    ]),
  },
];

async function seed() {
  console.log("Seeding categories...");
  const { data: cats, error: catError } = await supabase
    .from("categories")
    .upsert(CATEGORIES, { onConflict: "slug" })
    .select();

  if (catError) {
    console.error("Category error:", catError);
    return;
  }

  const catMap = Object.fromEntries(cats!.map((c) => [c.slug, c.id]));

  console.log("Clearing old data...");
  await supabase.from("product_colors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("product_sizes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (const p of PRODUCTS) {
    console.log(`  ${p.name}...`);
    const { category, sizes, colors, image, ...productData } = p;

    const { data: product, error: prodError } = await supabase
      .from("products")
      .insert({
        ...productData,
        category_id: catMap[category],
        images: [image()],
      })
      .select()
      .single();

    if (prodError) {
      console.error(`Product error (${p.name}):`, prodError);
      continue;
    }

    if (sizes.length > 0) {
      const { error: sizeError } = await supabase
        .from("product_sizes")
        .insert(sizes.map((s) => ({ ...s, product_id: product.id })));
      if (sizeError) console.error(`Size error (${p.name}):`, sizeError);
    }

    if (colors.length > 0) {
      const { error: colorError } = await supabase
        .from("product_colors")
        .insert(
          colors.map((c) => ({
            color_name: c.color_name,
            slogan: c.slogan,
            classification: c.classification,
            color_image_url: c.color_image_url(),
            sort_order: c.sort_order,
            product_id: product.id,
          }))
        );
      if (colorError) console.error(`Color error (${p.name}):`, colorError);
    }
  }

  console.log(`\nSeeding complete! ${PRODUCTS.length} products created.`);
}

seed();
