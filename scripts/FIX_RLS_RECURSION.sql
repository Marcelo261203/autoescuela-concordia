-- ============================================================================
-- SCRIPT PARA CORREGIR RECURSIÓN INFINITA EN POLÍTICAS RLS DE app_users
-- ============================================================================
-- Este script elimina las políticas problemáticas de app_users que causan recursión
-- Ejecuta este script en Supabase SQL Editor
-- ============================================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS DE app_users
-- ============================================================================
-- Elimina cualquier política que pueda estar causando recursión
DROP POLICY IF EXISTS "Admin full access" ON app_users;
DROP POLICY IF EXISTS "authenticated_access" ON app_users;
DROP POLICY IF EXISTS "Admin can access app_users" ON app_users;

-- Si hay otras políticas, puedes listarlas con:
-- SELECT * FROM pg_policies WHERE tablename = 'app_users';

-- 2. OPCIONAL: Si quieres mantener RLS en app_users, usa esta política simple
-- que no causa recursión (solo permite acceso a usuarios autenticados)
-- ============================================================================
-- Descomenta las siguientes líneas si quieres mantener RLS en app_users:

-- CREATE POLICY "Authenticated users can access app_users" ON app_users
--   FOR ALL
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

-- 3. ALTERNATIVA RECOMENDADA: Deshabilitar RLS en app_users si no es necesario
-- ============================================================================
-- Si no necesitas RLS en app_users, simplemente deshabilítalo:
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NOTA: La tabla app_users es principalmente para gestión de roles.
-- Si no necesitas restricciones especiales, es mejor deshabilitar RLS.
-- Las otras tablas (students, instructors, classes) ya tienen RLS correctamente configurado.
-- ============================================================================

