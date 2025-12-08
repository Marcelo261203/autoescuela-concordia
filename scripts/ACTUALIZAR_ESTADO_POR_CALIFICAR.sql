-- ============================================================================
-- ACTUALIZAR ESTADO DE CLASES PARA INCLUIR "por_calificar"
-- ============================================================================
-- Este script actualiza el constraint del campo estado para incluir el nuevo estado
-- "por_calificar" que se asigna automáticamente cuando pasa el horario de la clase
-- ============================================================================

-- ============================================================================
-- 1. ELIMINAR EL CONSTRAINT ANTERIOR
-- ============================================================================
-- Primero necesitamos eliminar el constraint existente
ALTER TABLE classes
DROP CONSTRAINT IF EXISTS classes_estado_check;

-- ============================================================================
-- 2. AGREGAR EL NUEVO CONSTRAINT CON TRES ESTADOS
-- ============================================================================
-- Estados posibles:
-- - 'agendado': Clase programada, aún no ha pasado su horario
-- - 'por_calificar': Clase ya pasó su horario, está lista para calificar
-- - 'cursado': Clase ya fue calificada
ALTER TABLE classes
ADD CONSTRAINT classes_estado_check 
CHECK (estado IN ('agendado', 'por_calificar', 'cursado'));

-- ============================================================================
-- 3. ACTUALIZAR CLASES EXISTENTES QUE DEBERÍAN ESTAR EN "por_calificar"
-- ============================================================================
-- Actualizar clases que ya pasaron su horario pero aún están en "agendado"
-- y no tienen nota (no están calificadas)
UPDATE classes
SET estado = 'por_calificar'
WHERE estado = 'agendado'
  AND nota IS NULL
  AND (
    -- Verificar si la fecha/hora de finalización ya pasó
    (fecha::date + hora::time + (duracion_minutos || ' minutes')::interval) < NOW()
  );

-- Comentario:
-- Esta actualización se ejecuta una vez para migrar datos existentes
-- El sistema actualizará automáticamente el estado en tiempo real cuando se consulten las clases

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. El estado "por_calificar" se asigna automáticamente cuando:
--    - La clase tiene estado "agendado"
--    - La fecha/hora actual es posterior a: fecha + hora + duracion_minutos
--    - La clase aún no tiene nota (no está calificada)
--
-- 2. El estado cambia a "cursado" cuando se guarda la calificación (nota + observaciones)
--
-- 3. El sistema verificará y actualizará el estado automáticamente al consultar las clases
-- ============================================================================





