-- ============================================================================
-- SCRIPT PARA VERIFICAR EL ROL DE UN USUARIO
-- ============================================================================
-- Este script te ayuda a verificar si un usuario está vinculado como instructor
-- o es un admin
-- ============================================================================

-- 1. Ver todos los usuarios en auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver todos los instructores y sus auth_user_id
SELECT 
  id,
  nombre,
  apellido,
  email,
  auth_user_id,
  estado
FROM instructors
ORDER BY nombre;

-- 3. Verificar si un usuario específico está vinculado como instructor
-- (Reemplaza 'TU_USER_ID_AQUI' con el ID del usuario de auth.users)
SELECT 
  i.id as instructor_id,
  i.nombre,
  i.apellido,
  i.email,
  u.id as user_id,
  u.email as user_email
FROM instructors i
INNER JOIN auth.users u ON i.auth_user_id = u.id
WHERE u.id = 'TU_USER_ID_AQUI'; -- Reemplaza con tu user ID

-- 4. Si encuentras que tu usuario admin está vinculado como instructor por error,
-- puedes desvincularlo con este comando:
-- UPDATE instructors SET auth_user_id = NULL WHERE auth_user_id = 'TU_USER_ID_AQUI';



