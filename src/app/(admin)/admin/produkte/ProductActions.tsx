"use client";

import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import { deleteProduct, duplicateProduct, toggleProductActive } from "@/lib/actions/products";
import { useState } from "react";
import { useDict } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/Toast";

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
  const [optimistic, setOptimistic] = useState(isActive);
  const { toast } = useToast();

  async function handleToggle() {
    setLoading(true);
    const newState = !optimistic;
    setOptimistic(newState);
    try {
      await toggleProductActive(productId, newState);
      router.refresh();
    } catch (e) {
      setOptimistic(!newState);
      toast(e instanceof Error ? e.message : "Fehler beim Statuswechsel", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn-press flex cursor-pointer items-center gap-2 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
        optimistic
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-600 hover:bg-red-200"
      } ${loading ? "opacity-50" : ""}`}
      title={optimistic ? t.clickToDeactivate : t.clickToActivate}
    >
      <span className={`flex h-4 w-7 items-center rounded-full px-0.5 transition-colors duration-200 ${optimistic ? "bg-green-500" : "bg-red-400"}`}>
        <span className={`toggle-knob h-3 w-3 rounded-full bg-white ${optimistic ? "ml-auto" : "ml-0"}`} />
      </span>
      {optimistic ? t.active : t.locked}
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
  const { toast } = useToast();

  async function handleDuplicate() {
    setLoading(true);
    try {
      const result = await duplicateProduct(productId);
      if (result.newId) {
        router.push(`/admin/produkte/${result.newId}/bearbeiten`);
      } else {
        toast(result.error || "Fehler beim Duplizieren", "error");
        setLoading(false);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Fehler beim Duplizieren", "error");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className={`btn-press flex h-11 w-11 items-center justify-center rounded-lg text-swing-navy/40 transition-colors hover:bg-blue-50 hover:text-blue-600 sm:h-auto sm:w-auto sm:p-2 ${loading ? "opacity-50" : ""}`}
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!confirm(t.deleteConfirm.replace("{name}", productName))) {
      return;
    }
    setLoading(true);
    try {
      await deleteProduct(productId);
      toast(`"${productName}" gelöscht`, "success");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Fehler beim Löschen", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`btn-press flex h-11 w-11 items-center justify-center rounded-lg text-swing-gray-dark/40 transition-colors hover:bg-red-50 hover:text-red-600 sm:h-auto sm:w-auto sm:p-2 ${loading ? "opacity-50" : ""}`}
      title={t.deleteTitle}
    >
      <Trash2 size={16} />
    </button>
  );
}
