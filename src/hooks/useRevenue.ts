import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type RevenueLane = Database['public']['Tables']['revenue_lanes']['Row']
type OfferTier = Database['public']['Tables']['offer_tiers']['Row']
type RevenueEvent = Database['public']['Tables']['revenue_events']['Row']
type RevenueSnapshot = Database['public']['Tables']['revenue_snapshots']['Row']

// ── Formatters ────────────────────────────────────────────────────────────────

/** Convert cents to a formatted dollar string: 4360000 → "$43,600" */
export function formatDollars(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/** Format a delta percentage with sign: 9 → "+9%", -3 → "-3%" */
export function formatDelta(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct}%`
}

/** Format occurred_at as a relative label */
export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

/** Format a revenue event amount for the wins feed: 190000 → "+$1,900/mo" style */
export function formatWinAmount(cents: number, eventType: string): string {
  const dollars = formatDollars(cents)
  if (eventType === 'upgrade') return `+${dollars}/mo`
  if (eventType === 'churn') return `-${dollars}`
  if (eventType === 'refund') return `-${dollars}`
  return `+${dollars}`
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useRevenueLanes(workspaceId: string | undefined) {
  return useQuery<RevenueLane[]>({
    queryKey: ['revenue_lanes', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_lanes')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .order('sort_order')
      if (error) throw new Error(`useRevenueLanes: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useOfferTiers(workspaceId: string | undefined) {
  return useQuery<OfferTier[]>({
    queryKey: ['offer_tiers', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offer_tiers')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .order('sort_order')
      if (error) throw new Error(`useOfferTiers: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useRecentWins(workspaceId: string | undefined, limit = 4) {
  return useQuery<RevenueEvent[]>({
    queryKey: ['revenue_events', workspaceId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_events')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .not('event_type', 'in', '(refund,churn)')
        .order('occurred_at', { ascending: false })
        .limit(limit)
      if (error) throw new Error(`useRecentWins: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useRevenueSnapshot(workspaceId: string | undefined) {
  return useQuery<RevenueSnapshot | null>({
    queryKey: ['revenue_snapshot', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_snapshots')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw new Error(`useRevenueSnapshot: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}
