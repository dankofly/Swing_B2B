/**
 * Gemini prompts for the PDF price list pipeline.
 * - buildExtractionPrompt: Step 1 — extract from PDF text (kept for reference/future use)
 * - buildFallbackMatchingPrompt: LLM fallback for items that didn't match via canonical keys
 */

/** Build the extraction prompt — Gemini only extracts, no matching. */
export function buildExtractionPrompt(pdfText: string): string {
  return `Du erhältst eine PDF-Preisliste.

ZIEL:
Extrahiere alle Produkte mit ihren Preisen als sauberes JSON.

REGELN:
1. Erkenne alle Produkte automatisch, keine vordefinierten Namen.
2. Wenn mehrere Größen unterschiedliche Preise haben → eigene Einträge pro Größe.
3. Wenn ein Produkt nur eine Größe/Variante hat (z.B. "Einheitsgröße") → einen Eintrag mit dieser Variante.
4. Extrahiere exakt:
   - product (Produktname, z.B. "Mirage 2 RS")
   - size (Größe/Variante, z.B. "S", "M", "L", "Einheitsgröße", "130L")
   - uvp_gross (NUMBER oder null)
   - dealer_net (NUMBER oder null)
5. Preisformat:
   - Keine € Zeichen
   - Keine Tausenderpunkte
   - Dezimalpunkt verwenden
   - Beispiel: 2.190,00 € → 2190.00
6. Ignoriere:
   - UVP netto, Basispreis, Rabatte, Prozentwerte
   - Positionen mit "auf Anfrage" → komplett weglassen
7. Keine Duplikate
8. Wenn Folgezeilen nur Größen und Preise enthalten, gehören sie zum zuletzt aktiven Produktnamen.
9. Extrahiere keine Fußnoten, Hinweise, Legenden oder Fließtext als Produkte.
10. Extrahiere nur tatsächlich kaufbare Positionen.

OUTPUT:
Gib ausschließlich valides JSON zurück. Keine Erklärungen.

[
  {
    "product": "...",
    "size": "...",
    "uvp_gross": 2190.00,
    "dealer_net": 1177.82
  }
]

Hier ist der extrahierte Text der Händlerpreisliste:

${pdfText}`;
}

/** Build the Gemini fallback prompt for items that couldn't be matched by canonical key.
 *
 * Given a list of unmatched PDF items and the portal product catalog,
 * Gemini tries to find the correct canonical_key for each item.
 */
export function buildFallbackMatchingPrompt(
  unmatchedItems: Array<{ product: string; size: string }>,
  portalProducts: Array<{ canonical_key: string | null; model: string; size: string }>
): string {
  const itemsList = unmatchedItems
    .map((u, i) => `  ${i + 1}. product="${u.product}", size="${u.size}"`)
    .join("\n");

  const portalList = portalProducts
    .filter((p) => p.canonical_key)
    .map((p) => `  "${p.canonical_key}" → ${p.model} / ${p.size}`)
    .join("\n");

  return `Du bist ein Zuordnungs-Assistent für Paragleiter-Produkte.

AUFGABE:
Ordne die folgenden PDF-Produkte den Portal-Produkten zu.
Die PDF-Namen können Tippfehler, abweichende Schreibweisen oder fehlende Suffixe haben.

NICHT ZUGEORDNETE PDF-PRODUKTE:
${itemsList}

VERFÜGBARE PORTAL-PRODUKTE (canonical_key → Modell / Größe):
${portalList}

REGELN:
1. Finde für jedes PDF-Produkt den passenden canonical_key aus der Liste
2. Wenn kein passendes Produkt existiert → nicht zuordnen (weglassen)
3. Beachte: "RS", "D-Lite" etc. können fehlen oder abweichen
4. Größen müssen übereinstimmen (S≠M, 8.5≠9.5)

OUTPUT:
Gib ausschließlich valides JSON zurück. Keine Erklärungen.
Nur Zuordnungen die du sicher bist.

[
  {
    "pdf_product": "...",
    "pdf_size": "...",
    "canonical_key": "..."
  }
]`;
}
