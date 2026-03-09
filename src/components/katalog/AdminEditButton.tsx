"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminEditButton({ productId }: { productId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/admin/produkte/${productId}/bearbeiten`);
      }}
      className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white/40 transition-all duration-200 hover:bg-white/25 hover:text-white z-10"
      title="Bearbeiten"
    >
      <Settings size={13} />
    </button>
  );
}
