"use client";

import { useState } from "react";
import { toggleCompanyApproval } from "@/lib/actions/customers";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ApprovalToggle({
  companyId,
  initialApproved,
}: {
  companyId: string;
  initialApproved: boolean;
}) {
  const [approved, setApproved] = useState(initialApproved);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleCompanyApproval(companyId, !approved);
    if (result.success) {
      setApproved(!approved);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        approved
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-700 hover:bg-red-200"
      }`}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : approved ? (
        <CheckCircle size={12} />
      ) : (
        <XCircle size={12} />
      )}
      {approved ? "Freigeschaltet" : "Nicht freigeschaltet"}
    </button>
  );
}
