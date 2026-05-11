/**
 * Supabase client — Founder Revenue OS v2
 * Project: lqgdiuovlutugreuzqkl  (fresh, separate from MyUSALocal)
 *
 * SSR note: This singleton is safe for client-side use. For server-side
 * authenticated requests (e.g. TanStack Start loaders that need RLS),
 * create a per-request client using createServerClient from @supabase/ssr
 * once schema + RLS policies are in place.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[myfounder-os] Missing Supabase env vars. " +
    "Copy .env.example → .env.local and add your project credentials."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
