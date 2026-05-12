import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

// ── Formatters ────────────────────────────────────────────────────────────────

const STAGE_LABEL: Record<Lead['stage'], string> = {
  new: 'New',
  email_1_sent: 'Email 1 sent',
  email_2_sent: 'Email 2 sent',
  replied: 'Replied',
  meeting_set: 'Meeting set',
  closed: 'Closed',
  lost: 'Lost',
}

/** Score 90+ = hot, 70-89 = warm, <70 = cool */
export function urgencyFromScore(score: number): 'hot' | 'warm' | 'cool' {
  if (score >= 90) return 'hot'
  if (score >= 70) return 'warm'
  return 'cool'
}

export function formatStage(stage: Lead['stage']): string {
  return STAGE_LABEL[stage]
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useHotProspects(workspaceId: string | undefined, limit = 5) {
  return useQuery<Lead[]>({
    queryKey: ['leads_hot', workspaceId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .not('stage', 'in', '(closed,lost)')
        .order('score', { ascending: false })
        .limit(limit)
      if (error) throw new Error(`useHotProspects: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useRepliedLeads(workspaceId: string | undefined, limit = 4) {
  return useQuery<Lead[]>({
    queryKey: ['leads_replied', workspaceId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .eq('stage', 'replied')
        .order('last_touch_at', { ascending: false, nullsFirst: false })
        .limit(limit)
      if (error) throw new Error(`useRepliedLeads: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}

/** Counts for the top-of-page KPI cards */
export function useLeadCounts(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['lead_counts', workspaceId],
    queryFn: async () => {
      // pull just what we need to count in JS — keeps it to one round-trip
      const { data, error } = await supabase
        .from('leads')
        .select('stage, score')
        .eq('workspace_id', workspaceId!)
      if (error) throw new Error(`useLeadCounts: ${error.message}`)

      const active   = data.filter((l) => !['closed', 'lost'].includes(l.stage)).length
      const hot      = data.filter((l) => l.score >= 75).length
      const replied  = data.filter((l) => l.stage === 'replied').length
      const inMid    = data.filter((l) => ['email_1_sent', 'email_2_sent'].includes(l.stage)).length

      return { active, hot, replied, inMid, total: data.length }
    },
    enabled: !!workspaceId,
  })
}
