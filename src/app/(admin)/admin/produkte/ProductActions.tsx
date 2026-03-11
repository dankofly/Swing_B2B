"use client";

import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import { deleteProduct, duplicateProduct, toggleProductActive } from "@/lib/actions/products";
import { useState } from "react";
import { useDict } from "@/lib/i18n/context";

export function ToggleActiveButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const dict = useDict();
  const t = dict.productActions;
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
      title={isActive ? t.clickToDeactivate : t.clickToActivate}
    >
      {isActive ? (
        <>
          <span className="flex h-4 w-7 items-center rounded-full bg-green-500 px-0.5">
            <span className="ml-auto h-3 w-3 rounded-full bg-white" />
          </span>
          {t.active}
        </>
      ) : (
        <>
          <span className="flex h-4 w-7 items-center rounded-full bg-red-400 px-0.5">
            <span className="h-3 w-3 rounded-full bg-white" />
          </span>
          {t.locked}
        </>
      )}
    </button>
  );
}

export function DuplicateProductButton({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    const result = await duplicateProduct(productId);
    if (result.newId) {
      router.push(`/admin/produkte/${result.newId}/bearbeiten`);
    } else {
      alert(result.error || "Fehler beim Duplizieren");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className={`rounded-lg p-2 text-swing-navy/40 transition-colors hover:bg-blue-50 hover:text-blue-600 ${loading ? "opacity-50" : ""}`}
      title="Produkt duplizieren"
    >
      <Copy size={16} />
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
  const dict = useDict();
  const t = dict.productActions;

  async function handleDelete() {
    if (!confirm(t.deleteConfirm.replace("{name}", productName))) {
      return;
    }
    await deleteProduct(productId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded p-1 text-swing-gray-dark/40 hover:bg-red-50 hover:text-red-600"
      title={t.deleteTitle}
    >
      <Trash2 size={16} />
    </button>
  );
}
