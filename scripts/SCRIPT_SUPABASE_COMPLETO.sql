-- ============================================================================
-- SISTEMA DE GESTIÓN DE AUTOESCUELA - SCRIPT SQL COMPLETO
-- ============================================================================
-- Este script crea toda la estructura de base de datos necesaria.
-- Cópialo completamente y pégalo en Supabase SQL Editor.
-- IMPORTANTE: Si ves error de tabla existente, es normal si ya la creaste.
-- ============================================================================

-- 1. CREAR TABLA DE ESTUDIANTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ci VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'en_curso', 'graduado', 'inactivo')),
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_fecha_nacimiento CHECK (fecha_nacimiento <= CURRENT_DATE - INTERVAL '16 years')
);

-- 2. CREAR TABLA DE INSTRUCTORES
-- ============================================================================
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  disponibilidad TEXT,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CREAR TABLA DE CLASES
-- ============================================================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('practica', 'teorica')),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion_minutos INTEGER NOT NULL DEFAULT 60,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. CREAR TABLA DE PROGRESO DEL ESTUDIANTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  clases_practicas_realizadas INTEGER DEFAULT 0,
  clases_teoricas_realizadas INTEGER DEFAULT 0,
  clases_practicas_requeridas INTEGER DEFAULT 40,
  clases_teoricas_requeridas INTEGER DEFAULT 20,
  porcentaje_avance INTEGER DEFAULT 0,
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- 5. CREAR ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_ci ON students(ci);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_estado ON students(estado);
CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);
CREATE INDEX IF NOT EXISTS idx_instructors_estado ON instructors(estado);
CREATE INDEX IF NOT EXISTS idx_classes_estudiante ON classes(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_classes_instructor ON classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_fecha ON classes(fecha);
CREATE INDEX IF NOT EXISTS idx_progress_estudiante ON student_progress(estudiante_id);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS DE SEGURIDAD - ESTUDIANTES
-- ============================================================================
CREATE POLICY "Admin can view all students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert students" ON students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update students" ON students
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete students" ON students
  FOR DELETE USING (auth.role() = 'authenticated');

-- 8. CREAR POLÍTICAS DE SEGURIDAD - INSTRUCTORES
-- ============================================================================
CREATE POLICY "Admin can view instructors" ON instructors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert instructors" ON instructors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update instructors" ON instructors
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete instructors" ON instructors
  FOR DELETE USING (auth.role() = 'authenticated');

-- 9. CREAR POLÍTICAS DE SEGURIDAD - CLASES
-- ============================================================================
CREATE POLICY "Admin can view classes" ON classes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert classes" ON classes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update classes" ON classes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete classes" ON classes
  FOR DELETE USING (auth.role() = 'authenticated');

-- 10. CREAR POLÍTICAS DE SEGURIDAD - PROGRESO
-- ============================================================================
CREATE POLICY "Admin can view progress" ON student_progress
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert progress" ON student_progress
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update progress" ON student_progress
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 11. CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. CREAR TRIGGERS PARA ACTUALIZAR TIMESTAMP AUTOMÁTICAMENTE
-- ============================================================================
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instructors_updated_at ON instructors;
CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON instructors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIN DEL SCRIPT - Todas las tablas están creadas y configuradas
-- ============================================================================
