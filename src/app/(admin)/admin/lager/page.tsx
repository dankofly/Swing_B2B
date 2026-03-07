import LagerImportClient from "./LagerImportClient";
import { Warehouse } from "lucide-react";

export default function AdminLagerPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Verwaltung
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Lagerbestand-Import
          </h1>
        </div>
      </div>

      <LagerImportClient />
    </div>
  );
}
