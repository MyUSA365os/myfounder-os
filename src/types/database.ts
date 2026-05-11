/**
 * Supabase type stubs — replace after schema is deployed:
 *
 *   bunx supabase gen types typescript \
 *     --project-id lqgdiuovlutugreuzqkl \
 *     --schema public \
 *     > src/types/database.ts
 *
 * Until then, all tables resolve to `never` so the typed client compiles
 * without errors and pages can use mock data safely.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
