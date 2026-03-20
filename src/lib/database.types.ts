export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          name_en: string | null
          name_fr: string | null
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          name_en?: string | null
          name_fr?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          name_en?: string | null
          name_fr?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_product_catalog"
            referencedColumns: ["category_id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          address_city: string | null
          address_country: string | null
          address_street: string | null
          address_zip: string | null
          company_type: string | null
          contact_email: string
          contact_person: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          name: string
          notes: string | null
          phone: string | null
          phone_whatsapp: boolean | null
          sells_miniwings: boolean | null
          sells_paragliders: boolean | null
          sells_parakites: boolean | null
          updated_at: string | null
          vat_id: string | null
        }
        Insert: {
          address?: string | null
          address_city?: string | null
          address_country?: string | null
          address_street?: string | null
          address_zip?: string | null
          company_type?: string | null
          contact_email: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          phone_whatsapp?: boolean | null
          sells_miniwings?: boolean | null
          sells_paragliders?: boolean | null
          sells_parakites?: boolean | null
          updated_at?: string | null
          vat_id?: string | null
        }
        Update: {
          address?: string | null
          address_city?: string | null
          address_country?: string | null
          address_street?: string | null
          address_zip?: string | null
          company_type?: string | null
          contact_email?: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          phone_whatsapp?: boolean | null
          sells_miniwings?: boolean | null
          sells_paragliders?: boolean | null
          sells_parakites?: boolean | null
          updated_at?: string | null
          vat_id?: string | null
        }
        Relationships: []
      }
      company_notes: {
        Row: {
          company_id: string
          content: string | null
          created_at: string | null
          id: string
          subject: string
          visible_to_customer: boolean
        }
        Insert: {
          company_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          subject: string
          visible_to_customer?: boolean
        }
        Update: {
          company_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          subject?: string
          visible_to_customer?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "company_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_inquiry_overview"
            referencedColumns: ["company_id"]
          },
        ]
      }
      customer_prices: {
        Row: {
          company_id: string
          created_at: string | null
          currency: string | null
          discount: number | null
          id: string
          product_size_id: string
          unit_price: number
          updated_at: string | null
          uvp_incl_vat: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          currency?: string | null
          discount?: number | null
          id?: string
          product_size_id: string
          unit_price: number
          updated_at?: string | null
          uvp_incl_vat?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          currency?: string | null
          discount?: number | null
          id?: string
          product_size_id?: string
          unit_price?: number
          updated_at?: string | null
          uvp_incl_vat?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_prices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_prices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_inquiry_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "customer_prices_product_size_id_fkey"
            columns: ["product_size_id"]
            isOneToOne: false
            referencedRelation: "product_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          notes: string | null
          shipping_carrier: string | null
          status: string | null
          status_timestamps: Json | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          shipping_carrier?: string | null
          status?: string | null
          status_timestamps?: Json | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          shipping_carrier?: string | null
          status?: string | null
          status_timestamps?: Json | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_inquiry_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_items: {
        Row: {
          created_at: string | null
          id: string
          inquiry_id: string
          note: string | null
          product_color_id: string | null
          product_size_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiry_id: string
          note?: string | null
          product_color_id?: string | null
          product_size_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiry_id?: string
          note?: string | null
          product_color_id?: string | null
          product_size_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_items_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_items_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "v_inquiry_overview"
            referencedColumns: ["inquiry_id"]
          },
          {
            foreignKeyName: "inquiry_items_product_color_id_fkey"
            columns: ["product_color_id"]
            isOneToOne: false
            referencedRelation: "product_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_items_product_size_id_fkey"
            columns: ["product_size_id"]
            isOneToOne: false
            referencedRelation: "product_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      news_ticker: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message: string
          message_en: string | null
          message_fr: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          message_en?: string | null
          message_fr?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          message_en?: string | null
          message_fr?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      price_uploads: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          error_log: string | null
          file_name: string | null
          file_type: string
          file_url: string
          id: string
          matched_count: number | null
          parse_result: Json | null
          parsed_data: Json | null
          status: string
          total_count: number | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          error_log?: string | null
          file_name?: string | null
          file_type?: string
          file_url: string
          id?: string
          matched_count?: number | null
          parse_result?: Json | null
          parsed_data?: Json | null
          status?: string
          total_count?: number | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          error_log?: string | null
          file_name?: string | null
          file_type?: string
          file_url?: string
          id?: string
          matched_count?: number | null
          parse_result?: Json | null
          parsed_data?: Json | null
          status?: string
          total_count?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_uploads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_uploads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_inquiry_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "price_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors: {
        Row: {
          classification: string | null
          color_image_url: string | null
          color_name: string
          created_at: string | null
          id: string
          is_limited: boolean
          product_id: string
          slogan: string | null
          sort_order: number | null
        }
        Insert: {
          classification?: string | null
          color_image_url?: string | null
          color_name: string
          created_at?: string | null
          id?: string
          is_limited?: boolean
          product_id: string
          slogan?: string | null
          sort_order?: number | null
        }
        Update: {
          classification?: string | null
          color_image_url?: string | null
          color_name?: string
          created_at?: string | null
          id?: string
          is_limited?: boolean
          product_id?: string
          slogan?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_relations: {
        Row: {
          created_at: string
          id: string
          product_id: string
          related_product_id: string
          relation_type: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          related_product_id: string
          relation_type: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          related_product_id?: string
          relation_type?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_catalog"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "v_product_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          canonical_key: string | null
          created_at: string | null
          delivery_days: number | null
          id: string
          product_id: string
          size_label: string
          sku: string
          sort_order: number | null
          stock_quantity: number | null
        }
        Insert: {
          canonical_key?: string | null
          created_at?: string | null
          delivery_days?: number | null
          id?: string
          product_id: string
          size_label: string
          sku: string
          sort_order?: number | null
          stock_quantity?: number | null
        }
        Update: {
          canonical_key?: string | null
          created_at?: string | null
          delivery_days?: number | null
          id?: string
          product_id?: string
          size_label?: string
          sku?: string
          sort_order?: number | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_product_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          action_end: string | null
          action_start: string | null
          action_text: string | null
          action_text_en: string | null
          action_text_fr: string | null
          category_id: string | null
          classification: string | null
          created_at: string | null
          description: string | null
          description_en: string | null
          description_fr: string | null
          en_class: string | null
          en_class_custom: string | null
          id: string
          images: string[] | null
          is_action: boolean
          is_active: boolean | null
          is_coming_soon: boolean
          is_fade_out: boolean
          is_preorder: boolean
          name: string
          name_en: string | null
          name_fr: string | null
          slug: string
          sort_order: number
          source: string | null
          tech_specs: Json | null
          updated_at: string | null
          use_case: string | null
          use_case_en: string | null
          use_case_fr: string | null
          uvp_brutto: number | null
          website_url: string | null
          website_url_en: string | null
          website_url_fr: string | null
        }
        Insert: {
          action_end?: string | null
          action_start?: string | null
          action_text?: string | null
          action_text_en?: string | null
          action_text_fr?: string | null
          category_id?: string | null
          classification?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          en_class?: string | null
          en_class_custom?: string | null
          id?: string
          images?: string[] | null
          is_action?: boolean
          is_active?: boolean | null
          is_coming_soon?: boolean
          is_fade_out?: boolean
          is_preorder?: boolean
          name: string
          name_en?: string | null
          name_fr?: string | null
          slug: string
          sort_order?: number
          source?: string | null
          tech_specs?: Json | null
          updated_at?: string | null
          use_case?: string | null
          use_case_en?: string | null
          use_case_fr?: string | null
          uvp_brutto?: number | null
          website_url?: string | null
          website_url_en?: string | null
          website_url_fr?: string | null
        }
        Update: {
          action_end?: string | null
          action_start?: string | null
          action_text?: string | null
          action_text_en?: string | null
          action_text_fr?: string | null
          category_id?: string | null
          classification?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          en_class?: string | null
          en_class_custom?: string | null
          id?: string
          images?: string[] | null
          is_action?: boolean
          is_active?: boolean | null
          is_coming_soon?: boolean
          is_fade_out?: boolean
          is_preorder?: boolean
          name?: string
          name_en?: string | null
          name_fr?: string | null
          slug?: string
          sort_order?: number
          source?: string | null
          tech_specs?: Json | null
          updated_at?: string | null
          use_case?: string | null
          use_case_en?: string | null
          use_case_fr?: string | null
          uvp_brutto?: number | null
          website_url?: string | null
          website_url_en?: string | null
          website_url_fr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_product_catalog"
            referencedColumns: ["category_id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "v_inquiry_overview"
            referencedColumns: ["company_id"]
          },
        ]
      }
      stock_imports: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          matched_count: number | null
          parsed_data: Json | null
          status: string | null
          total_count: number | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          matched_count?: number | null
          parsed_data?: Json | null
          status?: string | null
          total_count?: number | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          matched_count?: number | null
          parsed_data?: Json | null
          status?: string | null
          total_count?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_imports_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_inquiry_overview: {
        Row: {
          company_id: string | null
          company_name: string | null
          created_at: string | null
          inquiry_id: string | null
          item_count: number | null
          notes: string | null
          shipping_carrier: string | null
          status: string | null
          total_value: number | null
          tracking_number: string | null
          user_email: string | null
          user_name: string | null
        }
        Relationships: []
      }
      v_product_catalog: {
        Row: {
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          classification: string | null
          description: string | null
          en_class: string | null
          images: string[] | null
          is_active: boolean | null
          name: string | null
          product_id: string | null
          sizes: Json | null
          slug: string | null
          use_case: string | null
          uvp_brutto: number | null
          website_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      user_company_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
