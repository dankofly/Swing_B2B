"use server";

import { createClient, createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, buildInquiryStatusEmail, buildTrackingEmail, buildNewInquiryEmail } from "@/lib/email";
import type { InquiryEmailItem } from "@/lib/email";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id: string): boolean { return UUID_RE.test(id); }

export interface InquiryItem {
  sizeId: string;
  colorId: string;
  quantity: number;
  unitPrice: number | null;
}

export async function submitInquiry(items: InquiryItem[], notes: string) {
  if (!items || items.length === 0) throw new Error("Keine Positionen");
  if (items.length > 200) throw new Error("Zu viele Positionen (max. 200)");
  for (const item of items) {
    if (!isValidUUID(item.sizeId) || !isValidUUID(item.colorId)) throw new Error("Ungültige Positions-ID");
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 9999) throw new Error("Ungültige Menge");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Nicht angemeldet");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) throw new Error("Kein Unternehmen zugeordnet");

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .insert({
      company_id: profile.company_id,
      user_id: user.id,
      status: "new",
      notes: notes || null,
    })
    .select("id")
    .single();

  if (inquiryError || !inquiry) {
    throw new Error("Anfrage konnte nicht erstellt werden");
  }

  const rows = items.map((item) => ({
    inquiry_id: inquiry.id,
    product_size_id: item.sizeId,
    product_color_id: item.colorId,
    quantity: item.quantity,
    unit_price: item.unitPrice ?? 0,
  }));

  const { error: itemsError } = await supabase
    .from("inquiry_items")
    .insert(rows);

  if (itemsError) {
    throw new Error("Positionen konnten nicht gespeichert werden");
  }

  revalidatePath("/katalog/anfragen");
  revalidatePath("/admin/anfragen");

  // Send branded email to info@swing.de with full order (fire-and-forget)
  (async () => {
    try {
      const admin = createAdminClient();

      // Fetch company + user details + item details in parallel
      const [{ data: company }, { data: userProfile }, { data: itemDetails }] = await Promise.all([
        admin.from("companies").select("name, contact_email").eq("id", profile.company_id).single(),
        admin.from("profiles").select("full_name, email").eq("id", user.id).single(),
        admin.from("inquiry_items")
          .select("quantity, unit_price, product_size:product_sizes(size_label, sku, product:products(name)), product_color:product_colors(color_name)")
          .eq("inquiry_id", inquiry.id),
      ]);

      if (!company || !itemDetails) return;

      const emailItems: InquiryEmailItem[] = itemDetails.map((item: any) => ({
        productName: item.product_size?.product?.name ?? "—",
        sizeLabel: item.product_size?.size_label ?? "—",
        sku: item.product_size?.sku ?? "—",
        colorName: item.product_color?.color_name ?? "—",
        quantity: item.quantity,
        unitPrice: Number(item.unit_price) || 0,
      }));

      const html = buildNewInquiryEmail(
        inquiry.id,
        company.name,
        userProfile?.full_name ?? "",
        userProfile?.email ?? user.email ?? "",
        emailItems,
        notes || null,
        profile.company_id,
      );

      const adminEmail = process.env.ADMIN_EMAIL || "info@swing.de";
      await sendEmail(adminEmail, `Neue Bestellanfrage von ${company.name}`, html);
    } catch (err) {
      console.error("[inquiry-email] Failed to send notification:", err);
    }
  })();

  return { inquiryId: inquiry.id };
}

export async function getMyInquiries() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("inquiries")
    .select(
      `
      id,
      status,
      status_timestamps,
      notes,
      shipping_carrier,
      tracking_number,
      created_at,
      items:inquiry_items(
        id,
        quantity,
        unit_price,
        product_size:product_sizes(size_label, sku, product:products(name)),
        product_color:product_colors(color_name)
      )
    `
    )
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getCompanyInquiriesForDashboard(companyId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("inquiries")
    .select(
      `
      id,
      status,
      status_timestamps,
      notes,
      shipping_carrier,
      tracking_number,
      created_at,
      items:inquiry_items(
        id,
        quantity,
        unit_price,
        product_size:product_sizes(size_label, sku, product:products(name)),
        product_color:product_colors(color_name)
      )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllInquiries() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("inquiries")
    .select(
      `
      id,
      status,
      notes,
      created_at,
      company_id,
      tracking_number,
      shipping_carrier,
      company:companies(name),
      user:profiles(full_name, email),
      items:inquiry_items(
        id,
        quantity,
        unit_price,
        product_size:product_sizes(size_label, sku, product:products(name)),
        product_color:product_colors(color_name)
      )
    `
    )
    .order("created_at", { ascending: false });

  // Supabase returns joined single-relations as arrays without typed client.
  // Normalize them to single objects to match the Inquiry interface.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    company: Array.isArray(row.company) ? row.company[0] ?? null : row.company,
    user: Array.isArray(row.user) ? row.user[0] ?? null : row.user,
    items: (row.items ?? []).map((item: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
      ...item,
      product_size: Array.isArray(item.product_size) ? item.product_size[0] ?? null : item.product_size,
      product_color: Array.isArray(item.product_color) ? item.product_color[0] ?? null : item.product_color,
    })),
  }));
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: "new" | "in_progress" | "shipped" | "completed"
) {
  if (!isValidUUID(inquiryId)) throw new Error("Ungültige Anfrage-ID");
  await guardAdmin();
  const supabase = createAdminClient();

  // Fetch current inquiry with company email
  const { data: current } = await supabase
    .from("inquiries")
    .select("status_timestamps, created_at, company:companies(name, contact_email)")
    .eq("id", inquiryId)
    .single();

  const timestamps = (current?.status_timestamps as Record<string, string>) ?? {};
  timestamps[status] = new Date().toISOString();

  const { error } = await supabase
    .from("inquiries")
    .update({ status, status_timestamps: timestamps })
    .eq("id", inquiryId);

  if (error) throw new Error("Status konnte nicht aktualisiert werden");

  // Notify customer about status change (fire-and-forget)
  const company = current?.company as unknown as { name: string; contact_email: string } | null;
  if (company?.contact_email) {
    sendEmail(
      company.contact_email,
      `SWING Anfrage ${inquiryId.slice(0, 8)} — Status: ${status}`,
      buildInquiryStatusEmail(company.name, inquiryId, status, current?.created_at ?? new Date().toISOString())
    ).catch(() => {});
  }

  revalidatePath("/admin/anfragen");
  revalidatePath("/katalog/anfragen");
}

export async function updateInquiryNotes(inquiryId: string, notes: string) {
  if (!isValidUUID(inquiryId)) throw new Error("Ungültige Anfrage-ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("inquiries")
    .update({ notes })
    .eq("id", inquiryId);

  if (error) throw new Error("Notiz konnte nicht gespeichert werden");
  revalidatePath("/admin/kunden");
}

export async function updateInquiryTracking(
  inquiryId: string,
  carrier: string,
  trackingNumber: string
) {
  if (!isValidUUID(inquiryId)) throw new Error("Ungültige Anfrage-ID");
  if (!carrier.trim() || !trackingNumber.trim()) throw new Error("Carrier und Trackingnummer erforderlich");
  await guardAdmin();
  const supabase = createAdminClient();

  // Fetch current inquiry with company email
  const { data: current } = await supabase
    .from("inquiries")
    .select("status_timestamps, company:companies(name, contact_email)")
    .eq("id", inquiryId)
    .single();

  const timestamps = (current?.status_timestamps as Record<string, string>) ?? {};
  timestamps["completed"] = new Date().toISOString();

  const { error } = await supabase
    .from("inquiries")
    .update({
      shipping_carrier: carrier,
      tracking_number: trackingNumber,
      status: "completed",
      status_timestamps: timestamps,
    })
    .eq("id", inquiryId);

  if (error) throw new Error("Trackingnummer konnte nicht gespeichert werden");

  // Notify customer with tracking info (fire-and-forget)
  const company = current?.company as unknown as { name: string; contact_email: string } | null;
  if (company?.contact_email) {
    sendEmail(
      company.contact_email,
      `SWING Bestellung versendet — Tracking: ${trackingNumber}`,
      buildTrackingEmail(company.name, inquiryId, carrier, trackingNumber)
    ).catch(() => {});
  }

  revalidatePath("/admin/kunden");
}

export async function getCompanyInquiries(companyId: string) {
  const supabase = createAdminClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id, status, notes, tracking_number, created_at, updated_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (!inquiries || inquiries.length === 0) return [];

  // Fetch items separately for each inquiry
  const ids = inquiries.map((i) => i.id);
  const { data: items } = await supabase
    .from("inquiry_items")
    .select("id, inquiry_id, quantity, unit_price, product_size_id, product_color_id")
    .in("inquiry_id", ids);

  // Fetch product size names
  const sizeIds = [...new Set((items ?? []).map((i) => i.product_size_id).filter(Boolean))];
  const { data: sizes } = sizeIds.length > 0
    ? await supabase
        .from("product_sizes")
        .select("id, size_label, sku, product:products(name)")
        .in("id", sizeIds)
    : { data: [] };

  const sizeMap = new Map((sizes ?? []).map((s) => [s.id, s]));

  return inquiries.map((inq) => ({
    ...inq,
    user: null,
    items: (items ?? [])
      .filter((i) => i.inquiry_id === inq.id)
      .map((i) => ({
        id: i.id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        product_size: sizeMap.get(i.product_size_id) ?? null,
        product_color: null,
      })),
  }));
}
