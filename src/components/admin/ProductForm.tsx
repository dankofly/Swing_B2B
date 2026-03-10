"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, X, Languages, Loader2, Check, AlertCircle } from "lucide-react";
import type { Product, ProductSize, ProductColor, Category } from "@/lib/types";
import { useDict } from "@/lib/i18n/context";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";
import RelatedProductsPicker from "./RelatedProductsPicker";

interface RelationInput {
  related_product_id: string;
  relation_type: "similar" | "accessory";
  sort_order: number;
  name?: string;
}

interface SizeInput {
  size_label: string;
  sku: string;
  delivery_weeks: number;
  sort_order: number;
}

interface ColorInput {
  color_name: string;
  color_image_url: string | null;
  is_limited: boolean;
  sort_order: number;
}

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  product?: Product;
  sizes?: ProductSize[];
  colors?: ProductColor[];
  relations?: RelationInput[];
}

export default function ProductForm({
  action,
  categories,
  product,
  sizes: initialSizes,
  colors: initialColors,
  relations: initialRelations,
}: ProductFormProps) {
  const dict = useDict();
  const tf = dict.admin.products.form;
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sizes, setSizes] = useState<SizeInput[]>(
    initialSizes?.map((s) => ({
      size_label: s.size_label,
      sku: s.sku,
      delivery_weeks: Math.round((s.delivery_days || 0) / 7),
      sort_order: s.sort_order,
    })) || []
  );

  const [colors, setColors] = useState<ColorInput[]>(
    initialColors?.map((c) => ({
      color_name: c.color_name,
      color_image_url: c.color_image_url,
      is_limited: c.is_limited ?? false,
      sort_order: c.sort_order,
    })) || []
  );

  const [uploadingColorIndex, setUploadingColorIndex] = useState<number | null>(null);
  const [colorUploadError, setColorUploadError] = useState<string | null>(null);

  // i18n translation state
  const [nameEn, setNameEn] = useState(product?.name_en || "");
  const [nameFr, setNameFr] = useState(product?.name_fr || "");
  const [descEn, setDescEn] = useState(product?.description_en || "");
  const [descFr, setDescFr] = useState(product?.description_fr || "");
  const [useCaseEn, setUseCaseEn] = useState(product?.use_case_en || "");
  const [useCaseFr, setUseCaseFr] = useState(product?.use_case_fr || "");
  const [actionTextEn, setActionTextEn] = useState(product?.action_text_en || "");
  const [actionTextFr, setActionTextFr] = useState(product?.action_text_fr || "");
  const [activeTab, setActiveTab] = useState<"de" | "en" | "fr">("de");
  const [translatingLocale, setTranslatingLocale] = useState<"idle" | "en" | "fr" | "done" | "error">("idle");
  const [translateError, setTranslateError] = useState("");

  // Controlled DE text fields (so they're always in the form)
  const [descDe, setDescDe] = useState(product?.description || "");
  const [useCaseDe, setUseCaseDe] = useState(product?.use_case || "");
  const [actionTextDe, setActionTextDe] = useState(product?.action_text || "");

  // Controlled website URL fields per language
  const [websiteUrlDe, setWebsiteUrlDe] = useState(product?.website_url || "");
  const [websiteUrlEn, setWebsiteUrlEn] = useState(product?.website_url_en || "");
  const [websiteUrlFr, setWebsiteUrlFr] = useState(product?.website_url_fr || "");

  async function handleAutoTranslate(locale: "en" | "fr") {
    setTranslatingLocale(locale);
    setTranslateError("");

    const form = document.querySelector("form") as HTMLFormElement;
    const fd = new FormData(form);
    const currentName = fd.get("name") as string;
    const currentDesc = fd.get("description") as string;
    const currentUseCase = fd.get("use_case") as string;
    const currentActionText = fd.get("action_text") as string;

    try {
      const res = await fetch("/api/translate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentName,
          description: currentDesc,
          use_case: currentUseCase,
          action_text: currentActionText,
          targetLocale: locale,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Translation failed`);
      }
      const { translated } = await res.json();
      if (locale === "en") {
        if (translated.name) setNameEn(translated.name);
        if (translated.description) setDescEn(translated.description);
        if (translated.use_case) setUseCaseEn(translated.use_case);
        if (translated.action_text) setActionTextEn(translated.action_text);
      } else {
        if (translated.name) setNameFr(translated.name);
        if (translated.description) setDescFr(translated.description);
        if (translated.use_case) setUseCaseFr(translated.use_case);
        if (translated.action_text) setActionTextFr(translated.action_text);
      }
      setTranslatingLocale("done");
      setTimeout(() => setTranslatingLocale("idle"), 3000);
    } catch (err) {
      setTranslatingLocale("error");
      setTranslateError(err instanceof Error ? err.message : "Translation failed");
      setTimeout(() => { setTranslatingLocale("idle"); setTranslateError(""); }, 5000);
    }
  }

  function resizeImageToPng(file: File, targetSize: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not available"));

        // Transparent background (default for canvas)
        ctx.clearRect(0, 0, targetSize, targetSize);

        // Fit image into square without cropping
        const { width, height } = img;
        const ratio = Math.min(targetSize / width, targetSize / height);
        const drawWidth = Math.round(width * ratio);
        const drawHeight = Math.round(height * ratio);
        const offsetX = Math.round((targetSize - drawWidth) / 2);
        const offsetY = Math.round((targetSize - drawHeight) / 2);

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("PNG conversion failed"))),
          "image/png"
        );
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = URL.createObjectURL(file);
    });
  }

  function addSize() {
    setSizes([...sizes, { size_label: "", sku: "", delivery_weeks: 2, sort_order: sizes.length }]);
  }

  function removeSize(index: number) {
    setSizes(sizes.filter((_, i) => i !== index));
  }

  function updateSize(index: number, field: keyof SizeInput, value: string) {
    const updated = [...sizes];
    if (field === "sort_order" || field === "delivery_weeks") {
      updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSizes(updated);
  }

  function addColor() {
    setColors([
      ...colors,
      { color_name: "", color_image_url: null, is_limited: false, sort_order: colors.length },
    ]);
  }

  function removeColor(index: number) {
    setColors(colors.filter((_, i) => i !== index));
  }

  function updateColor(index: number, field: keyof ColorInput, value: string | null) {
    const updated = [...colors];
    if (field === "sort_order") {
      updated[index] = { ...updated[index], [field]: parseInt(value as string) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value as string };
    }
    setColors(updated);
  }

  async function handleColorImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    colorIndex: number
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColorIndex(colorIndex);
    setColorUploadError(null);

    try {
      const pngBlob = await resizeImageToPng(file, 120);

      const formData = new FormData();
      formData.append("file", pngBlob, "pictogram.png");

      const res = await fetch("/api/upload-color-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setColorUploadError(`Upload failed: ${data.error}`);
      } else {
        updateColor(colorIndex, "color_image_url", data.url);
      }
    } catch (err) {
      setColorUploadError(err instanceof Error ? err.message : "Upload failed");
    }

    setUploadingColorIndex(null);
    e.target.value = "";
  }

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        setFormError(null);
        try {
          await action(formData);
        } catch (err) {
          setFormError(err instanceof Error ? err.message : tf.saveError);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-8"
    >
      {/* Hidden fields for arrays */}
      <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />

      {/* Basic info */}
      <div className="rounded bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-swing-navy">
          {tf.basicData}
        </h2>
        <div className="space-y-4">
          {/* Produktname */}
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.productName} *
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={product?.name}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="z.B. Mirage 2 RS"
            />
          </div>

          {/* Dropdowns links, Checkboxen rechts */}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            {/* Linke Spalte: Dropdowns */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
                  {tf.category}
                </label>
                <select
                  name="category_id"
                  defaultValue={product?.category_id || ""}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
                >
                  <option value="">{tf.noCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
                  {tf.weightClass}
                </label>
                <select
                  name="classification"
                  defaultValue={product?.classification || ""}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
                >
                  <option value="">{tf.none}</option>
                  <option value="D-LITE">D-LITE</option>
                  <option value="U-LITE">U-LITE</option>
                  <option value="N-LITE">N-LITE</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
                  {tf.enClass}
                </label>
                <select
                  name="en_class"
                  defaultValue={product?.en_class || ""}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
                >
                  <option value="">{tf.none}</option>
                  <option value="EN-A">EN-A</option>
                  <option value="EN-A/B">EN-A/B</option>
                  <option value="LOW EN-B">LOW EN-B</option>
                  <option value="MID EN-B">MID EN-B</option>
                  <option value="HIGH EN-B">HIGH EN-B</option>
                  <option value="EN-C 2-Liner">EN-C 2-Liner</option>
                  <option value="EN-D 2-Liner">EN-D 2-Liner</option>
                  <option value="EN-926-1">EN-926-1</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
                  {tf.enClassCustom}
                </label>
                <input
                  name="en_class_custom"
                  type="text"
                  defaultValue={product?.en_class_custom || ""}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
                  placeholder={tf.enClassCustomPlaceholder}
                />
              </div>
            </div>

            {/* Rechte Spalte: Checkboxen */}
            <div className="flex flex-col justify-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={product?.is_active ?? true}
                  className="rounded border-gray-300 accent-swing-gold"
                />
                {tf.isActive}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_coming_soon"
                  type="checkbox"
                  defaultChecked={product?.is_coming_soon ?? false}
                  className="rounded border-gray-300 accent-swing-navy"
                />
                {tf.isComingSoon}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_preorder"
                  type="checkbox"
                  defaultChecked={product?.is_preorder ?? false}
                  className="rounded border-gray-300 accent-swing-gold"
                />
                {tf.isPreorder}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_fade_out"
                  type="checkbox"
                  defaultChecked={product?.is_fade_out ?? false}
                  className="rounded border-gray-300 accent-red-500"
                />
                {tf.isFadeOut}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Content & Translations – Tabbed */}
      <div className="rounded bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Languages size={18} className="text-swing-navy" />
          <h2 className="text-lg font-semibold text-swing-navy">
            {tf.description} & {tf.translations}
          </h2>
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex border-b border-gray-200">
          {(["de", "en", "fr"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
                activeTab === tab
                  ? "text-swing-navy after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-swing-gold"
                  : "text-swing-gray-dark/40 hover:text-swing-navy/60"
              }`}
            >
              {tab === "de" ? "Deutsch" : tab === "en" ? "English" : "Français"}
              {tab !== "de" && (
                (tab === "en" ? nameEn : nameFr) ? (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                ) : (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gray-300" />
                )
              )}
            </button>
          ))}
        </div>

        {translateError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {translateError}
          </div>
        )}

        {/* DE Tab */}
        <div className={activeTab === "de" ? "space-y-4" : "hidden"}>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.useCase}
            </label>
            <input
              name="use_case"
              type="text"
              value={useCaseDe}
              onChange={(e) => setUseCaseDe(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder={tf.useCasePlaceholder}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.description}
            </label>
            <textarea
              name="description"
              rows={4}
              value={descDe}
              onChange={(e) => setDescDe(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder={tf.descriptionPlaceholder}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-700">
              {tf.actionText}
            </label>
            <textarea
              name="action_text"
              rows={2}
              value={actionTextDe}
              onChange={(e) => setActionTextDe(e.target.value)}
              className="w-full rounded border border-orange-300 bg-white px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder={tf.actionTextPlaceholder}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.websiteLink}
            </label>
            <input
              name="website_url"
              type="url"
              value={websiteUrlDe}
              onChange={(e) => setWebsiteUrlDe(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="https://swing.de/produkt/..."
            />
          </div>
        </div>

        {/* EN Tab */}
        <div className={activeTab === "en" ? "space-y-4" : "hidden"}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-swing-gray-dark/50">
              {tf.translateFrom}
            </p>
            <div className="flex items-center gap-1">
              <AiInfoTooltip
                action={tf.autoTranslateTooltip}
                costNote={tf.autoTranslateCost}
              />
              <button
                type="button"
                onClick={() => handleAutoTranslate("en")}
                disabled={translatingLocale !== "idle" && translatingLocale !== "done" && translatingLocale !== "error"}
                className={`flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                  translatingLocale === "done"
                    ? "bg-green-100 text-green-700"
                    : translatingLocale === "error"
                      ? "bg-red-100 text-red-700"
                      : translatingLocale === "en"
                        ? "animate-pulse bg-blue-100 text-blue-600"
                        : "bg-swing-gold text-swing-navy hover:bg-swing-gold-dark"
                }`}
              >
                {translatingLocale === "en" ? (
                  <><Loader2 size={12} className="animate-spin" /> Translating...</>
                ) : translatingLocale === "done" ? (
                  <><Check size={12} /> OK</>
                ) : translatingLocale === "error" ? (
                  <><AlertCircle size={12} /> Error</>
                ) : (
                  <><Languages size={12} /> Auto-Translate EN</>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.productName}
            </label>
            <input
              name="name_en"
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="English product name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.useCase}
            </label>
            <input
              name="use_case_en"
              type="text"
              value={useCaseEn}
              onChange={(e) => setUseCaseEn(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="e.g. XC & Competition"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.description}
            </label>
            <textarea
              name="description_en"
              rows={4}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="English description"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-700">
              {tf.actionText}
            </label>
            <textarea
              name="action_text_en"
              rows={2}
              value={actionTextEn}
              onChange={(e) => setActionTextEn(e.target.value)}
              className="w-full rounded border border-orange-300 bg-white px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="English action text"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.websiteLink}
            </label>
            <input
              name="website_url_en"
              type="url"
              value={websiteUrlEn}
              onChange={(e) => setWebsiteUrlEn(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="https://swing.de/en/product/..."
            />
          </div>
        </div>

        {/* FR Tab */}
        <div className={activeTab === "fr" ? "space-y-4" : "hidden"}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-swing-gray-dark/50">
              {tf.translateFrom}
            </p>
            <div className="flex items-center gap-1">
              <AiInfoTooltip
                action={tf.autoTranslateTooltipFr}
                costNote={tf.autoTranslateCost}
              />
              <button
                type="button"
                onClick={() => handleAutoTranslate("fr")}
                disabled={translatingLocale !== "idle" && translatingLocale !== "done" && translatingLocale !== "error"}
                className={`flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                  translatingLocale === "done"
                    ? "bg-green-100 text-green-700"
                    : translatingLocale === "error"
                      ? "bg-red-100 text-red-700"
                      : translatingLocale === "fr"
                        ? "animate-pulse bg-blue-100 text-blue-600"
                        : "bg-swing-gold text-swing-navy hover:bg-swing-gold-dark"
                }`}
              >
                {translatingLocale === "fr" ? (
                  <><Loader2 size={12} className="animate-spin" /> Traduction...</>
                ) : translatingLocale === "done" ? (
                  <><Check size={12} /> OK</>
                ) : translatingLocale === "error" ? (
                  <><AlertCircle size={12} /> Erreur</>
                ) : (
                  <><Languages size={12} /> Auto-Translate FR</>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.productName}
            </label>
            <input
              name="name_fr"
              type="text"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="Nom du produit en français"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.useCase}
            </label>
            <input
              name="use_case_fr"
              type="text"
              value={useCaseFr}
              onChange={(e) => setUseCaseFr(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="p.ex. XC & Compétition"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.description}
            </label>
            <textarea
              name="description_fr"
              rows={4}
              value={descFr}
              onChange={(e) => setDescFr(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="Description en français"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-700">
              {tf.actionText}
            </label>
            <textarea
              name="action_text_fr"
              rows={2}
              value={actionTextFr}
              onChange={(e) => setActionTextFr(e.target.value)}
              className="w-full rounded border border-orange-300 bg-white px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="Texte d'action en français"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
              {tf.websiteLink}
            </label>
            <input
              name="website_url_fr"
              type="url"
              value={websiteUrlFr}
              onChange={(e) => setWebsiteUrlFr(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
              placeholder="https://swing.de/fr/produit/..."
            />
          </div>
        </div>
      </div>

      {/* Action / Sale Section */}
      <div className="rounded border border-orange-200 bg-orange-50/50 p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-orange-700">
            {tf.actionSection}
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="is_action"
              type="checkbox"
              defaultChecked={product?.is_action ?? false}
              className="rounded border-gray-300 accent-orange-500"
            />
            {tf.isAction}
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-700">
              {tf.actionStart}
            </label>
            <input
              name="action_start"
              type="datetime-local"
              defaultValue={product?.action_start ? product.action_start.slice(0, 16) : ""}
              className="w-full rounded border border-orange-300 bg-white px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-700">
              {tf.actionEnd}
            </label>
            <input
              name="action_end"
              type="datetime-local"
              defaultValue={product?.action_end ? product.action_end.slice(0, 16) : ""}
              className="w-full rounded border border-orange-300 bg-white px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
            />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="rounded bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swing-navy">
            {tf.sizes}
          </h2>
          <button
            type="button"
            onClick={addSize}
            className="flex items-center gap-1 rounded bg-swing-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-swing-navy/80"
          >
            <Plus size={14} />
            {tf.addSize}
          </button>
        </div>
        {sizes.length === 0 ? (
          <p className="text-sm text-swing-gray-dark/60">
            {tf.noSizes}
          </p>
        ) : (
          <div className="space-y-3">
            <div className="hidden items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-swing-gray-dark/40 sm:flex">
              <span className="w-32">{tf.sizeName}</span>
              <span className="flex-1">{tf.sku}</span>
              <span className="w-36">{tf.deliveryTime}</span>
              <span className="w-8" />
            </div>
            {sizes.map((size, i) => (
              <div key={i} className="flex flex-col gap-2 rounded border border-gray-100 p-3 sm:flex-row sm:items-center sm:gap-3 sm:border-0 sm:p-0">
                <input
                  value={size.size_label}
                  onChange={(e) => updateSize(i, "size_label", e.target.value)}
                  placeholder={tf.sizeNamePlaceholder}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold sm:w-32"
                />
                <input
                  value={size.sku}
                  onChange={(e) => updateSize(i, "sku", e.target.value)}
                  placeholder={tf.skuPlaceholder}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold sm:flex-1"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={size.delivery_weeks}
                    onChange={(e) => updateSize(i, "delivery_weeks", e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold sm:w-36 sm:flex-initial"
                    title="Lieferzeit wenn nicht auf Lager"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <option key={w} value={w}>
                        {w} {tf.weeks}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSize(i)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="rounded bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swing-navy">
            {tf.colors}
          </h2>
          <button
            type="button"
            onClick={addColor}
            className="flex items-center gap-1 rounded bg-swing-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-swing-navy/80"
          >
            <Plus size={14} />
            {tf.addColor}
          </button>
        </div>
        {colorUploadError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {colorUploadError}
          </div>
        )}
        {colors.length === 0 ? (
          <p className="text-sm text-swing-gray-dark/60">
            {tf.noColors}
          </p>
        ) : (
          <div className="space-y-4">
            {colors.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-3 rounded border border-gray-200 bg-swing-gray-light p-4 sm:flex-row sm:items-start sm:gap-4">
                {/* Piktogramm Upload */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-swing-gray-dark">{tf.pictogram}</span>
                  {color.color_image_url ? (
                    <div className="group relative h-30 w-30" style={{ backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\"><rect width=\"8\" height=\"8\" fill=\"%23eee\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" fill=\"%23eee\"/></svg>')", backgroundSize: "16px 16px" }}>
                      <img
                        src={color.color_image_url}
                        alt={color.color_name || "Farbpiktogramm"}
                        className="h-full w-full rounded border border-gray-200 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => updateColor(i, "color_image_url", null)}
                        className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-0.5 text-white shadow group-hover:block"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex h-30 w-30 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed ${uploadingColorIndex === i ? "border-swing-gold bg-swing-gold/5" : "border-gray-300 hover:border-swing-gold hover:bg-swing-gold/5"} text-gray-400 transition-colors`}>
                      {uploadingColorIndex === i ? (
                        <span className="text-xs text-swing-gold">{tf.uploading}</span>
                      ) : (
                        <>
                          <Upload size={18} className="text-gray-400" />
                          <span className="mt-1 text-[10px] leading-tight text-center">{tf.uploadImage}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => handleColorImageUpload(e, i)}
                        className="hidden"
                        disabled={uploadingColorIndex === i}
                      />
                    </label>
                  )}
                </div>

                {/* Farbname + Limited + Löschen */}
                <div className="flex flex-1 flex-col gap-2 pt-5">
                  <div className="flex items-center gap-3">
                    <input
                      value={color.color_name}
                      onChange={(e) => updateColor(i, "color_name", e.target.value)}
                      placeholder={tf.colorNamePlaceholder}
                      className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(i)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Farbdesign entfernen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-swing-gray-dark/70">
                    <input
                      type="checkbox"
                      checked={color.is_limited}
                      onChange={(e) => {
                        const updated = [...colors];
                        updated[i] = { ...updated[i], is_limited: e.target.checked };
                        setColors(updated);
                      }}
                      className="accent-swing-gold"
                    />
                    {tf.limitedEdition}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products / Upsell */}
      <RelatedProductsPicker
        productId={product?.id}
        initialRelations={initialRelations || []}
        labels={{
          relatedProducts: tf.relatedProducts,
          similarProducts: tf.similarProducts,
          accessories: tf.accessories,
          searchProducts: tf.searchProducts,
          noRelatedProducts: tf.noRelatedProducts,
        }}
      />

      {/* Error */}
      {formError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-swing-gold px-6 py-2.5 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50 sm:w-auto"
        >
          {submitting ? tf.saving : product ? tf.save : tf.createProduct}
        </button>
        <a
          href="/admin/produkte"
          className="block rounded border border-gray-300 px-6 py-2.5 text-center text-sm text-swing-gray-dark hover:bg-gray-50 sm:inline-block"
        >
          {tf.cancel}
        </a>
      </div>
    </form>
  );
}
