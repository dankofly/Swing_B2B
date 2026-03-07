"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Package } from "lucide-react";
import Link from "next/link";
import { updateProductSortOrder } from "@/lib/actions/products";
import { DeleteProductButton, ToggleActiveButton } from "./ProductActions";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  images: string[] | null;
  sort_order: number;
  category: { name: string } | null;
  sizes: { id: string; size_label: string; sku: string; stock_quantity: number }[] | null;
  colors: { id: string; color_name: string }[] | null;
};

function SortableRow({ product }: { product: ProductRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-swing-gold/4 ${isDragging ? "bg-swing-gold/10 shadow-lg" : ""}`}
    >
      <td className="w-10 px-2 py-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1.5 text-swing-navy/25 transition-colors hover:bg-swing-navy/5 hover:text-swing-navy/50 active:cursor-grabbing"
          title="Ziehen zum Sortieren"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-xs text-swing-navy/40">—</div>
          )}
          <span className="font-medium text-swing-navy">{product.name}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-swing-gray-dark/60">{product.category?.name || "—"}</td>
      <td className="px-4 py-4 tabular-nums">{product.sizes?.length || 0} Größen</td>
      <td className="px-4 py-4 tabular-nums">{product.colors?.length || 0} Farben</td>
      <td className="px-4 py-4"><ToggleActiveButton productId={product.id} isActive={product.is_active} /></td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/produkte/${product.id}/lager`} className="rounded-lg p-2 text-swing-navy/40 transition-colors hover:bg-swing-gold/10 hover:text-swing-navy" title="Lagerbestand"><Package size={16} /></Link>
          <Link href={`/admin/produkte/${product.id}/bearbeiten`} className="rounded-lg p-2 text-swing-navy/40 transition-colors hover:bg-swing-gold/10 hover:text-swing-navy" title="Bearbeiten"><Pencil size={16} /></Link>
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </td>
    </tr>
  );
}

function SortableMobileCard({ product }: { product: ProductRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`px-5 py-4 ${isDragging ? "bg-swing-gold/10 shadow-lg" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-swing-navy/25 transition-colors hover:text-swing-navy/50 active:cursor-grabbing"
          title="Ziehen zum Sortieren"
        >
          <GripVertical size={16} />
        </button>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-xs text-swing-navy/40">—</div>
        )}
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-swing-navy">{product.name}</span>
          <span className="text-xs text-swing-gray-dark/50">{product.category?.name || "—"}</span>
        </div>
        <ToggleActiveButton productId={product.id} isActive={product.is_active} />
      </div>
      <div className="mt-2.5 flex items-center justify-between pl-8">
        <div className="flex gap-3 text-xs text-swing-gray-dark/40 tabular-nums">
          <span>{product.sizes?.length || 0} Größen</span>
          <span>{product.colors?.length || 0} Farben</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/admin/produkte/${product.id}/lager`} className="rounded-lg p-2 text-swing-navy/40 transition-colors hover:bg-swing-gold/10" title="Lagerbestand"><Package size={16} /></Link>
          <Link href={`/admin/produkte/${product.id}/bearbeiten`} className="rounded-lg p-2 text-swing-navy/40 transition-colors hover:bg-swing-gold/10" title="Bearbeiten"><Pencil size={16} /></Link>
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}

export default function SortableProductList({ products: initialProducts }: { products: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const newOrder = arrayMove(products, oldIndex, newIndex);
    setProducts(newOrder);

    setSaving(true);
    try {
      await updateProductSortOrder(newOrder.map((p) => p.id));
    } catch {
      setProducts(initialProducts);
      alert("Fehler beim Speichern der Reihenfolge");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        {saving && (
          <div className="px-6 py-2 text-center text-xs font-medium text-swing-gold">
            Reihenfolge wird gespeichert...
          </div>
        )}

        {/* Desktop table */}
        <table className="hidden w-full text-left text-sm md:table">
          <thead>
            <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
              <th className="w-10 px-2 py-3" />
              <th className="px-4 py-3">Produkt</th>
              <th className="px-4 py-3">Kategorie</th>
              <th className="px-4 py-3">Größen</th>
              <th className="px-4 py-3">Farben</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <SortableRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>

        {/* Mobile card layout */}
        <div className="divide-y divide-gray-50 md:hidden">
          {products.map((product) => (
            <SortableMobileCard key={product.id} product={product} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
