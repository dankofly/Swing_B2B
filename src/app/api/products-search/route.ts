import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Auth guard: any logged-in user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const rawQ = request.nextUrl.searchParams.get("q") || "";
  const exclude = request.nextUrl.searchParams.get("exclude") || "";

  // Defensive: cap length (DoS) + escape ILIKE wildcards so `%` and `_`
  // in the user query match literally instead of expanding.
  const q = rawQ.slice(0, 100).replace(/[%_\\]/g, (c) => `\\${c}`);

  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  let query = supabase
    .from("products")
    .select("id, name, slug")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(10);

  if (exclude && isValidUUID(exclude)) {
    query = query.neq("id", exclude);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[products-search] DB error:", error.message);
    return NextResponse.json({ products: [], error: "Datenbankfehler" }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
