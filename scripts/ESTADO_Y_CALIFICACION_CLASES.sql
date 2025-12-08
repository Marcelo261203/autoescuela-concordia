-- ============================================================================
-- AGREGAR ESTADO Y CALIFICACIÓN A CLASES
-- ============================================================================
-- Este script agrega funcionalidades para:
-- 1. Estado de clases (agendado, cursado)
-- 2. Calificación de clases (nota y observaciones)
-- ============================================================================

-- ============================================================================
-- 1. AGREGAR CAMPO ESTADO A LA TABLA classes
-- ============================================================================
-- Estados posibles:
-- - 'agendado': Clase programada, aún no ha pasado su horario
-- - 'por_calificar': Clase ya pasó su horario, está lista para calificar
-- - 'cursado': Clase ya fue calificada
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'agendado'
CHECK (estado IN ('agendado', 'por_calificar', 'cursado'));

-- Comentario:
-- Por defecto, todas las clases nuevas se crean con estado 'agendado'
-- El estado cambia a 'cursado' cuando se califica la clase (se llena nota y observaciones)

-- ============================================================================
-- 2. AGREGAR CAMPO NOTA A LA TABLA classes
-- ============================================================================
-- Nota numérica para calificar el desempeño en la clase
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS nota NUMERIC(5,2)
CHECK (nota IS NULL OR (nota >= 0 AND nota <= 100));

-- Comentario:
-- Nota opcional (puede ser NULL) que se llena cuando se califica la clase
-- Rango: 0-100
-- Solo se puede calificar una clase después de que haya pasado su horario

-- ============================================================================
-- 3. ACTUALIZAR OBSERVACIONES EXISTENTES
-- ============================================================================
-- El campo 'observaciones' ya existe en la tabla, pero ahora se usará también
-- para las observaciones de la calificación de la clase

-- ============================================================================
-- 4. CREAR ÍNDICE PARA BÚSQUEDAS POR ESTADO
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_classes_estado ON classes(estado);

-- Comentario:
-- Facilita filtrar clases por estado (agendadas vs cursadas)

-- ============================================================================
-- NOTAS IMPORTANTES SOBRE EL FUNCIONAMIENTO:
-- ============================================================================
-- 1. ESTADO DE CLASES:
--    - Al crear una clase, se establece automáticamente como 'agendado'
--    - Una clase puede ser calificada solo después de que haya pasado su horario
--    - Horario de finalización = fecha + hora + duracion_minutos
--    - Ejemplo: Clase a las 10:00 con 60 min de duración, puede calificarse después de las 11:00
--
-- 2. CALIFICACIÓN:
--    - Para calificar una clase, se deben llenar: observaciones y nota
--    - Al guardar la calificación, el estado cambia automáticamente a 'cursado'
--    - Una vez calificada (estado 'cursado'), no se puede modificar la nota
--
-- 3. LÓGICA DE DISPONIBILIDAD:
--    - El sistema debe verificar si la fecha/hora actual es posterior a:
--      fecha + hora + duracion_minutos
--    - Solo entonces se permite calificar la clase
--
-- 4. OBSERVACIONES:
--    - El campo 'observaciones' puede usarse tanto para notas previas como para
--      observaciones de la calificación
--    - Se recomienda usar este campo para registrar el desempeño del estudiante
-- ============================================================================

