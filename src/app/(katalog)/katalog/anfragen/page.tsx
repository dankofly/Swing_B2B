import { getMyInquiries } from "@/lib/actions/inquiries";
import { FileText } from "lucide-react";
import InquiryBoard from "@/components/katalog/InquiryBoard";

export const dynamic = "force-dynamic";

export default async function MeineAnfragenPage() {
  const inquiries = await getMyInquiries();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Übersicht
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Meine Anfragen
          </h1>
        </div>
      </div>

      <InquiryBoard inquiries={inquiries} />
    </div>
  );
}
