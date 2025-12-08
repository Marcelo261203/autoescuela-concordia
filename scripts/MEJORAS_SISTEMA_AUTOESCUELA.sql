-- ============================================================================
-- MEJORAS AL SISTEMA DE AUTOESCUELA - REQUISITOS PERSONALIZADOS Y EXAMEN
-- ============================================================================
-- Este script agrega funcionalidades para:
-- 1. Categorías de licencia (M, P, A, B, C)
-- 2. Requisitos personalizados por estudiante
-- 3. Sistema de examen final con penalización manual
-- 4. Duración estándar de clases por estudiante
-- ============================================================================

-- ============================================================================
-- 1. AGREGAR CATEGORÍA DE LICENCIA A LA TABLA classes
-- ============================================================================
-- Permite identificar qué tipo de licencia está estudiando el alumno
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS categoria_licencia VARCHAR(2)
CHECK (categoria_licencia IN ('M', 'P', 'A', 'B', 'C'));

-- Comentario: 
-- M = Moto
-- P = Particular (Auto)
-- A = Autobús
-- B = Bus/Camión
-- C = Categoría profesional (la más alta en Bolivia)

-- ============================================================================
-- 2. AGREGAR CATEGORÍA DE LICENCIA A LA TABLA students
-- ============================================================================
-- Esto permite saber qué categoría está estudiando cada alumno
ALTER TABLE students
ADD COLUMN IF NOT EXISTS categoria_licencia_deseada VARCHAR(2)
CHECK (categoria_licencia_deseada IN ('M', 'P', 'A', 'B', 'C'));

-- Comentario:
-- Permite filtrar estudiantes por categoría que están estudiando
-- Útil para reportes y gestión

-- ============================================================================
-- 3. AGREGAR CAMPOS DE REQUISITOS PERSONALIZADOS POR ESTUDIANTE
-- ============================================================================
-- Estos campos permiten que cada estudiante tenga requisitos diferentes
-- según su categoría, experiencia previa, o negociación con la autoescuela
ALTER TABLE student_progress
ADD COLUMN IF NOT EXISTS horas_practicas_requeridas INTEGER DEFAULT 720,  -- 12 horas en minutos (editable)
ADD COLUMN IF NOT EXISTS horas_teoricas_requeridas INTEGER DEFAULT 600;   -- 10 horas en minutos (editable)

-- Comentario:
-- Estos valores son EDITABLES por estudiante
-- Ejemplo: Estudiante con experiencia puede tener 6h prácticas, principiante 20h
-- Ejemplo: Categoría C puede requerir más horas que categoría P

-- ============================================================================
-- 4. AGREGAR DURACIÓN ESTÁNDAR DE CLASES POR ESTUDIANTE
-- ============================================================================
-- La duración estándar se aplica a todas las clases del estudiante (teóricas y prácticas)
ALTER TABLE student_progress
ADD COLUMN IF NOT EXISTS duracion_estandar_minutos INTEGER DEFAULT 60
CHECK (duracion_estandar_minutos > 0);

-- Comentario:
-- Este valor se usa como duración por defecto para todas las clases del estudiante
-- Se puede personalizar por estudiante (30 min, 60 min, 90 min, etc.)
-- Cuando se crea una clase, se puede usar este valor o sobrescribirlo manualmente

-- ============================================================================
-- 5. AGREGAR CAMPOS DE EXAMEN FINAL
-- ============================================================================
ALTER TABLE student_progress
ADD COLUMN IF NOT EXISTS nota_final NUMERIC(5,2)
CHECK (nota_final >= 0 AND nota_final <= 100),           -- Nota del examen (0-100)
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT NULL,      -- NULL = pendiente, true = aprobado (>=51), false = reprobado (<=50)
ADD COLUMN IF NOT EXISTS reintentos INTEGER DEFAULT 0,       -- Número de veces que ha reprobado
ADD COLUMN IF NOT EXISTS horas_penalizacion_practicas INTEGER DEFAULT 0,  -- Horas extra por reprobar (MANUAL)
ADD COLUMN IF NOT EXISTS horas_penalizacion_teoricas INTEGER DEFAULT 0; -- Horas extra por reprobar (MANUAL)

-- Comentario:
-- Sistema de examen:
-- - Nota sobre 100 puntos
-- - 51 o más = APROBADO (aprobado = true)
-- - 50 o menos = REPROBADO (aprobado = false)
-- - Penalización es MANUAL: el administrador decide cuántas horas extra agregar
-- - Las horas de penalización se suman a los requisitos originales
-- - Ejemplo: Requisito original 12h prácticas, reprueba, admin agrega 2h penalización, ahora necesita 14h

-- ============================================================================
-- 6. CREAR ÍNDICES PARA BÚSQUEDAS Y AGRUPACIÓN
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_classes_categoria ON classes(categoria_licencia);
CREATE INDEX IF NOT EXISTS idx_students_categoria ON students(categoria_licencia_deseada);
CREATE INDEX IF NOT EXISTS idx_classes_estudiante_fecha ON classes(estudiante_id, fecha);

-- Comentario:
-- El índice idx_classes_estudiante_fecha facilita agrupar clases por estudiante
-- y ordenarlas por fecha en la interfaz

-- ============================================================================
-- NOTAS IMPORTANTES SOBRE EL FUNCIONAMIENTO:
-- ============================================================================
-- 1. REQUISITOS PERSONALIZADOS:
--    - Cada estudiante puede tener requisitos diferentes
--    - Se establecen al crear el progreso o se editan manualmente
--    - Valores por defecto: 720 min (12h) prácticas, 600 min (10h) teóricas
--
-- 2. DURACIÓN ESTÁNDAR DE CLASES:
--    - Cada estudiante tiene una duración estándar (ej: 60 minutos)
--    - Esta duración se aplica a todas sus clases (teóricas y prácticas)
--    - Se puede sobrescribir manualmente al crear una clase específica
--    - Útil para estudiantes que siempre tienen clases de la misma duración
--
-- 3. SISTEMA DE EXAMEN:
--    - Nota sobre 100 puntos
--    - 51+ = APROBADO, 50 o menos = REPROBADO
--    - Si reprueba, el administrador puede agregar horas de penalización MANUALMENTE
--    - Las horas de penalización son personalizadas por caso
--    - Ejemplo: Estudiante reprueba con 45, admin decide agregar 3h prácticas y 2h teóricas
--
-- 4. CÁLCULO DE PROGRESO:
--    - Debe considerar: horas_practicas_requeridas + horas_penalizacion_practicas
--    - Debe considerar: horas_teoricas_requeridas + horas_penalizacion_teoricas
--    - El estudiante debe completar TODAS las horas (originales + penalización) para graduarse
--
-- 5. AGRUPACIÓN DE CLASES:
--    - Las clases se pueden agrupar por estudiante en la interfaz
--    - Útil para ver el historial completo de clases de un estudiante
--    - Se ordenan por fecha (más reciente primero o más antigua primero)
-- ============================================================================

