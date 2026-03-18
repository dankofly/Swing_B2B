"use client";

import { useState, useMemo, useId } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import { GripVertical, Pencil, Package, ChevronUp, ChevronDown, Search, X, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { updateProductSortOrder } from "@/lib/actions/products";
import { DeleteProductButton, DuplicateProductButton, ToggleActiveButton } from "./ProductActions";
import { useToast } from "@/components/ui/Toast";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  source: string | null;
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
            <Image src={product.images[0]} alt={product.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" sizes="40px" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-xs text-swing-navy/40">—</div>
          )}
          <span className="font-medium text-swing-navy">{product.name}</span>
          {product.source === "winline_import" && (
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-purple-700">
              <Lock size={9} />
              WinLine
            </span>
          )}
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
          <DuplicateProductButton productId={product.id} />
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </td>
    </tr>
  );
}

function MobileCard({
  product,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  product: ProductRow;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded text-swing-navy/30 transition-colors hover:bg-swing-navy/5 hover:text-swing-navy/60 disabled:cursor-default disabled:text-swing-navy/10"
            title="Nach oben"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded text-swing-navy/30 transition-colors hover:bg-swing-navy/5 hover:text-swing-navy/60 disabled:cursor-default disabled:text-swing-navy/10"
            title="Nach unten"
          >
            <ChevronDown size={18} />
          </button>
        </div>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-xs text-swing-navy/40">—</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="block truncate font-medium text-swing-navy">{product.name}</span>
            {product.source === "winline_import" && (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-purple-100 px-1 py-0.5 text-[9px] font-bold uppercase text-purple-700">
                <Lock size={8} />
                WL
              </span>
            )}
          </div>
          <span className="text-xs text-swing-gray-dark/50">{product.category?.name || "—"}</span>
        </div>
        <ToggleActiveButton productId={product.id} isActive={product.is_active} />
      </div>
      <div className="mt-2.5 flex items-center justify-between pl-12">
        <div className="flex gap-3 text-xs text-swing-gray-dark/40 tabular-nums">
          <span>{product.sizes?.length || 0} Größen</span>
          <span>{product.colors?.length || 0} Farben</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/admin/produkte/${product.id}/lager`} className="flex h-11 w-11 items-center justify-center rounded-lg text-swing-navy/40 transition-colors hover:bg-swing-gold/10" title="Lagerbestand"><Package size={18} /></Link>
          <Link href={`/admin/produkte/${product.id}/bearbeiten`} className="flex h-11 w-11 items-center justify-center rounded-lg text-swing-navy/40 transition-colors hover:bg-swing-gold/10" title="Bearbeiten"><Pencil size={18} /></Link>
          <DuplicateProductButton productId={product.id} />
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function SortableProductList({ products: initialProducts }: { products: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "locked" | "winline">("all");
  const [page, setPage] = useState(1);
  const dndId = useId();
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply status filter
    if (filter === "active") result = result.filter((p) => p.is_active);
    else if (filter === "locked") result = result.filter((p) => !p.is_active);
    else if (filter === "winline") result = result.filter((p) => p.source === "winline_import");

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q) ||
          p.sizes?.some((s) => s.sku.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleMove(oldIndex: number, newIndex: number) {
    if (newIndex < 0 || newIndex >= products.length) return;
    const newOrder = arrayMove(products, oldIndex, newIndex);
    setProducts(newOrder);

    setSaving(true);
    try {
      await updateProductSortOrder(newOrder.map((p) => p.id));
    } catch {
      setProducts(initialProducts);
      toast("Fehler beim Speichern der Reihenfolge", "error");
    } finally {
      setSaving(false);
    }
  }

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
      toast("Fehler beim Speichern der Reihenfolge", "error");
    } finally {
      setSaving(false);
    }
  }

  const isSearching = search.trim().length > 0;

  return (
    <>
      {/* Search bar */}
      <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-swing-navy/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Produkt suchen (Name, Kategorie, SKU)…"
            className="w-full rounded border border-gray-200 py-2 pl-9 pr-9 text-sm text-swing-navy placeholder:text-swing-navy/30 focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-swing-navy/30 hover:text-swing-navy/60"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {(isSearching || filter !== "all") && (
          <p className="mt-1.5 text-[11px] text-swing-navy/40">
            {filteredProducts.length} von {products.length} Produkten
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["all", "active", "locked", "winline"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filter === f
                  ? "bg-swing-navy text-white"
                  : "bg-gray-100 text-swing-navy/50 hover:bg-gray-200 hover:text-swing-navy/70"
              }`}
            >
              {f === "all" ? "Alle" : f === "active" ? "Aktiv" : f === "locked" ? "Gesperrt" : "WinLine-Import"}
            </button>
          ))}
        </div>
      </div>

      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pagedProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {saving && (
            <div className="px-6 py-2 text-center text-xs font-medium text-swing-gold">
              Reihenfolge wird gespeichert...
            </div>
          )}

          {filteredProducts.length === 0 && isSearching ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-swing-navy/40">Keine Produkte gefunden für &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <>
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
                  {pagedProducts.map((product) => (
                    <SortableRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>

              {/* Mobile card layout with arrow buttons */}
              <div className="divide-y divide-gray-50 md:hidden">
                {pagedProducts.map((product, index) => {
                  const globalIndex = (safePage - 1) * PAGE_SIZE + index;
                  return (
                    <MobileCard
                      key={product.id}
                      product={product}
                      isFirst={globalIndex === 0}
                      isLast={globalIndex === filteredProducts.length - 1}
                      onMoveUp={() => handleMove(
                        products.findIndex((p) => p.id === product.id),
                        products.findIndex((p) => p.id === product.id) - 1
                      )}
                      onMoveDown={() => handleMove(
                        products.findIndex((p) => p.id === product.id),
                        products.findIndex((p) => p.id === product.id) + 1
                      )}
                    />
                  );
                })}
              </div>
            </>
          )}
        </SortableContext>
      </DndContext>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-6">
          <p className="text-xs tabular-nums text-swing-navy/40">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredProducts.length)} von {filteredProducts.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-swing-navy/40 transition-colors hover:bg-gray-50 hover:text-swing-navy disabled:cursor-default disabled:text-swing-navy/15"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded px-1 text-xs font-bold tabular-nums transition-colors ${
                  p === safePage
                    ? "bg-swing-navy text-white"
                    : "text-swing-navy/40 hover:bg-gray-50 hover:text-swing-navy"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-swing-navy/40 transition-colors hover:bg-gray-50 hover:text-swing-navy disabled:cursor-default disabled:text-swing-navy/15"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
