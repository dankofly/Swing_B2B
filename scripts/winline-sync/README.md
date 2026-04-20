# WinLine → B2B Portal — Täglicher Lagerstand-Sync

Bidirektional ist das nicht — der Sync liest einen **CSV-Export aus WinLine FAKT** und schreibt die Bestände ins B2B-Portal. Ein WinLine-Zusatzmodul (EXIM, BATCHBELEG, WEBEdition) ist **nicht** nötig, solange WinLine die Datei täglich selbst schreiben kann.

## Architektur in drei Bildern

```
04:00 auf WinLine-Rechner       04:15                     04:15 Cloud
                                                          
WinLine FAKT                    Windows-Aufgabenpl.       Netlify (Next.js)
  schreibt CSV                    startet PowerShell        /api/sync-stock
  nach C:\WinLine-Exports\  →     liest neueste CSV     →   verifiziert Token
                                  POST mit Bearer-Token     parst + matched
                                                            Update product_sizes
                                  loggt Antwort JSON   ←    JSON-Antwort
                                  nach sync-logs\
```

Keine geöffneten Ports im Firmennetz, keine offenen DB-Zugänge, kein Tagfahrt-Shop gebrochen wenn die Cloud mal offline ist.

## Einmalige Einrichtung

### 1. Auf der Server-Seite (Netlify + Supabase)

Neuen Env-Var setzen (per Netlify Dashboard → Site Settings → Environment Variables):

```
STOCK_SYNC_TOKEN = <64-Hex-Token>
```

Token generieren:
```bash
openssl rand -hex 32
# z.B. a3f1…  (64 hex chars)
```

Danach Re-Deploy triggern, damit der neue Endpoint `/api/sync-stock` mit dem Token läuft.

**Sanity-Check:**
```bash
curl -i -H "Authorization: Bearer WRONG" https://swingparagliders.pro/api/sync-stock
# → 401 {"error":"invalid token"}

curl -i -H "Authorization: Bearer $STOCK_SYNC_TOKEN" \
     -H "Content-Type: text/csv" \
     --data-binary "Artikel;Bezeichnung;Lagerstand" \
     https://swingparagliders.pro/api/sync-stock
# → 400 {"error":"empty or too short CSV"}   (ok — Token war gültig)
```

### 2. Auf dem WinLine-Rechner (Windows)

#### a) WinLine so konfigurieren dass die Bestandsliste automatisch rausfällt

Zwei Varianten (abhängig von Lizenz):

**Variante A (WinLine mit START-Scheduler):**
- In WinLine → Auswertungen → Bestandsliste → Druckziel „Datei (CSV)" → Pfad `C:\WinLine-Exports\bestand.csv`
- Speicher-Button → Vorlage speichern
- WinLine START → Scheduler → neue Aufgabe: „Bestandsliste" mit Vorlage auswählen → täglich um 04:00

**Variante B (ohne Scheduler — Fallback):**
- Bis eine Automation möglich ist: der Admin führt den Export manuell täglich aus, der Task-Runner (nächster Schritt) pickt den neuesten auf. Nicht schön, funktioniert aber.

#### b) PowerShell-Skript einrichten

1. Ordner anlegen: `C:\WinLine-Exports\`
2. [`Sync-Stock.ps1`](Sync-Stock.ps1) hineinkopieren
3. Token als User-Environment-Variable setzen:
   - System → Erweiterte Systemeinstellungen → Umgebungsvariablen → Benutzervariablen → Neu
   - Name: `SWING_STOCK_SYNC_TOKEN`, Wert: (derselbe Token wie in Netlify)
4. Ersttest manuell ausführen:
   ```powershell
   cd C:\WinLine-Exports
   .\Sync-Stock.ps1
   ```
   Output sollte enden mit z. B.
   ```
   OK — synced=142, unmatched=3, rows=387, took=1240ms
   ```

#### c) Scheduled Task importieren

1. Aufgabenplanung öffnen (`taskschd.msc`)
2. Aktion → Aufgabe importieren → [`SyncStock-Task.xml`](SyncStock-Task.xml) wählen
3. Anpassen:
   - Reiter „Allgemein": Benutzer (am besten ein Service-Account) → „Unabhängig von der Benutzeranmeldung ausführen" aktivieren → Passwort eingeben
   - Reiter „Trigger": Zeit prüfen (Default 04:15 — muss NACH WinLine-Export 04:00 sein)
   - Reiter „Aktionen": falls Skript woanders liegt, Pfad anpassen

4. Test: Aufgabe manuell ausführen („Ausführen" rechtsklick) → Log unter `C:\WinLine-Exports\sync-logs\` prüfen

### 3. Monitoring

Der Task schreibt pro Lauf eine JSON-Datei nach `sync-logs\YYYY-MM-DD_HHMMSS.json`:

```json
{
  "timestamp": "2026-04-21T04:15:08.123Z",
  "ok": true,
  "file": "bestand_2026-04-21.csv",
  "file_size": 123456,
  "response": {
    "success": true,
    "synced": 142,
    "unchanged": 38,
    "unmatched": 3,
    "update_errors": 0,
    "csv_rows": 387,
    "filtered_items": 183,
    "unmatched_items": [
      { "model": "MirageNEW", "design": null, "size": "XL", "stock": 2, "match_key": "...|null|xl" }
    ],
    "duration_ms": 1240
  }
}
```

**Empfohlener wöchentlicher Check:** `unmatched_items` durchsehen. Wenn dort immer dieselben Modelle auftauchen → entweder fehlt das Produkt im B2B-Katalog, oder der Modellname weicht zu stark ab.

**Alert-Empfehlung:** Netlify-Deploy-Notification einrichten die eine Mail schickt wenn `/api/sync-stock` einen 5xx zurückgibt. Alternativ: nach `"ok": false` in den sync-logs greppen (Log-Shipping zu z. B. BetterStack).

## Troubleshooting

| Symptom | Ursache | Fix |
|---|---|---|
| `401 invalid token` | Token in Netlify ≠ Token auf Client | Abgleichen, beide identisch setzen |
| `401 missing bearer token` | Authorization-Header fehlt | Skript-Parameter prüfen, Env-Var `SWING_STOCK_SYNC_TOKEN` |
| `413 file too large` | CSV > 50 MB | unrealistisch für B2B-Bestand, WinLine-Filter prüfen |
| `400 empty or too short CSV` | Datei leer oder < 20 Bytes | WinLine-Export funktioniert nicht, Pfad / Vorlage prüfen |
| `500` im Response | Serverseitiger Fehler | Netlify Logs prüfen (Dashboard → Deploys → Function Logs) |
| Task läuft aber `unmatched=total` | Produkt-Namen in WinLine anders als im Portal | canonical-keys in [src/lib/canonical-keys.ts](../../src/lib/canonical-keys.ts) prüfen / erweitern |

## Sicherheits-Hinweise

- `STOCK_SYNC_TOKEN` ist ein **shared secret**. Wer ihn hat, kann alle Lagerstände überschreiben.
- Verwende keine Test-/Dev-Token in Produktion — neu generieren bei jeder Exposition.
- Windows-Scheduled-Task-Credentials sind im SYSTEM verschlüsselt, aber kopierbar für lokale Admins. Service-Account mit minimalen Rechten nutzen.
- Bei Token-Kompromittierung: neuen Token in Netlify setzen → Re-Deploy → alter wird automatisch ungültig → Client-Env ebenfalls aktualisieren.

## FAQ

**Brauche ich WinLine EXIM?**
Nein. EXIM wäre eleganter (Export als Vorlage speicherbar, besser scriptbar), aber jede WinLine-FAKT-Installation kann die Bestandsliste als CSV exportieren. Das reicht für diesen Sync.

**Kann der Sync die Produkte im B2B-Portal anlegen?**
Nein — aktuell werden nur bestehende `product_sizes` im Portal aktualisiert. Unbekannte Artikel landen in `unmatched_items`. Produkte müssen weiterhin manuell im Admin-Panel gepflegt werden.

**Kann das Skript auch intraday (z. B. alle 2 h) laufen?**
Technisch ja — einfach im Task-Trigger „Wiederholen alle 2 Stunden" aktivieren. Voraussetzung: WinLine schreibt den CSV auch mindestens so oft. Für normalen B2B-Handel ist 1×/Tag aber ausreichend.

**Was passiert bei Netzausfall?**
Task schlägt mit `ok: false` und HTTP-Fehler fehl, 2× Retry nach 10 Min. (im Task-XML konfiguriert). Am nächsten Tag wird die neueste CSV genommen — die zwischenzeitlichen Stock-Änderungen gehen verloren außer sie stehen nicht auch im neueren Export (normal der Fall).
