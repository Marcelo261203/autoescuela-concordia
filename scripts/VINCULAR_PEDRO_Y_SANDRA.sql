-- ============================================================================
-- VINCULAR PEDRO SANCHEZ Y SANDRA GOMEZ CON SUS USUARIOS
-- ============================================================================
-- Este script verifica si tienen usuarios en auth.users y los vincula
-- ============================================================================

-- PASO 1: Verificar si tienen usuarios en auth.users
-- ============================================================================
SELECT 
  u.id as user_id,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.email IN ('pedrosanchez@gmail.com', 'sandragomez@gmail.com');

-- PASO 2: Si los usuarios EXISTEN, vincularlos
-- ============================================================================
-- Vincular Pedro Sanchez
UPDATE instructors 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'pedrosanchez@gmail.com')
WHERE email = 'pedrosanchez@gmail.com' AND auth_user_id IS NULL;

-- Vincular Sandra Gomez
UPDATE instructors 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'sandragomez@gmail.com')
WHERE email = 'sandragomez@gmail.com' AND auth_user_id IS NULL;

-- PASO 3: Verificar la vinculación después de actualizar
-- ============================================================================
SELECT 
  i.id as instructor_id,
  i.nombre,
  i.apellido,
  i.email as instructor_email,
  i.auth_user_id,
  u.email as user_email,
  CASE 
    WHEN i.auth_user_id IS NOT NULL AND u.id IS NOT NULL THEN '✅ CORRECTAMENTE VINCULADO'
    WHEN i.auth_user_id IS NULL THEN '❌ NO VINCULADO - Usuario no existe en auth.users'
    ELSE '⚠️ ERROR'
  END as estado
FROM instructors i
LEFT JOIN auth.users u ON i.auth_user_id = u.id
WHERE i.email IN ('pedrosanchez@gmail.com', 'sandragomez@gmail.com', 'domingoperedo@gmail.com')
ORDER BY i.nombre;

-- ============================================================================
-- NOTA: Si los usuarios NO existen en auth.users, necesitarás crearlos primero
-- desde Supabase Dashboard > Authentication > Users > Add user
-- O usar el formulario de edición del instructor para agregar la contraseña
-- ============================================================================








