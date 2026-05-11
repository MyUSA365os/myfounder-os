/**
 * Supabase database types — Founder Revenue OS v2
 * Project: lqgdiuovlutugreuzqkl
 *
 * To regenerate after schema changes:
 *   npx supabase gen types typescript \
 *     --project-id lqgdiuovlutugreuzqkl \
 *     --schema public \
 *     > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          owner_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          updated_at?: string
        }
      }
      revenue_lanes: {
        Row: {
          id: string
          workspace_id: string
          name: string
          mrr_cents: number
          share_pct: number
          delta_pct: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          mrr_cents?: number
          share_pct?: number
          delta_pct?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          name?: string
          mrr_cents?: number
          share_pct?: number
          delta_pct?: number
          sort_order?: number
          updated_at?: string
        }
      }
      offer_tiers: {
        Row: {
          id: string
          workspace_id: string
          name: string
          price_label: string
          price_cents: number | null
          conv_rate_pct: number | null
          active_count: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          price_label?: string
          price_cents?: number | null
          conv_rate_pct?: number | null
          active_count?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          name?: string
          price_label?: string
          price_cents?: number | null
          conv_rate_pct?: number | null
          active_count?: number
          sort_order?: number
          updated_at?: string
        }
      }
      revenue_events: {
        Row: {
          id: string
          workspace_id: string
          customer_name: string
          description: string | null
          amount_cents: number
          event_type: 'sale' | 'renewal' | 'upgrade' | 'refund' | 'churn'
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_name: string
          description?: string | null
          amount_cents: number
          event_type?: 'sale' | 'renewal' | 'upgrade' | 'refund' | 'churn'
          occurred_at?: string
          created_at?: string
        }
        Update: {
          customer_name?: string
          description?: string | null
          amount_cents?: number
          event_type?: 'sale' | 'renewal' | 'upgrade' | 'refund' | 'churn'
          occurred_at?: string
        }
      }
      revenue_snapshots: {
        Row: {
          id: string
          workspace_id: string
          net_mrr_cents: number
          new_cash_cents: number
          avg_order_value_cents: number
          refund_rate_pct: number
          net_mrr_delta_pct: number
          new_cash_delta_pct: number
          aov_delta_pct: number
          refund_delta_pct: number
          snapshot_date: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          net_mrr_cents?: number
          new_cash_cents?: number
          avg_order_value_cents?: number
          refund_rate_pct?: number
          net_mrr_delta_pct?: number
          new_cash_delta_pct?: number
          aov_delta_pct?: number
          refund_delta_pct?: number
          snapshot_date?: string
          created_at?: string
        }
        Update: {
          net_mrr_cents?: number
          new_cash_cents?: number
          avg_order_value_cents?: number
          refund_rate_pct?: number
          net_mrr_delta_pct?: number
          new_cash_delta_pct?: number
          aov_delta_pct?: number
          refund_delta_pct?: number
        }
      }
      partners: {
        Row: {
          id: string
          workspace_id: string
          name: string
          market: string
          status: 'active' | 'onboarding' | 'inactive'
          mrr_cents: number
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          market: string
          status?: 'active' | 'onboarding' | 'inactive'
          mrr_cents?: number
          joined_at?: string
          created_at?: string
        }
        Update: {
          name?: string
          market?: string
          status?: 'active' | 'onboarding' | 'inactive'
          mrr_cents?: number
          joined_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          name: string
          vertical: string | null
          stage: 'new' | 'email_1_sent' | 'email_2_sent' | 'replied' | 'meeting_set' | 'closed' | 'lost'
          score: number
          last_touch_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          vertical?: string | null
          stage?: 'new' | 'email_1_sent' | 'email_2_sent' | 'replied' | 'meeting_set' | 'closed' | 'lost'
          score?: number
          last_touch_at?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          vertical?: string | null
          stage?: 'new' | 'email_1_sent' | 'email_2_sent' | 'replied' | 'meeting_set' | 'closed' | 'lost'
          score?: number
          last_touch_at?: string | null
        }
      }
      dreaming_reports: {
        Row: {
          id: string
          workspace_id: string
          recommendations: Json
          token_cost_usd: number
          model_breakdown: Json
          generated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          recommendations?: Json
          token_cost_usd?: number
          model_breakdown?: Json
          generated_at?: string
        }
        Update: {
          recommendations?: Json
          token_cost_usd?: number
          model_breakdown?: Json
        }
      }
      legacy_allocations: {
        Row: {
          id: string
          workspace_id: string
          label: string
          pct: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          label: string
          pct: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          label?: string
          pct?: number
          sort_order?: number
        }
      }
      legacy_fund: {
        Row: {
          id: string
          workspace_id: string
          balance_cents: number
          target_cents: number
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          balance_cents?: number
          target_cents?: number
          updated_at?: string
        }
        Update: {
          balance_cents?: number
          target_cents?: number
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      my_workspace_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
