import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
