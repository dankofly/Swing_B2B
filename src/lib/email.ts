import nodemailer from "nodemailer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://swingparagliders.pro";
const FROM_EMAIL = process.env.EMAIL_FROM || "SWING B2B Portal <sales@swingparagliders.pro>";

/** Escape user input for safe HTML embedding */
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Lazy-init SMTP transport (Brevo)
let transport: nodemailer.Transporter | null = null;
let smtpWarned = false;

function getTransport(): nodemailer.Transporter | null {
  if (transport) return transport;

  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    if (!smtpWarned) {
      console.error(`[email] ⚠️ SMTP_USER / SMTP_PASS not set — ALL emails will be skipped!`);
      smtpWarned = true;
    }
    return null;
  }

  transport = nodemailer.createTransport({ host, port, auth: { user, pass } });
  return transport;
}

const MAX_RETRIES = 2;
const RETRY_DELAYS = [2000, 5000]; // ms

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const smtp = getTransport();
  if (!smtp) {
    console.error(`[email] SKIPPED (no SMTP credentials): "${subject}" → ${to}`);
    return false;
  }

  let lastError = "";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await smtp.sendMail({ from: FROM_EMAIL, to, subject, html });
      console.log(`[email] ✓ Sent: "${subject}" → ${to}${attempt > 0 ? ` (attempt ${attempt + 1})` : ""}`);
      return true;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    if (attempt < MAX_RETRIES) {
      console.warn(`[email] Attempt ${attempt + 1} failed for "${subject}" → ${to}: ${lastError}. Retrying in ${RETRY_DELAYS[attempt]}ms...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }

  console.error(`[email] ✗ FAILED after ${MAX_RETRIES + 1} attempts: "${subject}" → ${to} — ${lastError}`);
  return false;
}

// ─── Shared HTML wrapper ────────────────────────────────────────────────────

function emailWrapper(title: string, subtitle: string, body: string, cta?: { label: string; href: string }): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f0f1f3; font-family:'Montserrat','Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f1f3; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header with SWING branding -->
          <tr>
            <td style="background-color:#173045; padding:28px 40px 24px; border-radius:4px 4px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px; font-weight:900; letter-spacing:3px; color:#FFFFFF; font-style:italic; text-transform:uppercase;">SWING PARAGLIDERS</span>
                    <span style="display:inline-block; margin-left:10px; background-color:#FCB923; color:#173045; font-size:9px; font-weight:800; letter-spacing:3px; padding:4px 10px; border-radius:3px; vertical-align:middle; text-transform:uppercase;">B2B</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:6px;">
                    <span style="font-size:10px; font-weight:600; letter-spacing:2px; color:rgba(255,255,255,0.35); text-transform:uppercase;">H&auml;ndlerportal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold accent line -->
          <tr>
            <td style="background-color:#FCB923; height:3px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="background-color:#ffffff; padding:32px 40px 20px;">
              <h2 style="margin:0; color:#173045; font-size:17px; font-weight:800; letter-spacing:-0.2px;">
                ${title}
              </h2>
              <p style="margin:8px 0 0; color:#6b7280; font-size:13px; line-height:1.5;">
                ${subtitle}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff; padding:0 40px 24px;">
              ${body}
            </td>
          </tr>

          ${cta ? `
          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff; padding:8px 40px 36px; text-align:center;">
              <a href="${cta.href}"
                 style="display:inline-block; background-color:#FCB923; color:#173045; padding:14px 36px; font-size:13px; font-weight:700; text-decoration:none; border-radius:4px; letter-spacing:0.5px; box-shadow:0 2px 8px rgba(252,185,35,0.3);">
                ${cta.label}
              </a>
            </td>
          </tr>
          ` : ""}

          <!-- Bottom border -->
          <tr>
            <td style="background-color:#ffffff; height:1px; font-size:0; line-height:0; border-bottom:1px solid #e5e7eb;">&nbsp;</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 12px; text-align:center;">
              <p style="margin:0; color:#173045; font-size:13px; font-weight:800; letter-spacing:2px; font-style:italic;">SWING PARAGLIDERS</p>
              <p style="margin:4px 0 0; color:#9ca3af; font-size:11px; line-height:1.6;">
                SWING Flugsportger&auml;te GmbH
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 8px; text-align:center;">
              <a href="https://swing.de" style="color:#9ca3af; font-size:10px; text-decoration:none; letter-spacing:0.5px;">swing.de</a>
              <span style="color:#d1d5db; font-size:10px;"> &nbsp;&bull;&nbsp; </span>
              <a href="${SITE_URL}" style="color:#9ca3af; font-size:10px; text-decoration:none; letter-spacing:0.5px;">swingparagliders.pro</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px; text-align:center;">
              <p style="margin:0; color:#d1d5db; font-size:10px; line-height:1.5;">
                Diese E-Mail wurde automatisch vom SWING B2B H&auml;ndlerportal versendet.<br>
                &copy; ${new Date().getFullYear()} SWING Flugsportger&auml;te GmbH &middot; Alle Rechte vorbehalten.
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
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:4px; overflow:hidden;">
    <tr>
      <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; background-color:#f9fafb;">
        <p style="margin:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(23,48,69,0.4);">${heading}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td>
    </tr>
  </table>`;
}

// ─── 0. Customer Invitation ──────────────────────────────────────────────────

const invitationI18n = {
  de: {
    greeting: (name: string) => `Hallo${name ? ` ${esc(name)}` : ""},`,
    introDealer: (company: string) =>
      `Sie wurden als H&auml;ndler f&uuml;r <strong>&bdquo;${esc(company)}&ldquo;</strong> zum SWING B2B H&auml;ndlerportal eingeladen. &Uuml;ber das Portal k&ouml;nnen Sie unseren aktuellen Katalog einsehen, Ihre individuellen Preise abrufen und Bestellanfragen direkt an uns senden.`,
    introAdmin: `Sie wurden zum SWING B2B H&auml;ndlerportal eingeladen. &Uuml;ber das Portal verwalten Sie Produkte, Bestellungen und Kunden.`,
    accessHeading: "Ihr Zugang",
    company: "Firma",
    role: "Rolle",
    teamMember: "Teammitglied",
    status: "Status",
    activated: "Freigeschaltet",
    adminGuide: `<strong>Wichtig:</strong> Bitte lesen Sie vor dem ersten Login die <a href="${SITE_URL}/admin-anleitung" style="color:#173045; font-weight:700; text-decoration:underline;">Admin-Anleitung</a>, um sich mit allen Funktionen des Portals vertraut zu machen.`,
    cta: `Klicken Sie auf den Button unten, um Ihr Passwort festzulegen und sich anzumelden. Der Link ist <strong>24 Stunden</strong> g&uuml;ltig.`,
    title: "Einladung zum SWING B2B Portal",
    subtitle: `Sie wurden zum SWING B2B H&auml;ndlerportal eingeladen.`,
    button: "Passwort festlegen &rarr;",
    subject: "Einladung zum SWING B2B Portal",
  },
  en: {
    greeting: (name: string) => `Hello${name ? ` ${esc(name)}` : ""},`,
    introDealer: (company: string) =>
      `You have been invited as a dealer for <strong>&ldquo;${esc(company)}&rdquo;</strong> to the SWING B2B Dealer Portal. Through the portal you can browse our current catalogue, view your individual prices and send order inquiries directly to us.`,
    introAdmin: `You have been invited to the SWING B2B Dealer Portal. Through the portal you can manage products, orders and customers.`,
    accessHeading: "Your Access",
    company: "Company",
    role: "Role",
    teamMember: "Team Member",
    status: "Status",
    activated: "Activated",
    adminGuide: `<strong>Important:</strong> Please read the <a href="${SITE_URL}/admin-anleitung" style="color:#173045; font-weight:700; text-decoration:underline;">Admin Guide</a> before your first login to familiarise yourself with all portal features.`,
    cta: `Click the button below to set your password and log in. The link is valid for <strong>24 hours</strong>.`,
    title: "Invitation to SWING B2B Portal",
    subtitle: `You have been invited to the SWING B2B Dealer Portal.`,
    button: "Set Password &rarr;",
    subject: "Invitation to SWING B2B Portal",
  },
  fr: {
    greeting: (name: string) => `Bonjour${name ? ` ${esc(name)}` : ""},`,
    introDealer: (company: string) =>
      `Vous avez &eacute;t&eacute; invit&eacute;(e) en tant que revendeur pour <strong>&laquo;&nbsp;${esc(company)}&nbsp;&raquo;</strong> sur le portail B2B SWING. Via le portail, vous pouvez consulter notre catalogue actuel, voir vos prix individuels et envoyer des demandes de commande directement.`,
    introAdmin: `Vous avez &eacute;t&eacute; invit&eacute;(e) sur le portail B2B SWING. Via le portail, vous g&eacute;rez les produits, commandes et clients.`,
    accessHeading: "Votre acc&egrave;s",
    company: "Entreprise",
    role: "R&ocirc;le",
    teamMember: "Membre de l&rsquo;&eacute;quipe",
    status: "Statut",
    activated: "Activ&eacute;",
    adminGuide: `<strong>Important :</strong> Veuillez lire le <a href="${SITE_URL}/admin-anleitung" style="color:#173045; font-weight:700; text-decoration:underline;">Guide Admin</a> avant votre premi&egrave;re connexion pour vous familiariser avec toutes les fonctionnalit&eacute;s du portail.`,
    cta: `Cliquez sur le bouton ci-dessous pour d&eacute;finir votre mot de passe et vous connecter. Le lien est valide pendant <strong>24 heures</strong>.`,
    title: "Invitation au portail B2B SWING",
    subtitle: `Vous avez &eacute;t&eacute; invit&eacute;(e) sur le portail B2B SWING.`,
    button: "D&eacute;finir le mot de passe &rarr;",
    subject: "Invitation au portail B2B SWING",
  },
};

export function buildInvitationEmail(
  companyName: string | null,
  contactName: string,
  passwordSetupUrl: string,
  locale: "de" | "en" | "fr" = "de",
): string {
  const t = invitationI18n[locale] || invitationI18n.de;
  const isDealer = !!companyName;

  const introText = isDealer ? t.introDealer(companyName!) : t.introAdmin;

  const accessCard = isDealer
    ? infoCard(t.accessHeading, `
        ${infoRow(t.company, `<strong>${esc(companyName!)}</strong>`)}
        ${infoRow(t.status, `<span style="color:#16a34a; font-weight:700;">${t.activated}</span>`)}
      `)
    : infoCard(t.accessHeading, `
        ${infoRow(t.role, `<span style="color:#16a34a; font-weight:700;">${t.teamMember}</span>`)}
        ${infoRow(t.status, `<span style="color:#16a34a; font-weight:700;">${t.activated}</span>`)}
      `);

  const adminGuideBlock = !isDealer
    ? `<p style="color:#414142; font-size:13px; line-height:1.7; margin:16px 0 0; padding:14px 18px; background-color:#f8f9fa; border-left:3px solid #FCB923; border-radius:2px;">${t.adminGuide}</p>`
    : "";

  const body = `
    <p style="color:#414142; font-size:13px; line-height:1.7; margin:0 0 16px;">${t.greeting(contactName)}</p>
    <p style="color:#414142; font-size:13px; line-height:1.7; margin:0 0 16px;">${introText}</p>
    ${accessCard}
    ${adminGuideBlock}
    <p style="color:#414142; font-size:13px; line-height:1.7; margin:16px 0 0;">${t.cta}</p>`;

  return emailWrapper(t.title, t.subtitle, body, { label: t.button, href: passwordSetupUrl });
}

// ─── 0b. Password Reset ─────────────────────────────────────────────────────

export function buildPasswordResetEmail(resetUrl: string): string {
  const body = `
    <p style="color:#414142; font-size:13px; line-height:1.7; margin:0 0 16px;">
      Sie haben eine Anfrage zum Zur&uuml;cksetzen Ihres Passworts gestellt.
    </p>
    <p style="color:#414142; font-size:13px; line-height:1.7; margin:0 0 16px;">
      Klicken Sie auf den Button unten, um ein neues Passwort festzulegen.
      Der Link ist <strong>24 Stunden</strong> g&uuml;ltig.
    </p>
    <p style="color:rgba(65,65,66,0.5); font-size:12px; line-height:1.6; margin:16px 0 0;">
      Falls Sie diese Anfrage nicht gestellt haben, k&ouml;nnen Sie diese E-Mail ignorieren.
      Ihr Passwort wird nicht ge&auml;ndert.
    </p>`;

  return emailWrapper(
    "Passwort zur\u00fccksetzen",
    "Setzen Sie Ihr Passwort f\u00fcr das SWING B2B Portal zur\u00fcck.",
    body,
    { label: "Neues Passwort festlegen &rarr;", href: resetUrl }
  );
}

// ─── 1. Account Approval ────────────────────────────────────────────────────

export function buildApprovalEmail(companyName: string): string {
  const body = infoCard("Ihr Zugang", `
    ${infoRow("Firma", `<strong>${esc(companyName!)}</strong>`)}
    ${infoRow("Status", '<span style="color:#16a34a; font-weight:700;">Freigeschaltet</span>')}
  `);

  return emailWrapper(
    "Ihr Zugang wurde freigeschaltet",
    `Willkommen im SWING B2B H&auml;ndlerportal! Ihr Account f&uuml;r &bdquo;${esc(companyName!)}&ldquo; wurde genehmigt.`,
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

// ─── 3. New Inquiry Notification (to SWING) ────────────────────────────────

export interface InquiryEmailItem {
  productName: string;
  sizeLabel: string;
  sku: string;
  colorName: string;
  quantity: number;
  unitPrice: number;
}

export function buildNewInquiryEmail(
  inquiryId: string,
  companyName: string,
  contactName: string,
  contactEmail: string,
  items: InquiryEmailItem[],
  notes: string | null,
  companyId: string,
): string {
  const date = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  const itemRows = items
    .map(
      (item, idx) => `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:8px 10px; font-size:12px; color:#414142;">${idx + 1}</td>
      <td style="padding:8px 10px; font-size:12px; color:#173045; font-weight:600;">${esc(item.productName)}</td>
      <td style="padding:8px 10px; font-size:12px; color:#414142;">${esc(item.sizeLabel)}</td>
      <td style="padding:8px 10px; font-size:12px; color:#414142;">${esc(item.colorName)}</td>
      <td style="padding:8px 10px; font-size:12px; color:#414142; text-align:center; font-weight:600;">${item.quantity}</td>
      <td style="padding:8px 10px; font-size:12px; color:#414142; text-align:right; font-family:monospace;">${item.unitPrice > 0 ? item.unitPrice.toFixed(2).replace(".", ",") + " &euro;" : "&mdash;"}</td>
    </tr>`
    )
    .join("");

  const itemsTable = `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8; border-radius:2px; border-collapse:collapse; margin-top:12px;">
      <tr style="background-color:#173045;">
        <th style="padding:8px 10px; font-size:10px; color:rgba(255,255,255,0.7); text-align:left; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Pos.</th>
        <th style="padding:8px 10px; font-size:10px; color:rgba(255,255,255,0.7); text-align:left; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Produkt</th>
        <th style="padding:8px 10px; font-size:10px; color:rgba(255,255,255,0.7); text-align:left; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Gr&ouml;&szlig;e</th>
        <th style="padding:8px 10px; font-size:10px; color:rgba(255,255,255,0.7); text-align:left; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Farbe</th>
        <th style="padding:8px 10px; font-size:10px; color:rgba(255,255,255,0.7); text-align:center; font-weight:700; letter-spacing:1px; text-transform:uppercase;">Menge</th>
        <th style="padding:8px 10px; font-size:10px; color:rgba(255,255,255,0.7); text-align:right; font-weight:700; letter-spacing:1px; text-transform:uppercase;">EK netto</th>
      </tr>
      ${itemRows}
      <tr style="background-color:#fafafa;">
        <td colspan="4" style="padding:10px; font-size:12px; color:rgba(23,48,69,0.4); font-weight:600; text-align:right;">Gesamt:</td>
        <td style="padding:10px; font-size:13px; color:#173045; font-weight:700; text-align:center;">${totalQty} Stk.</td>
        <td style="padding:10px;"></td>
      </tr>
    </table>`;

  const body = `
    ${infoCard("H&auml;ndler", `
      ${infoRow("Firma", `<strong>${esc(companyName!)}</strong>`)}
      ${infoRow("Kontakt", contactName ? esc(contactName) : "&mdash;")}
      ${infoRow("E-Mail", contactEmail ? esc(contactEmail) : "&mdash;")}
      ${infoRow("Datum", date)}
      ${infoRow("Anfrage-Nr.", `<code style="font-family:monospace; background:#f0f0f0; padding:2px 6px; border-radius:2px;">${inquiryId.slice(0, 8)}</code>`)}
    `)}

    <div style="margin-top:16px;">
      <p style="margin:0 0 4px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(23,48,69,0.35);">Bestellpositionen</p>
      ${itemsTable}
    </div>

    ${notes ? `
    <div style="margin-top:16px;">
      <p style="margin:0 0 4px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(23,48,69,0.35);">Anmerkungen</p>
      <div style="background:#fafafa; border:1px solid #e8e8e8; border-radius:2px; padding:12px 16px;">
        <p style="margin:0; font-size:13px; color:#414142; line-height:1.6; white-space:pre-line;">${esc(notes)}</p>
      </div>
    </div>` : ""}
  `;

  return emailWrapper(
    `Neue Bestellanfrage von ${esc(companyName)}`,
    `${items.length} Position${items.length !== 1 ? "en" : ""}, ${totalQty} St&uuml;ck gesamt`,
    body,
    { label: "Anfrage im Portal &ouml;ffnen &rarr;", href: `${SITE_URL}/admin/kunden/${companyId}` }
  );
}

// ─── 4. Tracking Info ───────────────────────────────────────────────────────

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
