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
      dreaming_reports: {
        Row: {
          generated_at: string
          id: string
          model_breakdown: Json
          recommendations: Json
          token_cost_usd: number
          workspace_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          model_breakdown?: Json
          recommendations?: Json
          token_cost_usd?: number
          workspace_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          model_breakdown?: Json
          recommendations?: Json
          token_cost_usd?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dreaming_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          id: string
          last_touch_at: string | null
          name: string
          score: number
          stage: string
          vertical: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_touch_at?: string | null
          name: string
          score?: number
          stage?: string
          vertical?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_touch_at?: string | null
          name?: string
          score?: number
          stage?: string
          vertical?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_allocations: {
        Row: {
          created_at: string
          id: string
          label: string
          pct: number
          sort_order: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          pct: number
          sort_order?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          pct?: number
          sort_order?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_allocations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_fund: {
        Row: {
          balance_cents: number
          id: string
          target_cents: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          balance_cents?: number
          id?: string
          target_cents?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          balance_cents?: number
          id?: string
          target_cents?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_fund_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_tiers: {
        Row: {
          active_count: number
          conv_rate_pct: number | null
          id: string
          name: string
          price_cents: number | null
          price_label: string
          sort_order: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active_count?: number
          conv_rate_pct?: number | null
          id?: string
          name: string
          price_cents?: number | null
          price_label?: string
          sort_order?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active_count?: number
          conv_rate_pct?: number | null
          id?: string
          name?: string
          price_cents?: number | null
          price_label?: string
          sort_order?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_tiers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          market: string
          mrr_cents: number
          name: string
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          market: string
          mrr_cents?: number
          name: string
          status?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          market?: string
          mrr_cents?: number
          name?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenue_events: {
        Row: {
          amount_cents: number
          created_at: string
          customer_name: string
          description: string | null
          event_type: string
          id: string
          occurred_at: string
          workspace_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          customer_name: string
          description?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          workspace_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          customer_name?: string
          description?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_lanes: {
        Row: {
          delta_pct: number
          id: string
          mrr_cents: number
          name: string
          share_pct: number
          sort_order: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          delta_pct?: number
          id?: string
          mrr_cents?: number
          name: string
          share_pct?: number
          sort_order?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          delta_pct?: number
          id?: string
          mrr_cents?: number
          name?: string
          share_pct?: number
          sort_order?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_lanes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_snapshots: {
        Row: {
          aov_delta_pct: number
          avg_order_value_cents: number
          created_at: string
          id: string
          net_mrr_cents: number
          net_mrr_delta_pct: number
          new_cash_cents: number
          new_cash_delta_pct: number
          refund_delta_pct: number
          refund_rate_pct: number
          snapshot_date: string
          workspace_id: string
        }
        Insert: {
          aov_delta_pct?: number
          avg_order_value_cents?: number
          created_at?: string
          id?: string
          net_mrr_cents?: number
          net_mrr_delta_pct?: number
          new_cash_cents?: number
          new_cash_delta_pct?: number
          refund_delta_pct?: number
          refund_rate_pct?: number
          snapshot_date?: string
          workspace_id: string
        }
        Update: {
          aov_delta_pct?: number
          avg_order_value_cents?: number
          created_at?: string
          id?: string
          net_mrr_cents?: number
          net_mrr_delta_pct?: number
          new_cash_cents?: number
          new_cash_delta_pct?: number
          refund_delta_pct?: number
          refund_rate_pct?: number
          snapshot_date?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_snapshots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      my_workspace_id: { Args: never; Returns: string }
      signup_allowed: { Args: never; Returns: boolean }
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
