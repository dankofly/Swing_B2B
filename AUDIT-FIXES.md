# SWING B2B Portal — Audit Fixes
## Stand: 20. März 2026

Ergebnis des Security/Performance/Code-Quality Audits.
Bitte alle CRITICAL und HIGH Fixes vor dem Kundenrelease umsetzen.

---

## CRITICAL (vor Release Pflicht)

### 1. Auth-Guard auf `/api/admin-briefing`
**Datei:** `src/app/api/admin-briefing/route.ts`
**Problem:** Kein Auth-Check. Jeder kann POST-Requests senden und Gemini-API-Kosten verursachen.
**Fix:** Auth-Guard wie bei allen anderen Admin-API-Routes hinzufuegen:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
if (!profile || !["superadmin", "admin"].includes(profile.role)) {
  return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
}
```

### 2. Rate Limiting auf `/api/notify-registration`
**Datei:** `src/app/api/notify-registration/route.ts`
**Problem:** Keine Auth, kein Rate Limit. E-Mail-Flooding an info@swing.de moeglich.
**Fix:** In-Memory Rate Limiter (IP-basiert, max 3 Requests/Minute):
```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}
```
Im Handler: `const ip = request.headers.get("x-forwarded-for") || "unknown";`

### 3. Mindest-Tests fuer kritische Business-Logik
**Problem:** Zero Test Coverage. Keine einzige Test-Datei im Projekt.
**Fix:** Mindestens Tests fuer:
- `src/lib/stock-csv-parser.ts` — CSV-Parsing + Aggregation
- `src/lib/canonical-keys.ts` — Key-Normalisierung + Matching
- Cart-Logik in `src/lib/cart.tsx` — Add/Remove/Update/Clear
- `submitInquiry` in `src/lib/actions/inquiries.ts` — Input-Validierung

Setup: Vitest ist am schnellsten:
```bash
npm install -D vitest
```
`package.json` Script: `"test": "vitest run"`

---

## HIGH (zeitnah nach Release)

### 4. `ignoreDuringBuilds` deaktivieren
**Datei:** `next.config.ts`
**Problem:** ESLint + TypeScript Errors werden beim Build ignoriert. Type-Fehler und Dead Code landen in Production.
**Fix:**
```typescript
eslint: { ignoreDuringBuilds: false },
typescript: { ignoreBuildErrors: false },
```
Dann `npm run build` ausfuehren und alle Fehler fixen (hauptsaechlich `any` Types und unused Imports).

### 5. Gemini SDK statt raw fetch in parse-pricelist
**Datei:** `src/app/api/parse-pricelist/route.ts` (Zeile 72-85)
**Problem:** API-Key wird als URL-Query-Parameter gesendet (`?key=${process.env.GEMINI_API_KEY}`). Kann in Server-Logs auftauchen.
**Fix:** `@google/generative-ai` SDK nutzen (ist bereits als Dependency installiert):
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json", maxOutputTokens: 16384 } });
const result = await model.generateContent([{ text: extractionPrompt }]);
const responseText = result.response.text().trim();
```
Dasselbe fuer den Fallback-Call (Zeile 213-226).

### 6. Rate Limiting auf alle Gemini-API-Routes
**Dateien:**
- `src/app/api/parse-pricelist/route.ts`
- `src/app/api/parse-stock-csv/route.ts`
- `src/app/api/translate-i18n/route.ts`
- `src/app/api/translate-product/route.ts`
- `src/app/api/translate-categories/route.ts`
**Problem:** Authentifizierte Admins koennen unbegrenzt Gemini-Calls triggern.
**Fix:** Shared Rate Limiter Utility (z.B. `src/lib/rate-limit.ts`), max 10 Requests/Minute pro User.

### 7. CSP-Header in netlify.toml
**Datei:** `netlify.toml`
**Problem:** Gute Security Headers vorhanden, aber kein Content-Security-Policy.
**Fix:** Unter `[[headers]]` fuer `/*` hinzufuegen:
```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://yhtbipsedsqmqxecdslu.supabase.co; connect-src 'self' https://yhtbipsedsqmqxecdslu.supabase.co https://generativelanguage.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'"
```
Nach Deploy testen ob alles funktioniert, ggf. Domains ergaenzen.

### 8. UUID-Validierung in fehlenden Server Actions
**Dateien:**
- `src/lib/actions/company-notes.ts` — `updateCompanyNotes(id)` fehlt UUID-Check
- `src/lib/actions/stock.ts` — `updateColorSizeStock(productId)` fehlt UUID-Check
- `src/lib/actions/news.ts` — `updateNews(id)`, `toggleNewsActive(id)`, `deleteNews(id)`, `reorderNews(ids)` fehlen UUID-Checks
**Fix:** Am Anfang jeder Funktion:
```typescript
if (!isValidUUID(id)) throw new Error("Ungueltige ID");
```

### 9. `inviteUser` sendet keine Einladungs-Email
**Datei:** `src/lib/actions/profile.ts` (Zeile 201-290)
**Problem:** `inviteUser()` generiert einen Magiclink via `admin.auth.admin.generateLink({ type: "magiclink", email })`, aber der generierte Link wird **nie verwendet** und **keine Email wird gesendet**. Eingeladene Admins/User erhalten keinen Zugangslink.
**Vergleich:** `inviteCustomer()` in `src/lib/actions/customers.ts` (Zeile 179-194) macht es richtig: generiert Recovery-Link UND sendet ihn via `buildInvitationEmail`.
**Fix:** Nach dem `generateLink`-Call die branded Email senden, analog zu `inviteCustomer`:
```typescript
const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
  type: "magiclink",
  email,
});
if (linkError || !linkData?.properties?.hashed_token) {
  return { success: false, error: "Link konnte nicht generiert werden" };
}

const confirmUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${linkData.properties.hashed_token}&type=magiclink&redirect_to=${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

const emailHtml = buildInvitationEmail(confirmUrl);
await resend.emails.send({
  from: "SWING B2B <noreply@swing.de>",
  to: email,
  subject: "Einladung zum SWING B2B Portal",
  html: emailHtml,
});
```

### 10. Sequenziellen DB-Waterfall in Katalog beheben
**Datei:** `src/app/(katalog)/katalog/page.tsx` (Zeile 75-89)
**Problem:** Profile-Fetch blockiert nach User-Auth statt parallel.
**Fix:** User + Categories + Profile in einem `Promise.all`:
```typescript
const [{ data: { user } }, { data: categories }, supabase] = await Promise.all([...]);
// Profile-Fetch nur wenn user vorhanden, aber parallel mit Products-Query starten
```

---

## MEDIUM (nach Release, kontinuierliche Verbesserung)

### 11. Supabase Types auto-generieren
```bash
npx supabase gen types typescript --project-id yhtbipsedsqmqxecdslu > src/lib/database.types.ts
```
Dann alle manuellen `as unknown as` Casts durch korrekte Typisierung ersetzen (27 Stellen in 4 Dateien).

### 12. `any` Types eliminieren
13 Vorkommen in 8 Dateien. Hauptsaechlich:
- `src/app/(admin)/admin/page.tsx` (2x)
- `src/app/(katalog)/katalog/[slug]/page.tsx` (5x)
- `src/app/api/admin-briefing/route.ts` (1x)
- `src/lib/actions/inquiries.ts` (1x)

### 13. Console Statements bereinigen
47 `console.log/warn/error` in 23 Dateien. Optionen:
- Fuer Production: `console.error` nur bei echten Fehlern behalten
- Besser: Logging-Utility mit Log-Levels (`src/lib/logger.ts`)

### 14. Error-Handling konsistent machen
Server Actions mischen zwei Patterns:
- `return { success: false, error: "..." }` (customers, profile, news)
- `throw new Error("...")` (inquiries, products, stock)
Eines waehlen und konsistent anwenden.

### 15. Caching fuer Katalog-Daten
**Datei:** `src/app/(katalog)/katalog/page.tsx`
```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```
Oder `unstable_cache` fuer die Kategorie-Query (aendert sich selten).

### 16. `userScalable: false` entfernen
**Datei:** `src/app/layout.tsx` (Zeile 45)
```typescript
// VORHER:
userScalable: false,
// NACHHER: Zeile entfernen (Accessibility: Zoom erlauben)
```

---

## Checkliste

- [x] SEC-1: Auth-Guard `/api/admin-briefing` (CRITICAL) ✅
- [x] SEC-2: Rate Limit `/api/notify-registration` (CRITICAL) ✅
- [ ] CQ-1: Mindest-Tests (CRITICAL)
- [x] SEC-4: `ignoreDuringBuilds: false` + Build-Errors fixen (HIGH) ✅
- [x] SEC-6: Gemini SDK statt raw fetch (HIGH) ✅
- [x] SEC-5: Rate Limiting Gemini-Routes (HIGH) ✅
- [x] SEC-7: CSP-Header (HIGH) ✅
- [x] SEC-9: UUID-Validierung (HIGH) ✅
- [x] SEC-10: `inviteUser` sendet keine Email (HIGH) ✅
- [ ] PERF-2: Katalog DB-Waterfall (HIGH)
- [ ] CQ-4: Supabase Types auto-generieren (MEDIUM)
- [ ] CQ-2: `any` Types eliminieren (MEDIUM)
- [ ] CQ-3: Console Statements (MEDIUM)
- [ ] CQ-5: Error-Handling konsistent (MEDIUM)
- [ ] PERF-6: Katalog Caching (MEDIUM)
- [x] CQ-7: userScalable entfernen (MEDIUM) ✅
