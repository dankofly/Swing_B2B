#!/usr/bin/env node
/**
 * Renders a sample "Neue Bestellanfrage" email to a local HTML file
 * so it can be opened in a browser for visual preview.
 *
 * Usage:
 *   node scripts/preview-inquiry-email.mjs
 */

import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Env vars the template reads — stub for preview
process.env.NEXT_PUBLIC_SITE_URL = "https://swingparagliders.pro";

const { buildNewInquiryEmail } = await import(
  new URL("../src/lib/email.ts", import.meta.url).href
);

const html = buildNewInquiryEmail(
  "a3f8b2c1-9d4e-4f7a-8b2c-1d4e5f6a7b8c", // inquiryId
  "Gleitschirmschule Innsbruck GmbH",     // companyName
  "Max Mustermann",                        // contactName
  "max@gleitschirmschule-innsbruck.at",    // contactEmail
  [
    { productName: "Miura 2 RS D-Lite", sizeLabel: "M", sku: "MIURA2-D-LITE-M", colorName: "Blau",  quantity: 2, unitPrice: 2890.00 },
    { productName: "Miura 2 RS D-Lite", sizeLabel: "L", sku: "MIURA2-D-LITE-L", colorName: "Rot",   quantity: 1, unitPrice: 2890.00 },
    { productName: "Connect Race Lite",  sizeLabel: "M", sku: "CRL-M",           colorName: "SWING Design", quantity: 3, unitPrice: 890.00  },
    { productName: "Stellar RS",         sizeLabel: "ML", sku: "STELLAR-RS-ML",  colorName: "Gold", quantity: 1, unitPrice: 3450.00 },
    { productName: "Wave RS D-Lite",     sizeLabel: "15", sku: "WAVE-15",        colorName: "Nightshade", quantity: 2, unitPrice: 1790.00 },
  ],
  "Bitte bis spätestens 15. Mai liefern.\nRechnungsadresse wie bekannt — Ust-Id siehe Stammdaten.\nDie Miura-Rot Variante ist für Test-Piloten im Kundenevent am 3. Juni.",
  "b0c7d4e3-8f2a-4c5b-9e1d-7a6b5c4d3e2f"    // companyId
);

const outPath = join(tmpdir(), "swing-inquiry-email-preview.html");
writeFileSync(outPath, html, "utf-8");

console.log(`\n✅ Email preview rendered to:`);
console.log(`   ${outPath}`);
console.log(`\n   → öffne mit:  start "" "${outPath}"`);
console.log(`   → oder:       ${outPath.replace(/\\/g, "/")}  (Browser per Drag&Drop)\n`);
