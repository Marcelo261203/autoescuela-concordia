-- ============================================================================
-- ACTUALIZAR POLÍTICAS RLS PARA PERMITIR ACCESO DE INSTRUCTORES
-- ============================================================================
-- Este script actualiza las políticas RLS para que:
-- - Los admins puedan ver/editar todas las clases
-- - Los instructores solo puedan ver/editar sus propias clases
-- ============================================================================

-- 1. ELIMINAR POLÍTICAS ANTIGUAS DE CLASES (si existen)
-- ============================================================================
DROP POLICY IF EXISTS "Admin can view classes" ON classes;
DROP POLICY IF EXISTS "Admin can insert classes" ON classes;
DROP POLICY IF EXISTS "Admin can update classes" ON classes;
DROP POLICY IF EXISTS "Admin can delete classes" ON classes;
DROP POLICY IF EXISTS "authenticated_access" ON classes;

-- 2. CREAR FUNCIÓN HELPER PARA VERIFICAR SI ES ADMIN O INSTRUCTOR
-- ============================================================================
-- Esta función verifica si el usuario actual es admin (no está vinculado a instructor)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM instructors 
    WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREAR FUNCIÓN HELPER PARA OBTENER EL ID DEL INSTRUCTOR ACTUAL
-- ============================================================================
CREATE OR REPLACE FUNCTION get_current_instructor_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM instructors 
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREAR NUEVAS POLÍTICAS RLS PARA CLASES
-- ============================================================================

-- Eliminar políticas nuevas si existen (por si se ejecutó antes)
DROP POLICY IF EXISTS "View classes policy" ON classes;
DROP POLICY IF EXISTS "Insert classes policy" ON classes;
DROP POLICY IF EXISTS "Update classes policy" ON classes;
DROP POLICY IF EXISTS "Delete classes policy" ON classes;

-- Política SELECT: Admins ven todas, instructores solo sus clases
CREATE POLICY "View classes policy" ON classes
  FOR SELECT
  USING (
    is_admin() OR 
    instructor_id = get_current_instructor_id()
  );

-- Política INSERT: Admins pueden crear todas, instructores solo para ellos mismos
-- La validación en la API verificará que el estudiante sea válido
CREATE POLICY "Insert classes policy" ON classes
  FOR INSERT
  WITH CHECK (
    is_admin() OR 
    instructor_id = get_current_instructor_id()
  );

-- Política UPDATE: Admins pueden editar todas, instructores solo sus clases
CREATE POLICY "Update classes policy" ON classes
  FOR UPDATE
  USING (
    is_admin() OR 
    instructor_id = get_current_instructor_id()
  )
  WITH CHECK (
    is_admin() OR 
    instructor_id = get_current_instructor_id()
  );

-- Política DELETE: Admins pueden eliminar todas, instructores solo sus clases
CREATE POLICY "Delete classes policy" ON classes
  FOR DELETE
  USING (
    is_admin() OR 
    instructor_id = get_current_instructor_id()
  );

-- 5. ACTUALIZAR POLÍTICAS RLS PARA ESTUDIANTES
-- ============================================================================
-- Los instructores solo pueden ver estudiantes que tienen clases con ellos

-- Eliminar políticas antiguas de estudiantes
DROP POLICY IF EXISTS "Admin can view all students" ON students;
DROP POLICY IF EXISTS "Admin can insert students" ON students;
DROP POLICY IF EXISTS "Admin can update students" ON students;
DROP POLICY IF EXISTS "Admin can delete students" ON students;
DROP POLICY IF EXISTS "authenticated_access" ON students;

-- Eliminar políticas nuevas si existen (por si se ejecutó antes)
DROP POLICY IF EXISTS "View students policy" ON students;
DROP POLICY IF EXISTS "Insert students policy" ON students;
DROP POLICY IF EXISTS "Update students policy" ON students;
DROP POLICY IF EXISTS "Delete students policy" ON students;

-- Política SELECT: Admins ven todos, instructores solo sus estudiantes
CREATE POLICY "View students policy" ON students
  FOR SELECT
  USING (
    is_admin() OR 
    id IN (
      SELECT DISTINCT estudiante_id 
      FROM classes 
      WHERE instructor_id = get_current_instructor_id()
    )
  );

-- Política INSERT: Solo admins pueden crear estudiantes
CREATE POLICY "Insert students policy" ON students
  FOR INSERT
  WITH CHECK (is_admin());

-- Política UPDATE: Solo admins pueden actualizar estudiantes
CREATE POLICY "Update students policy" ON students
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Política DELETE: Solo admins pueden eliminar estudiantes
CREATE POLICY "Delete students policy" ON students
  FOR DELETE
  USING (is_admin());

-- 6. ACTUALIZAR POLÍTICAS RLS PARA PROGRESO
-- ============================================================================
-- Los instructores solo pueden ver progreso de estudiantes que tienen clases con ellos

-- Eliminar políticas antiguas de progreso
DROP POLICY IF EXISTS "Admin can view progress" ON student_progress;
DROP POLICY IF EXISTS "Admin can update progress" ON student_progress;
DROP POLICY IF EXISTS "authenticated_access" ON student_progress;

-- Eliminar políticas nuevas si existen (por si se ejecutó antes)
DROP POLICY IF EXISTS "View progress policy" ON student_progress;
DROP POLICY IF EXISTS "Update progress policy" ON student_progress;
DROP POLICY IF EXISTS "Insert progress policy" ON student_progress;

-- Política SELECT: Admins ven todo, instructores solo progreso de sus estudiantes
CREATE POLICY "View progress policy" ON student_progress
  FOR SELECT
  USING (
    is_admin() OR 
    estudiante_id IN (
      SELECT DISTINCT estudiante_id 
      FROM classes 
      WHERE instructor_id = get_current_instructor_id()
    )
  );

-- Política UPDATE: Admins pueden actualizar todo, instructores solo progreso de sus estudiantes
-- Nota: La consulta incluye estudiantes que tienen clases con el instructor
-- o estudiantes que están siendo procesados (para manejar la primera clase)
CREATE POLICY "Update progress policy" ON student_progress
  FOR UPDATE
  USING (
    is_admin() OR 
    estudiante_id IN (
      SELECT DISTINCT estudiante_id 
      FROM classes 
      WHERE instructor_id = get_current_instructor_id()
    )
  )
  WITH CHECK (
    is_admin() OR 
    estudiante_id IN (
      SELECT DISTINCT estudiante_id 
      FROM classes 
      WHERE instructor_id = get_current_instructor_id()
    )
  );

-- Política INSERT: Admins pueden crear todo, instructores solo progreso de sus estudiantes
-- Nota: Permite crear progreso para estudiantes que tienen clases con el instructor
CREATE POLICY "Insert progress policy" ON student_progress
  FOR INSERT
  WITH CHECK (
    is_admin() OR 
    estudiante_id IN (
      SELECT DISTINCT estudiante_id 
      FROM classes 
      WHERE instructor_id = get_current_instructor_id()
    )
  );

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. CLASES:
--    - Instructores: Ver y actualizar (calificar) sus propias clases
--    - Admins: Acceso completo (ver, crear, actualizar, eliminar)
--
-- 2. ESTUDIANTES:
--    - Instructores: Solo ver estudiantes que tienen clases con ellos (solo lectura)
--    - Admins: Acceso completo
--
-- 3. PROGRESO:
--    - Instructores: Solo ver progreso de estudiantes que tienen clases con ellos (solo lectura)
--    - Admins: Acceso completo
--
-- 4. Las funciones helper usan SECURITY DEFINER para poder acceder
--    a la tabla instructors sin problemas de RLS
-- ============================================================================

