// Generate PWA icons using node-canvas-like approach with sharp or playwright
// Using Playwright since it's already installed

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const NAVY = "#173045";
const GOLD = "#FCB923";

function svgIcon(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.2) : Math.round(size * 0.1);
  const inner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = Math.round(inner * 0.22);
  const subSize = Math.round(inner * 0.09);
  const badgeW = Math.round(inner * 0.22);
  const badgeH = Math.round(inner * 0.11);
  const badgeX = cx - badgeW / 2;
  const badgeY = cy + Math.round(inner * 0.12);
  const badgeFontSize = Math.round(inner * 0.065);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}" rx="${maskable ? 0 : Math.round(size * 0.15)}"/>
  <text x="${cx}" y="${cy - Math.round(inner * 0.02)}" text-anchor="middle" dominant-baseline="central"
    font-family="Arial,Helvetica,sans-serif" font-weight="800" font-style="italic"
    font-size="${fontSize}" fill="${GOLD}" letter-spacing="${Math.round(fontSize * 0.08)}">SWING</text>
  <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="${Math.round(badgeH * 0.2)}" fill="${GOLD}"/>
  <text x="${cx}" y="${badgeY + badgeH / 2}" text-anchor="middle" dominant-baseline="central"
    font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${badgeFontSize}"
    fill="${NAVY}" letter-spacing="${Math.round(badgeFontSize * 0.15)}">B2B</text>
</svg>`;
}

async function main() {
  const outDir = path.join(__dirname, "..", "public", "icons");

  const configs = [
    { size: 192, maskable: false, name: "icon-192.png" },
    { size: 512, maskable: false, name: "icon-512.png" },
    { size: 192, maskable: true, name: "icon-maskable-192.png" },
    { size: 512, maskable: true, name: "icon-maskable-512.png" },
    { size: 180, maskable: false, name: "apple-touch-icon.png" },
    { size: 32, maskable: false, name: "favicon-32.png" },
    { size: 16, maskable: false, name: "favicon-16.png" },
  ];

  const browser = await chromium.launch();

  for (const cfg of configs) {
    const svg = svgIcon(cfg.size, cfg.maskable);
    const page = await browser.newPage({
      viewport: { width: cfg.size, height: cfg.size },
      deviceScaleFactor: 1,
    });
    await page.setContent(`
      <!DOCTYPE html>
      <html><body style="margin:0;padding:0;overflow:hidden;">
        ${svg}
      </body></html>
    `);
    await page.screenshot({
      path: path.join(outDir, cfg.name),
      omitBackground: true,
    });
    await page.close();
    console.log(`Generated ${cfg.name} (${cfg.size}x${cfg.size})`);
  }

  await browser.close();
  console.log("Done — all icons generated in public/icons/");
}

main().catch(console.error);
