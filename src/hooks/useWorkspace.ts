import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export type Workspace = {
  id: string
  name: string
}

/**
 * Returns the current user's workspace.
 * Auto-created on signup via DB trigger (migration 001_core.sql).
 * All dashboard data is scoped to workspace.id.
 */
export function useWorkspace() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['workspace', user?.id],
    queryFn: async (): Promise<Workspace> => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('owner_id', user!.id)
        .single()

      if (error) throw new Error(`useWorkspace: ${error.message}`)
      return data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // workspace rarely changes — cache 5 min
  })
}
