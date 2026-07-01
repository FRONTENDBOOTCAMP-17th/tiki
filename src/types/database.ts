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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      category: {
        Row: {
          category_id: string
          category_name: string
          created_at: string
          display_order: number
          icon_key: string
          is_active: boolean
          slug: string
        }
        Insert: {
          category_id: string
          category_name: string
          created_at?: string
          display_order?: number
          icon_key: string
          is_active?: boolean
          slug: string
        }
        Update: {
          category_id?: string
          category_name?: string
          created_at?: string
          display_order?: number
          icon_key?: string
          is_active?: boolean
          slug?: string
        }
        Relationships: []
      }
      event: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          duration: number | null
          end_date: string
          event_id: string
          intermission: number | null
          seller_id: string
          start_date: string
          start_time: string
          status: string
          thumbnail: string
          title: string
          updated_at: string
          venue_address: string
          venue_detail_address: string | null
          venue_name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          end_date: string
          event_id?: string
          intermission?: number | null
          seller_id: string
          start_date: string
          start_time: string
          status?: string
          thumbnail: string
          title: string
          updated_at?: string
          venue_address: string
          venue_detail_address?: string | null
          venue_name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          end_date?: string
          event_id?: string
          intermission?: number | null
          seller_id?: string
          start_date?: string
          start_time?: string
          status?: string
          thumbnail?: string
          title?: string
          updated_at?: string
          venue_address?: string
          venue_detail_address?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["category_id"]
          },
        ]
      }
      event_image: {
        Row: {
          created_at: string
          event_id: string
          image_id: string
          order: number | null
          url: string
        }
        Insert: {
          created_at?: string
          event_id?: string
          image_id?: string
          order?: number | null
          url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          image_id?: string
          order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_image_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
        ]
      }
      order_seat: {
        Row: {
          held_until: string | null
          order_id: string
          seat_id: string
          slot_id: string
          status: string
        }
        Insert: {
          held_until?: string | null
          order_id: string
          seat_id: string
          slot_id: string
          status?: string
        }
        Update: {
          held_until?: string | null
          order_id?: string
          seat_id?: string
          slot_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_seat_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_seat_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seat"
            referencedColumns: ["seat_id"]
          },
          {
            foreignKeyName: "order_seat_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slot"
            referencedColumns: ["slot_id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          event_id: string
          order_id: string
          quantity: number
          slot_id: string | null
          status: string
          ticket_grade_id: string | null
          total_price: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          order_id?: string
          quantity?: number
          slot_id?: string | null
          status?: string
          ticket_grade_id?: string | null
          total_price: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          order_id?: string
          quantity?: number
          slot_id?: string | null
          status?: string
          ticket_grade_id?: string | null
          total_price?: number
          user_id?: string
        }
        Relationships: []
      }
      seat: {
        Row: {
          grade_id: string | null
          group_name: string | null
          label: string
          layout_id: string
          pos_x: number
          pos_y: number
          seat_id: string
        }
        Insert: {
          grade_id?: string | null
          group_name?: string | null
          label: string
          layout_id: string
          pos_x: number
          pos_y: number
          seat_id?: string
        }
        Update: {
          grade_id?: string | null
          group_name?: string | null
          label?: string
          layout_id?: string
          pos_x?: number
          pos_y?: number
          seat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "ticket_grade"
            referencedColumns: ["grade_id"]
          },
          {
            foreignKeyName: "seat_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "seat_layout"
            referencedColumns: ["layout_id"]
          },
        ]
      }
      seat_layout: {
        Row: {
          created_at: string
          event_id: string
          layout_id: string
          stage_height: number
          stage_width: number
          stage_x: number
          stage_y: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          layout_id?: string
          stage_height?: number
          stage_width?: number
          stage_x?: number
          stage_y?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          layout_id?: string
          stage_height?: number
          stage_width?: number
          stage_x?: number
          stage_y?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_layout_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          created_at: string
          id: string
          organizer_name: string
          store_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          organizer_name: string
          store_name: string
        }
        Update: {
          created_at?: string
          id?: string
          organizer_name?: string
          store_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_stores: {
        Row: {
          address: string | null
          bank_account_number: string | null
          bank_holder_name: string | null
          bank_name: string | null
          bank_verified: boolean | null
          business_number: string | null
          created_at: string | null
          description: string | null
          email: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          bank_account_number?: string | null
          bank_holder_name?: string | null
          bank_name?: string | null
          bank_verified?: boolean | null
          business_number?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          bank_account_number?: string | null
          bank_holder_name?: string | null
          bank_name?: string | null
          bank_verified?: boolean | null
          business_number?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_stores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_request: {
        Row: {
          settlement_id: string
          seller_id: string
          period_start: string
          period_end: string
          gross: number
          fee: number
          net: number
          status: string
          requested_at: string
          approved_at: string | null
        }
        Insert: {
          settlement_id?: string
          seller_id: string
          period_start: string
          period_end: string
          gross?: number
          fee?: number
          net?: number
          status?: string
          requested_at?: string
          approved_at?: string | null
        }
        Update: {
          settlement_id?: string
          seller_id?: string
          period_start?: string
          period_end?: string
          gross?: number
          fee?: number
          net?: number
          status?: string
          requested_at?: string
          approved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlement_request_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      slot: {
        Row: {
          created_at: string
          date: string
          end_time: string
          event_id: string
          is_closed: boolean
          slot_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          event_id: string
          is_closed?: boolean
          slot_id?: string
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          event_id?: string
          is_closed?: boolean
          slot_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
        ]
      }
      ticket_grade: {
        Row: {
          created_at: string
          event_id: string
          grade_id: string
          grade_name: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          event_id: string
          grade_id?: string
          grade_name: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          event_id?: string
          grade_id?: string
          grade_name?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_ticket_grade_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
