-- ============================================================================
-- AGREGAR ROL DE INSTRUCTOR CON AUTENTICACIÓN
-- ============================================================================
-- Este script agrega los campos necesarios para que los instructores
-- puedan iniciar sesión en el sistema:
-- - tipos_licencias: Categorías de licencias que puede enseñar (ej: "P,A,B,C")
-- - auth_user_id: Referencia al usuario en auth.users de Supabase
-- ============================================================================

-- ============================================================================
-- 1. AGREGAR CAMPO DE TIPOS DE LICENCIAS
-- ============================================================================
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS tipos_licencias VARCHAR(50);

-- Comentario:
-- tipos_licencias: Almacena las categorías de licencias que el instructor puede enseñar
-- Formato: "P,A,B,C" (separadas por comas, sin espacios)
-- Valores posibles: M (Moto), P (Particular), A (Autobús), B (Bus/Camión), C (Profesional)
-- NULL significa que no tiene restricción o no está definido

-- ============================================================================
-- 2. AGREGAR CAMPO DE REFERENCIA A USUARIO DE AUTENTICACIÓN
-- ============================================================================
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Comentario:
-- auth_user_id: Vincula el instructor con su usuario en Supabase Auth
-- Si el usuario se elimina de auth.users, este campo se pone en NULL
-- NULL significa que el instructor no tiene cuenta de usuario activa

-- ============================================================================
-- 3. CREAR ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_instructors_auth_user_id ON instructors(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_instructors_tipos_licencias ON instructors(tipos_licencias);

-- Comentario:
-- Índice en auth_user_id: Para búsquedas rápidas de instructor por usuario
-- Índice en tipos_licencias: Para filtrar instructores por categoría de licencia

-- ============================================================================
-- 4. AGREGAR COMENTARIOS A LAS COLUMNAS (DOCUMENTACIÓN)
-- ============================================================================
COMMENT ON COLUMN instructors.tipos_licencias IS 'Categorías de licencias que puede enseñar el instructor. Formato: "P,A,B,C" separadas por comas';
COMMENT ON COLUMN instructors.auth_user_id IS 'Referencia al usuario en auth.users de Supabase. NULL si no tiene cuenta activa';

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Los instructores existentes tendrán:
--    - tipos_licencias = NULL (debe ser configurado manualmente)
--    - auth_user_id = NULL (debe ser creado y vinculado)
--
-- 2. Para activar un instructor existente:
--    a) Crear usuario en Supabase Auth (Authentication > Users > Add user)
--    b) Actualizar el registro del instructor con el auth_user_id correspondiente
--    c) Asignar tipos_licencias según corresponda
--
-- 3. Para nuevos instructores:
--    - El sistema creará automáticamente el usuario en auth.users
--    - Se vinculará automáticamente el auth_user_id
--    - Se asignarán los tipos_licencias desde el formulario
--
-- 4. Validación de tipos_licencias:
--    - Formato: "P,A,B,C" (sin espacios, separadas por comas)
--    - Valores válidos: M, P, A, B, C
--    - La validación se hace en la aplicación, no en la BD
--
-- 5. Seguridad:
--    - Las contraseñas NO se almacenan en esta tabla
--    - Las contraseñas se manejan exclusivamente en auth.users
--    - El campo auth_user_id solo almacena la referencia
-- ============================================================================








