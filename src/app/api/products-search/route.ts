import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Auth guard: any logged-in user
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") || "";
  const exclude = request.nextUrl.searchParams.get("exclude") || "";

  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("products")
    .select("id, name, slug")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(10);

  if (exclude) {
    query = query.neq("id", exclude);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[products-search] DB error:", error.message);
    return NextResponse.json({ products: [], error: "Datenbankfehler" }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
