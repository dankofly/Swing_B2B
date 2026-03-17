import { createClient } from "@/lib/supabase/server";
import { getMyInquiries, getCompanyInquiriesForDashboard } from "@/lib/actions/inquiries";
import { FileText } from "lucide-react";
import InquiryBoard from "@/components/katalog/InquiryBoard";
import { getDictionary } from "@/lib/i18n";


export default async function MeineAnfragenPage({
  searchParams,
}: {
  searchParams: Promise<{ als?: string }>;
}) {
  const { als } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  }
  const viewingAsCompanyId = als && isAdmin ? als : undefined;

  const [inquiries, dict] = await Promise.all([
    viewingAsCompanyId
      ? getCompanyInquiriesForDashboard(viewingAsCompanyId)
      : getMyInquiries(),
    getDictionary(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            {dict.inquiries.overview}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {dict.inquiries.title}
          </h1>
        </div>
      </div>

      <InquiryBoard inquiries={inquiries} />
    </div>
  );
}
