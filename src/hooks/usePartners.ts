import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Partner = Database['public']['Tables']['partners']['Row']

// ── Queries ───────────────────────────────────────────────────────────────────

export function usePartners(workspaceId: string | undefined) {
  return useQuery<Partner[]>({
    queryKey: ['partners', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .order('joined_at', { ascending: false })
      if (error) throw new Error(`usePartners: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}

export type PartnerStats = {
  total: number
  active: number
  onboarding: number
  totalMrrCents: number
  avgActiveMrrCents: number
}

export function partnerStats(partners: Partner[] | undefined): PartnerStats {
  if (!partners || partners.length === 0) {
    return { total: 0, active: 0, onboarding: 0, totalMrrCents: 0, avgActiveMrrCents: 0 }
  }
  const active = partners.filter((p) => p.status === 'active')
  const totalMrrCents = partners.reduce((sum, p) => sum + p.mrr_cents, 0)
  return {
    total: partners.length,
    active: active.length,
    onboarding: partners.filter((p) => p.status === 'onboarding').length,
    totalMrrCents,
    avgActiveMrrCents: active.length > 0
      ? Math.round(active.reduce((sum, p) => sum + p.mrr_cents, 0) / active.length)
      : 0,
  }
}
