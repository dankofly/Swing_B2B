import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@swing.de";

interface RegistrationData {
  companyName: string;
  companyType: string;
  fullName: string;
  email: string;
  phone: string;
  phoneWhatsapp: boolean;
  addressStreet: string;
  addressZip: string;
  addressCity: string;
  addressCountry: string;
  vatId: string;
  sellsParagliders: boolean;
  sellsMiniwings: boolean;
  sellsParakites: boolean;
}

function companyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    dealer: "Händler",
    importer: "Importeur",
    importer_network: "Importeur mit Netzwerk",
    customer: "Endkunde",
  };
  return map[type] || type;
}

function buildHtml(data: RegistrationData): string {
  const categories = [
    data.sellsParagliders && "Paragleiter",
    data.sellsMiniwings && "Miniwings",
    data.sellsParakites && "Parakites",
  ]
    .filter(Boolean)
    .join(", ");

  const address = [
    data.addressStreet,
    [data.addressZip, data.addressCity].filter(Boolean).join(" "),
    data.addressCountry,
  ]
    .filter(Boolean)
    .join("<br>");

  return `
<!DOCTYPE html>
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
                B2B Händlerportal
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="background-color:#ffffff; padding:30px 40px 20px;">
              <h2 style="margin:0; color:#173045; font-size:16px; font-weight:800;">
                Neue Zugangsanfrage
              </h2>
              <p style="margin:8px 0 0; color:#414142; font-size:13px; opacity:0.6;">
                Ein neuer Händler hat sich für das B2B Portal registriert und wartet auf Freischaltung.
              </p>
            </td>
          </tr>

          <!-- Company Info -->
          <tr>
            <td style="background-color:#ffffff; padding:0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8; border-radius:2px;">
                <tr>
                  <td style="padding:16px 20px; border-bottom:1px solid #f0f0f0; background-color:#fafafa;">
                    <p style="margin:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(23,48,69,0.35);">Firmendaten</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">Firma:</span>
                          <span style="color:#173045; font-size:14px; font-weight:700; margin-left:8px;">${data.companyName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">Typ:</span>
                          <span style="color:#173045; font-size:13px; margin-left:8px;">${companyTypeLabel(data.companyType)}</span>
                        </td>
                      </tr>
                      ${data.vatId ? `<tr><td style="padding:4px 0;"><span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">USt-ID:</span><span style="color:#173045; font-size:13px; margin-left:8px; font-family:monospace;">${data.vatId}</span></td></tr>` : ""}
                      ${categories ? `<tr><td style="padding:4px 0;"><span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">Kategorien:</span><span style="color:#173045; font-size:13px; margin-left:8px;">${categories}</span></td></tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="background-color:#ffffff; padding:0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8; border-radius:2px;">
                <tr>
                  <td style="padding:16px 20px; border-bottom:1px solid #f0f0f0; background-color:#fafafa;">
                    <p style="margin:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(23,48,69,0.35);">Kontaktdaten</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">Ansprechpartner:</span>
                          <span style="color:#173045; font-size:14px; font-weight:700; margin-left:8px;">${data.fullName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">E-Mail:</span>
                          <a href="mailto:${data.email}" style="color:#173045; font-size:13px; margin-left:8px; text-decoration:none;">${data.email}</a>
                        </td>
                      </tr>
                      ${data.phone ? `<tr><td style="padding:4px 0;"><span style="color:rgba(23,48,69,0.4); font-size:11px; font-weight:600;">Telefon:</span><a href="tel:${data.phone}" style="color:#173045; font-size:13px; margin-left:8px; text-decoration:none;">${data.phone}</a>${data.phoneWhatsapp ? ' <span style="color:#25D366; font-size:11px; font-weight:600;">WhatsApp</span>' : ""}</td></tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Address -->
          ${address ? `
          <tr>
            <td style="background-color:#ffffff; padding:0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8; border-radius:2px;">
                <tr>
                  <td style="padding:16px 20px; border-bottom:1px solid #f0f0f0; background-color:#fafafa;">
                    <p style="margin:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(23,48,69,0.35);">Adresse</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0; color:#173045; font-size:13px; line-height:1.6;">${address}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff; padding:10px 40px 30px; text-align:center;">
              <p style="margin:0 0 16px; color:rgba(65,65,66,0.5); font-size:12px;">
                Bitte prüfen Sie die Anfrage und schalten Sie den Händler im Admin-Bereich frei.
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://swingparagliders.pro"}/admin/kunden"
                 style="display:inline-block; background-color:#FCB923; color:#173045; padding:12px 32px; font-size:13px; font-weight:700; text-decoration:none; border-radius:2px; letter-spacing:0.5px;">
                Zur Kundenverwaltung →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px; text-align:center;">
              <p style="margin:0; color:rgba(65,65,66,0.3); font-size:11px;">
                Diese E-Mail wurde automatisch vom SWING B2B Händlerportal versendet.
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

export async function POST(request: NextRequest) {
  try {
    const data: RegistrationData = await request.json();

    const sent = await sendEmail(
      ADMIN_EMAIL,
      `Anfrage für den Zugang zu dem SWING B2B Portal — ${data.companyName}`,
      buildHtml(data),
    );

    return NextResponse.json({ success: true, skipped: !sent });
  } catch (err) {
    console.error("[notify-registration] Error:", err);
    return NextResponse.json({ success: false, error: "E-Mail-Versand fehlgeschlagen" }, { status: 500 });
  }
}
