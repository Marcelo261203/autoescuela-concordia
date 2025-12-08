-- ============================================================================
-- ACTUALIZAR DISPONIBILIDAD DE INSTRUCTORES A HORARIOS
-- ============================================================================
-- Este script modifica la tabla instructors para cambiar el campo "disponibilidad"
-- (texto) por dos campos de hora: "hora_inicio" y "hora_fin"
-- ============================================================================

-- ============================================================================
-- 1. AGREGAR NUEVOS CAMPOS DE HORARIO
-- ============================================================================
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS hora_inicio TIME,
ADD COLUMN IF NOT EXISTS hora_fin TIME;

-- Comentario:
-- hora_inicio: Hora de inicio del horario disponible (ej: 08:00)
-- hora_fin: Hora de fin del horario disponible (ej: 20:00)
-- Si ambos son NULL, el instructor no tiene restricción de horario

-- ============================================================================
-- 2. VALIDAR QUE HORA_FIN SEA POSTERIOR A HORA_INICIO
-- ============================================================================
ALTER TABLE instructors
DROP CONSTRAINT IF EXISTS check_horario_valido;

ALTER TABLE instructors
ADD CONSTRAINT check_horario_valido CHECK (
  (hora_inicio IS NULL AND hora_fin IS NULL) OR
  (hora_inicio IS NOT NULL AND hora_fin IS NOT NULL AND hora_fin > hora_inicio)
);

-- Comentario:
-- Permite que ambos sean NULL (sin restricción) o que ambos tengan valores
-- y que hora_fin sea posterior a hora_inicio

-- ============================================================================
-- 3. MIGRAR DATOS EXISTENTES (OPCIONAL)
-- ============================================================================
-- Si tienes datos en el campo "disponibilidad" que quieras migrar,
-- puedes hacerlo manualmente o con una función personalizada.
-- Por ahora, dejamos los nuevos campos como NULL (sin restricción)

-- ============================================================================
-- 4. CREAR ÍNDICE PARA BÚSQUEDAS POR HORARIO (OPCIONAL)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_instructors_horario ON instructors(hora_inicio, hora_fin);

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. El campo "disponibilidad" (texto) se mantiene por compatibilidad
--    pero ya no se usará. Puedes eliminarlo después si quieres.
--
-- 2. Si hora_inicio y hora_fin son NULL, el instructor no tiene
--    restricción de horario y puede tener clases a cualquier hora.
--
-- 3. La validación en la aplicación debe verificar que:
--    - La hora de la clase esté entre hora_inicio y hora_fin
--    - Si el instructor no tiene horario definido (NULL), permitir cualquier hora
--
-- 4. Ejemplo de uso:
--    - hora_inicio: 08:00
--    - hora_fin: 20:00
--    - Significa que las clases solo pueden ser entre las 8 AM y 8 PM
-- ============================================================================




