import { getAllInquiries } from "@/lib/actions/inquiries";
import InquiryList from "./InquiryList";
import { ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnfragenPage() {
  const inquiries = await getAllInquiries();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Verwaltung
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Bestellanfragen
          </h1>
        </div>
      </div>

      <InquiryList inquiries={inquiries} />
    </div>
  );
}
