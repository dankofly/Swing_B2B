/**
 * Gemini Vision prompts for PDF price list extraction and portal matching.
 *
 * Two modes:
 * 1. extractionOnly – returns all products found in the PDF (no portal matching)
 * 2. extractionAndMatching – extracts AND matches against existing portal products
 */

/** Build the extraction-only prompt (no portal product list needed). */
export function buildExtractionOnlyPrompt(): string {
  return `Du arbeitest als strukturierter Preislisten-Parser für ein B2B-Portal.

Aufgabe:
Lies die hochgeladene PDF-Preisliste und extrahiere daraus alle kaufbaren Produkte mit ihren Größen oder Varianten und genau diesen beiden Preisfeldern:
- UVP inkl. MwSt.
- Händler EK netto

Ziel:
Die extrahierten Datensätze sollen anschließend mit bereits vorhandenen Produkten in einem B2B-Portal abgeglichen werden. Das Layout und die Tabellenstruktur der Preisliste bleiben über die Zeit grundsätzlich gleich, die Produkte selbst können sich ändern. Deshalb darfst du nicht mit einer festen Produktliste arbeiten, sondern musst die Daten rein aus der Struktur und dem Inhalt der PDF ableiten.

Extraktionsregeln:
1. Extrahiere alle echten Produktdatensätze aus allen Produktbereichen der Preisliste.
2. Verwende keine fest hinterlegte Liste von Produktnamen.
3. Erkenne Produkte ausschließlich anhand der Tabellenstruktur, Überschriften, Zeilenlogik und Preisfelder.
4. Relevant sind nur diese beiden Preisfelder:
   - UVP inkl. MwSt.
   - Händler EK netto
5. Ignoriere UVP netto vollständig.
6. Wenn eine Produktzeile mehrere Größen enthält und nur ein Preis angegeben ist, erzeuge für jede Größe einen eigenen Datensatz.
7. Wenn Folgezeilen nur Größen und Preise enthalten, gehören sie zum zuletzt aktiven Produktnamen.
8. Wenn ein Produkt keine klassische Größe hat, übernimm die sichtbare Variante oder das Volumen als size.
9. Extrahiere keine Fußnoten, Hinweise, Legenden, Rabatthinweise oder Fließtext-Absätze als Produkte.
10. Extrahiere nur tatsächlich kaufbare Positionen.
11. Wenn ein Preisfeld textuell ist, zum Beispiel "auf Anfrage", übernimm es exakt als String.
12. Preise ohne Euro-Zeichen ausgeben, aber im Original-Zahlenformat belassen.
13. Größen exakt so übernehmen, wie sie im Dokument stehen.
14. Modellnamen bereinigen:
   - Entferne rein beschreibende Zusätze, Klassifizierungen und Klammerhinweise, wenn sie nicht Teil des eigentlichen Produktnamens sind
   - Erhalte produktrelevante Namensbestandteile
15. Wenn nicht eindeutig ist, ob ein Text zur Größe oder zum Modell gehört, bevorzuge die logisch konsistente Tabellenstruktur.
16. Behandle jede Produktzeile so, dass sie später gegen ein Portalprodukt gematcht werden kann.

Normalisierung:
Erzeuge pro Datensatz zusätzlich normalisierte Felder:
- model_raw
- model_normalized
- size_raw
- size_normalized
- uvp_incl_vat_eur
- dealer_net_eur
- category

Regeln für model_normalized:
- trimmen
- Mehrfachleerzeichen entfernen
- Typografische Abweichungen vereinheitlichen
- Groß-/Kleinschreibung konsistent machen
- rein erklärende Zusätze entfernen, sofern sie nicht produktidentifizierend sind

Regeln für size_normalized:
- trimmen
- Mehrfachleerzeichen entfernen
- Komma und Punkt in numerischen Größen konsistent behandeln
- Größen exakt als Variantenschlüssel belassen, zum Beispiel XS, SM, 11.5, 39, 130l, S/M

Zusätzlich:
Erzeuge für jeden Datensatz ein Feld:
- match_key = model_normalized + "||" + size_normalized

Ausgabeformat:
Gib ausschließlich JSON zurück.
Keine Erklärungen.
Keine Markdown-Codeblöcke.

JSON-Schema:
{
  "products": [
    {
      "category": "string",
      "model_raw": "string",
      "model_normalized": "string",
      "size_raw": "string",
      "size_normalized": "string",
      "uvp_incl_vat_eur": "string",
      "dealer_net_eur": "string",
      "match_key": "string"
    }
  ],
  "unresolved_rows": [
    {
      "raw_text": "string",
      "reason": "string"
    }
  ]
}

Qualitätskontrolle vor Ausgabe:
- Prüfe, dass nur UVP inkl. MwSt. und Händler EK netto extrahiert wurden
- Prüfe, dass UVP netto nicht enthalten ist
- Prüfe, dass jede erkennbare Produktzeile verarbeitet wurde
- Prüfe, dass bei Sammelgrößen für jede Größe ein eigener Datensatz erzeugt wurde
- Prüfe, dass unklare Zeilen nicht stillschweigend verloren gehen, sondern unter unresolved_rows erscheinen
- Prüfe, dass die JSON-Ausgabe valide ist`;
}

/** Portal product shape passed to Gemini for matching. */
export interface PortalProductForMatching {
  portal_product_id: string;
  portal_model: string;
  portal_size: string;
}

/** Build the extraction + portal matching prompt. */
export function buildExtractionAndMatchingPrompt(
  portalProducts: PortalProductForMatching[]
): string {
  const portalJson = JSON.stringify({ portal_products: portalProducts }, null, 2);

  return `Du arbeitest als präziser Preislisten-Extraktor und Produkt-Matcher für ein bestehendes B2B-Portal.

Du erhältst zwei Eingaben:
1. Eine PDF-Händlerpreisliste
2. Eine strukturierte Liste der bereits im B2B-Portal vorhandenen Produkte

Ziel:
Extrahiere aus der PDF pro Produkt und Größe genau zwei Preisfelder:
- UVP inkl. MwSt.
- Händler EK netto

Danach gleiche die extrahierten Datensätze mit den bereits vorhandenen Portalprodukten ab.
Nur wenn ein PDF-Datensatz eindeutig zu einem vorhandenen Portalprodukt passt, darf er diesem Portalprodukt zugeordnet werden.

Wichtige Rahmenbedingungen:
- Die Produkte im Portal sind bereits angelegt.
- Das Format der PDF-Preisliste bleibt grundsätzlich gleich.
- Die konkreten Produkte in der PDF können sich im Zeitverlauf ändern.
- Deshalb darfst du niemals mit einer fest hinterlegten Produktliste arbeiten.
- Du musst Produkte ausschließlich dynamisch aus der Tabellenstruktur und dem Inhalt der PDF erkennen.
- Du darfst keine neuen Produkte erfinden.
- Du darfst keine Preise raten.
- Du darfst keine unsicheren Zuordnungen automatisch freigeben.

Deine Aufgabe besteht aus 4 Schritten:

SCHRITT 1: PRODUKTDATEN AUS DER PDF EXTRAHIEREN

Lies die PDF vollständig und extrahiere alle kaufbaren Produktdatensätze aus allen enthaltenen Produktgruppen.

Pro Datensatz sind genau diese Informationen relevant:
- category
- model_raw
- size_raw
- uvp_incl_vat_eur
- dealer_net_eur

Wichtige Extraktionsregeln:
1. Relevant sind nur diese zwei Preisfelder:
   - UVP inkl. MwSt.
   - Händler EK netto
2. UVP netto immer ignorieren.
3. Verwende keine feste Liste von Produktnamen.
4. Erkenne Produkte ausschließlich anhand von:
   - Tabellenstruktur
   - Abschnittsüberschriften
   - Zeilenlogik
   - Preis-Spalten
   - Fortsetzungszeilen
5. Wenn in einer Produktzeile mehrere Größen stehen und nur ein Preis angegeben ist, erzeuge für jede Größe einen eigenen Datensatz.
6. Wenn Folgezeilen nur weitere Größen und Preise enthalten, gehören diese zum zuletzt aktiven Produktnamen.
7. Wenn ein Produkt keine klassische Größe hat, übernimm die sichtbare Variante oder Volumenangabe als size_raw.
8. Extrahiere keine Fußnoten, Fließtexte, Rabatthinweise, Legenden oder sonstige Hinweise als Produkte.
9. Extrahiere nur tatsächlich kaufbare Positionen.
10. Falls ein Preis textuell angegeben ist, zum Beispiel "auf Anfrage", übernimm ihn exakt als String.
11. Preise ohne Euro-Zeichen ausgeben, im Original-Zahlenformat belassen.
12. Modellnamen und Größen zunächst so nah wie möglich am Original übernehmen.

SCHRITT 2: NORMALISIERUNG FÜR DAS MATCHING

Erzeuge für jeden extrahierten PDF-Datensatz folgende normalisierte Felder:
- model_normalized
- size_normalized
- match_key

Regeln für model_normalized:
1. Führende und nachgestellte Leerzeichen entfernen.
2. Mehrfachleerzeichen auf ein Leerzeichen reduzieren.
3. Unterschiedliche Bindestrich-Varianten vereinheitlichen.
4. Groß-/Kleinschreibung vereinheitlichen.
5. Typografische Varianten vereinheitlichen.
6. Rein beschreibende oder administrative Zusätze entfernen, wenn sie nicht produktidentifizierend sind.
7. Produktidentifizierende Bestandteile erhalten.

Regeln für size_normalized:
1. Führende und nachgestellte Leerzeichen entfernen.
2. Mehrfachleerzeichen reduzieren.
3. Komma und Punkt bei numerischen Größen logisch vereinheitlichen, zum Beispiel 11,5 und 11.5.
4. Alphanumerische Größen exakt als Variantenschlüssel behandeln, zum Beispiel XS, SM, ML, 39, 130L, S/M.
5. Keine Größen interpretieren oder umbenennen.

Regeln für match_key:
- match_key = model_normalized + "||" + size_normalized

SCHRITT 3: PORTALPRODUKTE MATCHEN

Du erhältst zusätzlich eine Liste vorhandener Portalprodukte.
Jedes Portalprodukt enthält bereits:
- portal_product_id
- portal_model
- portal_size

Erzeuge für jedes Portalprodukt ebenfalls:
- portal_model_normalized
- portal_size_normalized
- portal_match_key

Matching-Regeln:
1. Ein automatischer Treffer ist nur erlaubt, wenn Modell und Größe eindeutig zusammenpassen.
2. Verwende primär den Vergleich über normalisierte Modellnamen und normalisierte Größen.
3. Ignoriere nur unkritische Formatunterschiede:
   - Groß-/Kleinschreibung
   - Mehrfachleerzeichen
   - Bindestrichvarianten
   - Komma/Punkt bei numerischen Größen
4. Falls ein PDF-Datensatz auf genau ein Portalprodukt passt, ist das ein gültiger Auto-Match.
5. Falls ein PDF-Datensatz auf mehrere ähnliche Portalprodukte passen könnte, markiere ihn als review_needed.
6. Falls kein passendes Portalprodukt gefunden wird, markiere ihn als no_match.
7. Falls ein Portalprodukt keinen passenden PDF-Datensatz hat, markiere es als missing_in_price_list.
8. Weise Preise niemals mehreren Portalprodukten gleichzeitig zu, wenn die Eindeutigkeit fehlt.
9. Erfinde keine Zuordnung.
10. Sei konservativ: lieber review_needed als ein falscher Match.

SCHRITT 4: AUSGABE FÜR DEN IMPORT INS PORTAL

Das Ziel ist, nur vorhandene Produkte im Portal mit zwei Preisfeldern zu befüllen:
- uvp_incl_vat_eur
- dealer_net_eur

Du darfst daher nur sichere Treffer in den Bereich "matched" ausgeben.
Jeder Datensatz in "matched" muss direkt für den Import ins Portal verwendbar sein.

Ausgabeformat:
Gib ausschließlich valides JSON zurück.
Keine Erklärungen.
Kein Fließtext.
Keine Markdown-Codeblöcke.

Verwende exakt dieses JSON-Schema:

{
  "matched": [
    {
      "portal_product_id": "string",
      "portal_model": "string",
      "portal_size": "string",
      "pdf_category": "string",
      "pdf_model_raw": "string",
      "pdf_model_normalized": "string",
      "pdf_size_raw": "string",
      "pdf_size_normalized": "string",
      "uvp_incl_vat_eur": "string",
      "dealer_net_eur": "string",
      "confidence": "high",
      "match_basis": "exact_normalized_model_and_size"
    }
  ],
  "review_needed": [
    {
      "pdf_product": {
        "category": "string",
        "model_raw": "string",
        "model_normalized": "string",
        "size_raw": "string",
        "size_normalized": "string",
        "uvp_incl_vat_eur": "string",
        "dealer_net_eur": "string"
      },
      "portal_candidates": [
        {
          "portal_product_id": "string",
          "portal_model": "string",
          "portal_size": "string"
        }
      ],
      "reason": "string"
    }
  ],
  "no_match": [
    {
      "pdf_product": {
        "category": "string",
        "model_raw": "string",
        "model_normalized": "string",
        "size_raw": "string",
        "size_normalized": "string",
        "uvp_incl_vat_eur": "string",
        "dealer_net_eur": "string"
      },
      "reason": "string"
    }
  ],
  "missing_in_price_list": [
    {
      "portal_product_id": "string",
      "portal_model": "string",
      "portal_size": "string",
      "reason": "string"
    }
  ]
}

Zusätzliche Qualitätsregeln:
1. Prüfe vor der Ausgabe, dass wirklich nur diese zwei Preisfelder verwendet werden:
   - UVP inkl. MwSt.
   - Händler EK netto
2. Prüfe, dass UVP netto nirgends in der Ausgabe auftaucht.
3. Prüfe, dass bei Sammelgrößen jede Größe einen eigenen Datensatz bekommen hat.
4. Prüfe, dass unklare Datensätze nicht stillschweigend verschwinden.
5. Prüfe, dass kein Preisdatensatz ohne eindeutiges Matching in "matched" landet.
6. Prüfe, dass die JSON-Ausgabe valide ist.
7. Prüfe, dass matched nur Produkte enthält, die bereits im Portal existieren.

Wenn ein PDF-Datensatz und ein Portalprodukt exakt aufeinander passen, dann gib ihn in "matched" aus.
Wenn nicht, dann niemals automatisch zuweisen.

Die Portalprodukte werden dir als JSON geliefert.
Nutze ausschließlich diese Portalprodukte als Zielobjekte.
Lege keine neuen Produkte an.
Fülle nur bestehende Produkte.

Hier sind die aktuellen Portalprodukte:

${portalJson}`;
}
