-- ============================================================================
-- CREAR TABLA DE ADMINISTRADORES
-- ============================================================================
-- Esta tabla almacena información adicional de los administradores
-- Los usuarios se crean en Supabase Auth, y esta tabla almacena metadatos
-- ============================================================================

-- ============================================================================
-- 1. CREAR TABLA admins
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comentario:
-- Esta tabla almacena información adicional de administradores
-- El email debe coincidir con el email del usuario en auth.users
-- El campo 'activo' permite desactivar un administrador sin eliminarlo

-- ============================================================================
-- 2. CREAR ÍNDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_activo ON admins(activo);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para administradores
CREATE POLICY "Admin can view all admins" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert admins" ON admins
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update admins" ON admins
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete admins" ON admins
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 4. TRIGGER PARA ACTUALIZAR updated_at
-- ============================================================================
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. CREACIÓN DE USUARIOS:
--    - Para crear un administrador, primero se debe crear el usuario en Supabase Auth
--    - Luego se crea el registro en esta tabla con el mismo email
--    - Alternativamente, se puede usar una función Edge de Supabase para crear ambos
--
-- 2. SINCRONIZACIÓN:
--    - El email en esta tabla debe coincidir con el email en auth.users
--    - Se recomienda crear un trigger o función para mantener sincronización
--
-- 3. DESACTIVACIÓN:
--    - Para desactivar un administrador, cambiar 'activo' a false
--    - Esto no elimina el usuario de auth.users, solo lo marca como inactivo
--
-- 4. ELIMINACIÓN:
--    - Al eliminar de esta tabla, también se debe eliminar de auth.users manualmente
--    - O usar una función Edge para eliminar ambos
-- ============================================================================





