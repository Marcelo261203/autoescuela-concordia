-- ============================================================================
-- SOLUCIONAR ERROR DE app_users SIN RLS
-- ============================================================================
-- Este script soluciona el error de Supabase sobre app_users sin RLS
-- ============================================================================

-- Opción 1: Deshabilitar RLS en app_users (RECOMENDADO si no usas esta tabla)
-- ============================================================================
ALTER TABLE IF EXISTS app_users DISABLE ROW LEVEL SECURITY;

-- Opción 2: Si necesitas mantener RLS, habilítalo y crea una política simple
-- ============================================================================
-- Descomenta las siguientes líneas si necesitas RLS en app_users:

-- ALTER TABLE IF EXISTS app_users ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Authenticated users can access app_users" ON app_users;
-- CREATE POLICY "Authenticated users can access app_users" ON app_users
--   FOR ALL
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- NOTA: Si la tabla app_users no existe o no la estás usando,
-- puedes ignorar este error. No afecta el funcionamiento del sistema.
-- ============================================================================





