import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/ui/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Role guard (moved from middleware to avoid extra DB call on every navigation)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["superadmin", "admin", "testadmin"].includes(profile.role)) {
    redirect("/katalog");
  }

  return (
    <div className="min-h-screen bg-swing-gray-light">
      <Suspense>
        <Header isAdmin />
      </Suspense>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 fade-in-up">{children}</main>
    </div>
  );
}
