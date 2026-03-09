"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";

interface RelationItem {
  related_product_id: string;
  relation_type: "similar" | "accessory";
  sort_order: number;
  name?: string;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface RelatedProductsPickerProps {
  productId?: string;
  initialRelations: RelationItem[];
  labels: {
    relatedProducts: string;
    similarProducts: string;
    accessories: string;
    searchProducts: string;
    noRelatedProducts: string;
  };
}

export default function RelatedProductsPicker({
  productId,
  initialRelations,
  labels,
}: RelatedProductsPickerProps) {
  const [relations, setRelations] = useState<RelationItem[]>(initialRelations);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"similar" | "accessory">("similar");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(query: string) {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products-search?q=${encodeURIComponent(query)}&exclude=${productId || ""}`);
        const data = await res.json();
        setSearchResults(data.products || []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
  }

  function addRelation(product: ProductOption) {
    const exists = relations.some((r) => r.related_product_id === product.id);
    if (exists) return;
    setRelations([
      ...relations,
      {
        related_product_id: product.id,
        relation_type: activeTab,
        sort_order: relations.filter((r) => r.relation_type === activeTab).length,
        name: product.name,
      },
    ]);
    setSearchQuery("");
    setShowDropdown(false);
  }

  function removeRelation(relatedId: string) {
    setRelations(relations.filter((r) => r.related_product_id !== relatedId));
  }

  const similar = relations.filter((r) => r.relation_type === "similar");
  const accessories = relations.filter((r) => r.relation_type === "accessory");

  return (
    <div className="rounded bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-swing-navy">
        {labels.relatedProducts}
      </h2>

      <input
        type="hidden"
        name="relations"
        value={JSON.stringify(
          relations.map(({ related_product_id, relation_type, sort_order }) => ({
            related_product_id,
            relation_type,
            sort_order,
          }))
        )}
      />

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-swing-gray-light p-1">
        <button
          type="button"
          onClick={() => setActiveTab("similar")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === "similar"
              ? "bg-white text-swing-navy shadow-sm"
              : "text-swing-gray-dark/60 hover:text-swing-navy"
          }`}
        >
          {labels.similarProducts} ({similar.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("accessory")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === "accessory"
              ? "bg-white text-swing-navy shadow-sm"
              : "text-swing-gray-dark/60 hover:text-swing-navy"
          }`}
        >
          {labels.accessories} ({accessories.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4" ref={dropdownRef}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={labels.searchProducts}
            className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>
          )}
        </div>
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
            {searchResults.map((p) => {
              const alreadyAdded = relations.some((r) => r.related_product_id === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => addRelation(p)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    alreadyAdded
                      ? "bg-gray-50 text-gray-400"
                      : "hover:bg-swing-gold/10"
                  }`}
                >
                  <Plus size={14} className={alreadyAdded ? "text-gray-300" : "text-swing-gold"} />
                  <span>{p.name}</span>
                  {alreadyAdded && <span className="ml-auto text-[10px] text-gray-400">bereits zugeordnet</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* List */}
      {(activeTab === "similar" ? similar : accessories).length === 0 ? (
        <p className="text-sm text-swing-gray-dark/60">{labels.noRelatedProducts}</p>
      ) : (
        <div className="space-y-2">
          {(activeTab === "similar" ? similar : accessories).map((rel) => (
            <div
              key={rel.related_product_id}
              className="flex items-center justify-between rounded border border-gray-200 bg-swing-gray-light px-3 py-2"
            >
              <span className="text-sm font-medium text-swing-navy">
                {rel.name || rel.related_product_id}
              </span>
              <button
                type="button"
                onClick={() => removeRelation(rel.related_product_id)}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
