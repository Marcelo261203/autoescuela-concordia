-- ============================================================================
-- ELIMINAR TABLA DE ADMINISTRADORES
-- ============================================================================
-- Este script elimina completamente la tabla admins y todas sus políticas RLS
-- ============================================================================

-- ============================================================================
-- 1. ELIMINAR POLÍTICAS RLS
-- ============================================================================
DROP POLICY IF EXISTS "Admin can view all admins" ON admins;
DROP POLICY IF EXISTS "Admin can insert admins" ON admins;
DROP POLICY IF EXISTS "Admin can update admins" ON admins;
DROP POLICY IF EXISTS "Admin can delete admins" ON admins;

-- ============================================================================
-- 2. DESHABILITAR ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE IF EXISTS admins DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. ELIMINAR ÍNDICES
-- ============================================================================
DROP INDEX IF EXISTS idx_admins_email;
DROP INDEX IF EXISTS idx_admins_activo;

-- ============================================================================
-- 4. ELIMINAR LA TABLA
-- ============================================================================
DROP TABLE IF EXISTS admins CASCADE;

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- - CASCADE eliminará cualquier dependencia de la tabla
-- - Los usuarios en Supabase Auth NO se eliminan con este script
-- - Si quieres eliminar usuarios de Auth, hazlo manualmente desde el Dashboard
-- ============================================================================




