"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { deleteProduct, toggleProductActive } from "@/lib/actions/products";
import { useState } from "react";

export function ToggleActiveButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleProductActive(productId, !isActive);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex cursor-pointer items-center gap-2 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
        isActive
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-600 hover:bg-red-200"
      } ${loading ? "opacity-50" : ""}`}
      title={isActive ? "Klicken zum Deaktivieren" : "Klicken zum Aktivieren"}
    >
      {isActive ? (
        <>
          <span className="flex h-4 w-7 items-center rounded-full bg-green-500 px-0.5">
            <span className="ml-auto h-3 w-3 rounded-full bg-white" />
          </span>
          Aktiv
        </>
      ) : (
        <>
          <span className="flex h-4 w-7 items-center rounded-full bg-red-400 px-0.5">
            <span className="h-3 w-3 rounded-full bg-white" />
          </span>
          Gesperrt
        </>
      )}
    </button>
  );
}

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`"${productName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }
    await deleteProduct(productId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded p-1 text-swing-gray-dark/40 hover:bg-red-50 hover:text-red-600"
      title="Löschen"
    >
      <Trash2 size={16} />
    </button>
  );
}
