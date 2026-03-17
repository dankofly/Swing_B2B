import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://swing-b2b-portal.netlify.app";
const FROM_EMAIL = process.env.EMAIL_FROM || "SWING B2B Portal <noreply@swing.de>";

// Lazy-init Resend client
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] Resend not configured (RESEND_API_KEY missing), skipping: "${subject}" → ${to}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[email] Resend error for "${subject}" to ${to}:`, error);
      return false;
    }

    console.log(`[email] Sent: "${subject}" → ${to}`);
    return true;
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
    return false;
  }
}

// ─── Shared HTML wrapper ────────────────────────────────────────────────────

function emailWrapper(title: string, subtitle: string, body: string, cta?: { label: string; href: string }): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f6f6f6; font-family:'Montserrat',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f6; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #173045 0%, #1F2A55 100%); padding:30px 40px; border-radius:2px 2px 0 0;">
              <h1 style="margin:0; color:#FCB923; font-size:18px; font-weight:800; letter-spacing:2px; text-transform:uppercase; font-style:italic;">
                SWING PARAGLIDERS
              </h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.4); font-size:11px; letter-spacing:1.5px; text-transform:uppercase; font-weight:600;">
                B2B H&auml;ndlerportal
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="background-color:#ffffff; padding:30px 40px 20px;">
              <h2 style="margin:0; color:#173045; font-size:16px; font-weight:800;">
                ${title}
              </h2>
              <p style="margin:8px 0 0; color:#414142; font-size:13px; opacity:0.6;">
                ${subtitle}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff; padding:0 40px 20px;">
              ${body}
            </td>
          </tr>

          ${cta ? `
          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff; padding:10px 40px 30px; text-align:center;">
              <a href="${cta.href}"
                 style="display:inline-block; background-color:#FCB923; color:#173045; padding:12px 32px; font-size:13px; font-weight:700; text-decoration:none; border-radius:2px; letter-spacing:0.5px;">
                ${cta.label}
              </a>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px; text-align:center;">
              <p style="margin:0; color:rgba(65,65,66,0.3); font-size:11px;">
                Diese E-Mail wurde automatisch vom SWING B2B H&auml;ndlerportal versendet.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:4px 0;">
      <span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">${label}:</span>
      <span style="color:#173045; font-size:13px; margin-left:8px;">${value}</span>
    </td>
  </tr>`;
}

function infoCard(heading: string, rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8; border-radius:2px;">
    <tr>
      <td style="padding:16px 20px; border-bottom:1px solid #f0f0f0; background-color:#fafafa;">
        <p style="margin:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(23,48,69,0.35);">${heading}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td>
    </tr>
  </table>`;
}

// ─── 1. Account Approval ────────────────────────────────────────────────────

export function buildApprovalEmail(companyName: string): string {
  const body = infoCard("Ihr Zugang", `
    ${infoRow("Firma", `<strong>${companyName}</strong>`)}
    ${infoRow("Status", '<span style="color:#16a34a; font-weight:700;">Freigeschaltet</span>')}
  `);

  return emailWrapper(
    "Ihr Zugang wurde freigeschaltet",
    `Willkommen im SWING B2B H&auml;ndlerportal! Ihr Account f&uuml;r &bdquo;${companyName}&ldquo; wurde genehmigt.`,
    body,
    { label: "Zum Katalog &rarr;", href: `${SITE_URL}/katalog` }
  );
}

// ─── 2. Inquiry Status Update ───────────────────────────────────────────────

const STATUS_LABELS: Record<string, { de: string; color: string }> = {
  new: { de: "Neu", color: "#2563eb" },
  in_progress: { de: "In Bearbeitung", color: "#d97706" },
  shipped: { de: "Versendet", color: "#9333ea" },
  completed: { de: "Abgeschlossen", color: "#16a34a" },
};

export function buildInquiryStatusEmail(
  companyName: string,
  inquiryId: string,
  status: string,
  createdAt: string,
): string {
  const statusInfo = STATUS_LABELS[status] ?? { de: status, color: "#173045" };
  const date = new Date(createdAt).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const body = infoCard("Anfrage-Details", `
    ${infoRow("Anfrage-Nr.", `<code style="font-family:monospace; background:#f0f0f0; padding:2px 6px; border-radius:2px;">${inquiryId.slice(0, 8)}</code>`)}
    ${infoRow("Erstellt am", date)}
    ${infoRow("Neuer Status", `<span style="color:${statusInfo.color}; font-weight:700;">${statusInfo.de}</span>`)}
  `);

  return emailWrapper(
    `Anfrage-Status: ${statusInfo.de}`,
    `Der Status Ihrer Anfrage bei SWING wurde aktualisiert.`,
    body,
    { label: "Anfragen anzeigen &rarr;", href: `${SITE_URL}/katalog/anfragen` }
  );
}

// ─── 3. Tracking Info ───────────────────────────────────────────────────────

const CARRIER_URLS: Record<string, string> = {
  dhl: "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=",
  dpd: "https://tracking.dpd.de/status/de_DE/parcel/",
  ups: "https://www.ups.com/track?tracknum=",
  gls: "https://gls-group.eu/DE/de/paketverfolgung?match=",
  fedex: "https://www.fedex.com/fedextrack/?trknbr=",
  hermes: "https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#",
};

export function buildTrackingEmail(
  companyName: string,
  inquiryId: string,
  carrier: string,
  trackingNumber: string,
): string {
  const carrierDisplay = carrier.toUpperCase();
  const trackingUrl = CARRIER_URLS[carrier.toLowerCase()]
    ? `${CARRIER_URLS[carrier.toLowerCase()]}${trackingNumber}`
    : null;

  const trackingLink = trackingUrl
    ? `<a href="${trackingUrl}" style="color:#173045; text-decoration:underline; font-family:monospace;">${trackingNumber}</a>`
    : `<code style="font-family:monospace; background:#f0f0f0; padding:2px 6px; border-radius:2px;">${trackingNumber}</code>`;

  const body = infoCard("Versandinformationen", `
    ${infoRow("Anfrage-Nr.", `<code style="font-family:monospace; background:#f0f0f0; padding:2px 6px; border-radius:2px;">${inquiryId.slice(0, 8)}</code>`)}
    ${infoRow("Versanddienstleister", `<strong>${carrierDisplay}</strong>`)}
    ${infoRow("Trackingnummer", trackingLink)}
  `);

  return emailWrapper(
    "Ihre Bestellung wurde versendet",
    `Gute Nachrichten! Ihre Anfrage bei SWING wurde versendet.`,
    body,
    trackingUrl
      ? { label: "Sendung verfolgen &rarr;", href: trackingUrl }
      : { label: "Anfragen anzeigen &rarr;", href: `${SITE_URL}/katalog/anfragen` }
  );
}
