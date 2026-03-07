import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import KundenForm from "../KundenForm";

export default function NeuerKundePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10 flex items-center gap-4">
          <Link
            href="/admin/kunden"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Kundenverwaltung
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Neuen Kunden anlegen
            </h1>
          </div>
        </div>
      </div>

      <KundenForm />
    </div>
  );
}
