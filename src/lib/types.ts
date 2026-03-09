export interface Category {
  id: string;
  name: string;
  name_en?: string | null;
  name_fr?: string | null;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  name_en?: string | null;
  name_fr?: string | null;
  description: string | null;
  description_en?: string | null;
  description_fr?: string | null;
  tech_specs: Record<string, string>;
  images: string[];
  uvp_brutto: number | null;
  is_active: boolean;
  is_coming_soon: boolean;
  is_preorder: boolean;
  is_fade_out: boolean;
  is_action: boolean;
  action_text: string | null;
  action_start: string | null;
  action_end: string | null;
  en_class?: string | null;
  en_class_custom?: string | null;
  classification: string | null;
  use_case: string | null;
  use_case_en?: string | null;
  use_case_fr?: string | null;
  action_text_en?: string | null;
  action_text_fr?: string | null;
  website_url: string | null;
  created_at: string;
  category?: Category;
  sizes?: ProductSize[];
  colors?: ProductColor[];
}

export interface ProductSize {
  id: string;
  product_id: string;
  size_label: string;
  sku: string;
  stock_quantity: number;
  delivery_days: number;
  sort_order: number;
}

export interface ColorSizeStock {
  id: string;
  product_id: string;
  color_name: string;
  size_label: string;
  stock_quantity: number;
  updated_at: string;
}

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_image_url: string | null;
  slogan: string | null;
  classification: string | null;
  is_limited: boolean;
  sort_order: number;
}
