-- ============================================================================
-- AGREGAR ESTADO "SUSPENDIDA" A CLASES
-- ============================================================================
-- Este script agrega el estado "suspendida" a las clases
-- Las clases suspendidas son aquellas que se cancelan en lugar de eliminarse
-- ============================================================================

-- ============================================================================
-- 1. ELIMINAR EL CONSTRAINT ANTERIOR
-- ============================================================================
ALTER TABLE classes
DROP CONSTRAINT IF EXISTS classes_estado_check;

-- ============================================================================
-- 2. AGREGAR EL NUEVO CONSTRAINT CON CUATRO ESTADOS
-- ============================================================================
-- Estados posibles:
-- - 'agendado': Clase programada, aún no ha pasado su horario
-- - 'por_calificar': Clase ya pasó su horario, está lista para calificar
-- - 'cursado': Clase ya fue calificada
-- - 'suspendida': Clase cancelada/suspendida (en lugar de eliminarse)
ALTER TABLE classes
ADD CONSTRAINT classes_estado_check 
CHECK (estado IN ('agendado', 'por_calificar', 'cursado', 'suspendida'));

-- ============================================================================
-- 3. COMENTARIOS
-- ============================================================================
-- Las clases suspendidas no se eliminan físicamente de la base de datos
-- Esto permite mantener un historial completo de todas las clases
-- Las clases suspendidas no se cuentan en el progreso del estudiante



