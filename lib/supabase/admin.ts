import { createClient } from "@supabase/supabase-js"

/**
 * Crea un cliente de Supabase con permisos de administrador (service role key)
 * ⚠️ SOLO usar en API routes del servidor, NUNCA en el cliente
 * Este cliente puede hacer operaciones administrativas como crear usuarios
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}




