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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
<<<<<<< HEAD
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
=======
        ];
      };
      seller_stores: {
        Row: {
          address: string | null;
          bank_account_number: string | null;
          bank_holder_name: string | null;
          bank_name: string | null;
          bank_verified: boolean;
          business_number: string | null;
          created_at: string;
          description: string | null;
          email: string | null;
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          bank_account_number?: string | null;
          bank_holder_name?: string | null;
          bank_name?: string | null;
          bank_verified?: boolean;
          business_number?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          bank_account_number?: string | null;
          bank_holder_name?: string | null;
          bank_name?: string | null;
          bank_verified?: boolean;
          business_number?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
>>>>>>> origin/develop
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
