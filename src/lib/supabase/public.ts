import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente anónimo sin cookies: lee lo mismo que un visitante sin sesión (RLS de anon).
// Al no tocar cookies() la página puede prerenderizarse y cachearse con ISR.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
