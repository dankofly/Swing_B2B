import { getMyInquiries } from "@/lib/actions/inquiries";
import { FileText } from "lucide-react";
import InquiryBoard from "@/components/katalog/InquiryBoard";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function MeineAnfragenPage() {
  const [inquiries, dict] = await Promise.all([getMyInquiries(), getDictionary()]);

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
