/**
 * Gemini prompt for PDF price list extraction (Step 1 only).
 * Matching against portal products is done in JavaScript (Step 2).
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
