-- ============================================================================
-- SCRIPT PARA VERIFICAR VINCULACIÓN DE INSTRUCTORES CON USUARIOS
-- ============================================================================
-- Este script te ayuda a verificar si los instructores tienen correctamente
-- vinculado su auth_user_id con los usuarios en auth.users
-- ============================================================================

-- 1. Ver todos los instructores y su auth_user_id
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

-- 2. Ver instructores con sus usuarios vinculados
SELECT 
  i.id as instructor_id,
  i.nombre,
  i.apellido,
  i.email as instructor_email,
  u.id as user_id,
  u.email as user_email,
  u.created_at as user_created_at
FROM instructors i
LEFT JOIN auth.users u ON i.auth_user_id = u.id
WHERE i.auth_user_id IS NOT NULL
ORDER BY i.nombre;

-- 3. Ver instructores SIN vincular (sin auth_user_id)
SELECT 
  i.id as instructor_id,
  i.nombre,
  i.apellido,
  i.email as instructor_email
FROM instructors i
WHERE i.auth_user_id IS NULL
ORDER BY i.nombre;

-- 4. Ver usuarios en auth.users que NO están vinculados a instructores
SELECT 
  u.id as user_id,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.id NOT IN (
  SELECT auth_user_id 
  FROM instructors 
  WHERE auth_user_id IS NOT NULL
)
ORDER BY u.created_at DESC;

-- 5. Si necesitas vincular manualmente un instructor con un usuario:
-- (Reemplaza 'INSTRUCTOR_ID' y 'USER_ID' con los valores reales)
-- UPDATE instructors 
-- SET auth_user_id = 'USER_ID_AQUI'
-- WHERE id = 'INSTRUCTOR_ID_AQUI';




