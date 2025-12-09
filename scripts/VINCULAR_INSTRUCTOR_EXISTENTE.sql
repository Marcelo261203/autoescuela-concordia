-- ============================================================================
-- VINCULAR INSTRUCTOR EXISTENTE CON USUARIO DE AUTH
-- ============================================================================
-- Este script te ayuda a vincular un instructor existente con su usuario en auth.users
-- ============================================================================

-- PASO 1: Ver todos los instructores y su estado de vinculación
-- ============================================================================
SELECT 
  i.id as instructor_id,
  i.nombre,
  i.apellido,
  i.email as instructor_email,
  i.auth_user_id,
  CASE 
    WHEN i.auth_user_id IS NULL THEN '❌ NO VINCULADO'
    ELSE '✅ VINCULADO'
  END as estado_vinculacion
FROM instructors i
ORDER BY i.nombre;

-- PASO 2: Ver todos los usuarios en auth.users
-- ============================================================================
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- PASO 3: VINCULAR MANUALMENTE (Reemplaza los valores)
-- ============================================================================
-- Ejemplo: Si tu instructor tiene email "instructor@ejemplo.com"
-- y el usuario en auth.users tiene id "abc-123-def-456"

-- Primero, obtén los IDs:
-- SELECT id FROM instructors WHERE email = 'instructor@ejemplo.com';
-- SELECT id FROM auth.users WHERE email = 'instructor@ejemplo.com';

-- Luego, vincula:
-- UPDATE instructors 
-- SET auth_user_id = 'ID_DEL_USUARIO_EN_AUTH_USERS'
-- WHERE id = 'ID_DEL_INSTRUCTOR';

-- Ejemplo completo:
-- UPDATE instructors 
-- SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'instructor@ejemplo.com')
-- WHERE email = 'instructor@ejemplo.com' AND auth_user_id IS NULL;

-- PASO 4: Verificar la vinculación después de actualizar
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
    WHEN i.auth_user_id IS NULL THEN '❌ NO VINCULADO'
    ELSE '⚠️ VINCULADO PERO USUARIO NO EXISTE'
  END as estado
FROM instructors i
LEFT JOIN auth.users u ON i.auth_user_id = u.id
ORDER BY i.nombre;

