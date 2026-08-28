/**
 * Supabase client — Founder Revenue OS
 *
 * Backed by Lovable Cloud. The underlying singleton is generated at
 * src/integrations/supabase/client.ts (do not edit that file). Here we simply
 * re-export it typed against our hand-maintained Database types so all hooks
 * and routes can keep importing `supabase` from "@/lib/supabase".
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as cloudClient } from "@/integrations/supabase/client";
import type { Database } from "@/types/database";

export const supabase = cloudClient as unknown as SupabaseClient<Database>;
