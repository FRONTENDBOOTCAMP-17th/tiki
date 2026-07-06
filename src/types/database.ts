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
          deleted_at: string | null
          deleted_by: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
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
      event_staff: {
        Row: {
          created_at: string
          event_id: string
          invited_by: string
          staff_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          invited_by: string
          staff_id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          invited_by?: string
          staff_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_staff_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friend: {
        Row: {
          addressee_id: string
          created_at: string
          friend_id: string
          requester_id: string
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          friend_id?: string
          requester_id: string
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          friend_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          category: string
          content: string
          created_at: string
          inquiry_id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          category?: string
          content: string
          created_at?: string
          inquiry_id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          category?: string
          content?: string
          created_at?: string
          inquiry_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          created_at: string
          is_read: boolean
          link: string | null
          notification_id: string
          ref_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_read?: boolean
          link?: string | null
          notification_id?: string
          ref_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_read?: boolean
          link?: string | null
          notification_id?: string
          ref_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      review: {
        Row: {
          created_at: string
          deleted_at: string | null
          event_id: string
          memo: string
          order_id: string
          rating: number
          review_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          event_id: string
          memo: string
          order_id: string
          rating: number
          review_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          event_id?: string
          memo?: string
          order_id?: string
          rating?: number
          review_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "review_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "review_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_delete_request: {
        Row: {
          created_at: string
          reason: string
          request_id: string
          review_id: string
          seller_id: string
          status: string
        }
        Insert: {
          created_at?: string
          reason: string
          request_id?: string
          review_id: string
          seller_id: string
          status?: string
        }
        Update: {
          created_at?: string
          reason?: string
          request_id?: string
          review_id?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_delete_request_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review"
            referencedColumns: ["review_id"]
          },
        ]
      }
      review_like: {
        Row: {
          created_at: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_like_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "review"
            referencedColumns: ["review_id"]
          },
          {
            foreignKeyName: "review_like_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          approved_at: string | null
          fee: number
          gross: number
          net: number
          period_end: string
          period_start: string
          reject_reason: string | null
          requested_at: string
          seller_id: string
          settlement_id: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          fee?: number
          gross?: number
          net?: number
          period_end: string
          period_start: string
          reject_reason?: string | null
          requested_at?: string
          seller_id: string
          settlement_id?: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          fee?: number
          gross?: number
          net?: number
          period_end?: string
          period_start?: string
          reject_reason?: string | null
          requested_at?: string
          seller_id?: string
          settlement_id?: string
          status?: string
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
      ticket_checkin: {
        Row: {
          checked_in_at: string
          checked_in_by: string
          checkin_id: string
          order_id: string
          subject_id: string
          subject_type: string
        }
        Insert: {
          checked_in_at?: string
          checked_in_by: string
          checkin_id?: string
          order_id: string
          subject_id: string
          subject_type: string
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string
          checkin_id?: string
          order_id?: string
          subject_id?: string
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_checkin_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_checkin_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      ticket_entry_code: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          subject_id: string
          subject_type: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          subject_id: string
          subject_type: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          subject_id?: string
          subject_type?: string
        }
        Relationships: []
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
      ticket_share: {
        Row: {
          created_at: string
          order_id: string
          quantity: number
          share_id: string
          shared_with: string
          sharer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          order_id: string
          quantity: number
          share_id?: string
          shared_with: string
          sharer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          order_id?: string
          quantity?: number
          share_id?: string
          shared_with?: string
          sharer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_share_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "ticket_share_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_share_sharer_id_fkey"
            columns: ["sharer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          avatar_url?: string | null
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
      accept_friend_request: { Args: { p_friend_id: string }; Returns: Json }
      accept_staff_invite: { Args: { p_staff_id: string }; Returns: Json }
      accept_ticket_share: { Args: { p_share_id: string }; Returns: Json }
      can_checkin_event: { Args: { p_event_id: string }; Returns: boolean }
      can_write_review: {
        Args: { p_event_id: string; p_order_id: string; p_user_id: string }
        Returns: boolean
      }
      cancel_order: { Args: { p_order_id: string }; Returns: boolean }
      cancel_stale_orders: { Args: { p_ttl_minutes?: number }; Returns: number }
      checkin_ticket: {
        Args: { p_subject_id: string; p_subject_type: string }
        Returns: Json
      }
      event_booking_counts: {
        Args: never
        Returns: {
          event_id: string
          total_quantity: number
        }[]
      }
      find_user_by_email: {
        Args: { p_email: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_checkin_events: {
        Args: never
        Returns: {
          event_id: string
          my_role: string
          thumbnail: string
          title: string
          venue_name: string
        }[]
      }
      get_event_reviews: {
        Args: { p_event_id: string }
        Returns: {
          author_name: string
          created_at: string
          like_count: number
          liked_by_me: boolean
          memo: string
          rating: number
          review_id: string
          user_id: string
        }[]
      }
      get_event_staff_overview: {
        Args: never
        Returns: {
          created_at: string
          event_id: string
          event_title: string
          staff_email: string
          staff_id: string
          staff_name: string
          status: string
        }[]
      }
      get_my_friends: {
        Args: never
        Returns: {
          avatar_url: string
          email: string
          friend_id: string
          meet_count: number
          name: string
          user_id: string
        }[]
      }
      get_my_received_tickets: {
        Args: never
        Returns: {
          created_at: string
          event_id: string
          event_title: string
          grade_name: string
          is_ended: boolean
          order_id: string
          quantity: number
          share_id: string
          sharer_name: string
          slot_date: string
          slot_time: string
          venue_address: string
          venue_name: string
        }[]
      }
      get_my_shared_tickets: {
        Args: never
        Returns: {
          created_at: string
          event_title: string
          quantity: number
          share_id: string
          shared_with_name: string
          slot_date: string
          slot_time: string
          status: string
        }[]
      }
      get_my_staff_events: {
        Args: never
        Returns: {
          end_date: string
          event_id: string
          seller_name: string
          staff_id: string
          start_date: string
          status: string
          thumbnail: string
          title: string
          venue_name: string
        }[]
      }
      get_seller_dashboard_stats: {
        Args: { p_seller_id: string }
        Returns: Json
      }
      get_shared_quantity: { Args: { p_order_id: string }; Returns: number }
      get_writable_review_slots: {
        Args: { p_event_id: string }
        Returns: {
          order_id: string
          slot_date: string
          slot_start_time: string
        }[]
      }
      invite_event_staff: {
        Args: { p_email: string; p_event_id: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      issue_entry_code: {
        Args: {
          p_subject_id: string
          p_subject_type: string
          p_ttl_seconds?: number
        }
        Returns: string
      }
      notify_inquiry_answered: {
        Args: { p_inquiry_id: string }
        Returns: undefined
      }
      place_order: {
        Args: {
          p_event_id: string
          p_grade_id: string
          p_quantity: number
          p_slot_id: string
          p_status?: string
          p_total_price: number
        }
        Returns: string
      }
      place_seat_order: {
        Args: {
          p_event_id: string
          p_grade_id: string
          p_seat_ids: string[]
          p_slot_id: string
          p_total_price: number
        }
        Returns: string
      }
      reject_friend_request: { Args: { p_friend_id: string }; Returns: Json }
      reject_staff_invite: { Args: { p_staff_id: string }; Returns: Json }
      reject_ticket_share: { Args: { p_share_id: string }; Returns: Json }
      remove_event_staff: { Args: { p_staff_id: string }; Returns: Json }
      request_review_deletion: {
        Args: { p_reason: string; p_review_id: string }
        Returns: boolean
      }
      resolve_entry_code: {
        Args: { p_code: string }
        Returns: {
          subject_id: string
          subject_type: string
        }[]
      }
      revoke_ticket_share: { Args: { p_share_id: string }; Returns: Json }
      send_friend_request: { Args: { p_email: string }; Returns: Json }
      share_ticket: {
        Args: { p_order_id: string; p_quantity: number; p_shared_with: string }
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
