# Guía Detallada - Cómo Ejecutar Script SQL en Supabase

## ¿Por Qué Necesitas Este Script?

El script SQL crea toda la estructura de la base de datos:
- ✅ 4 tablas principales
- ✅ Índices para búsquedas rápidas
- ✅ Seguridad con Row Level Security (RLS)
- ✅ Triggers para auto-actualizar datos
- ✅ Validaciones a nivel de BD

Sin este script, **la aplicación no funcionará**.

---

## 📍 Dónde Ejecutar el Script

Hay 3 formas de ejecutar el script:

### Opción 1: Supabase UI (RECOMENDADO)
\`\`\`
Dashboard → SQL Editor → New Query → Pegar Script → RUN
\`\`\`

### Opción 2: CLI de Supabase
\`\`\`bash
supabase db push
\`\`\`

### Opción 3: psql (línea de comando PostgreSQL)
\`\`\`bash
psql "postgresql://..." < scripts/SCRIPT_SUPABASE_COMPLETO.sql
\`\`\`

---

## 🚀 Método Recomendado: Supabase UI

### Paso 1: Abrir Supabase

1. Ve a https://supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto "autoescuela"

### Paso 2: Ir a SQL Editor

En la barra izquierda:
\`\`\`
Supabase Dashboard
    ↓
(icono de >_) SQL Editor
    ↓
"New query" (botón azul)
\`\`\`

### Paso 3: Copiar Script

**Opción A: Copiar Todo el Script**

1. Abre archivo: `scripts/SCRIPT_SUPABASE_COMPLETO.sql`
2. Presiona `Ctrl+A` (seleccionar todo)
3. Presiona `Ctrl+C` (copiar)

**Opción B: Script Mínimo**

Si prefieres algo más pequeño, usa este script mínimo:

\`\`\`sql
-- CREAR TABLA ESTUDIANTES
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ci VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CREAR TABLA INSTRUCTORES
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  disponibilidad TEXT,
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CREAR TABLA CLASES
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion_minutos INTEGER DEFAULT 60,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CREAR TABLA PROGRESO
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

-- HABILITAR RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- CREAR POLÍTICAS RLS
CREATE POLICY "authenticated_access" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON instructors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON student_progress FOR ALL USING (auth.role() = 'authenticated');
\`\`\`

### Paso 4: Pegar en el Editor

En la ventana del SQL Editor vacía:
1. Presiona `Ctrl+V` (pegar)
2. Verás el script completo en el editor

### Paso 5: Ejecutar Script

**Opción A: Botón RUN (Visual)**
- En la esquina superior derecha, haz clic en botón azul "RUN"
- O presiona `Ctrl+Enter`

**Opción B: Atajo de Teclado**
- Presiona `Ctrl+Enter`

### Paso 6: Esperar Resultado

Verás uno de estos resultados:

**✅ Éxito (Verde)**
\`\`\`
Success
3.2s

Tables created successfully
\`\`\`

**⚠️ Warning (Amarillo) - ES NORMAL**
\`\`\`
function "update_updated_at_column" already exists, skipping
Table "students" already exists, skipping
\`\`\`

Si dice "already exists", significa que el script ya se ejecutó o la tabla existe. No es un error.

**❌ Error (Rojo) - PROBLEMA**
\`\`\`
Error
Parse error near "CREATE TABLE"
\`\`\`

Si hay error rojo, verifica:
1. ¿Copiaste el script correctamente?
2. ¿No hay caracteres especiales?
3. ¿El script no está cortado?

---

## ✅ Verificar que Funcionó

Después de ejecutar el script, verifica que las tablas se crearon:

### 1. Ver Tablas en Supabase

**En el panel izquierdo:**
\`\`\`
Supabase Dashboard
    ↓
Database (icono de BD)
    ↓
Tables (abajo a la izquierda)
\`\`\`

Deberías ver:
- [ ] `students`
- [ ] `instructors`
- [ ] `classes`
- [ ] `student_progress`

Si ves estas 4 tablas, ¡**funcionó correctamente!** ✅

### 2. Ver Estructura de Tabla

Haz clic en una tabla (ej: `students`) para ver:
\`\`\`
Columnas:
✓ id (UUID)
✓ ci (VARCHAR)
✓ nombre (VARCHAR)
✓ apellido (VARCHAR)
✓ email (VARCHAR)
✓ telefono (VARCHAR)
✓ direccion (TEXT)
✓ fecha_nacimiento (DATE)
✓ estado (VARCHAR)
✓ fecha_inscripcion (TIMESTAMP)
✓ created_at (TIMESTAMP)
✓ updated_at (TIMESTAMP)
\`\`\`

### 3. Ver Índices

En una tabla, tab "Indexes":
\`\`\`
idx_students_ci
idx_students_email
idx_students_estado
\`\`\`

### 4. Ver Políticas RLS

Tab "RLS Policies":
\`\`\`
admin_insert
admin_select
admin_update
admin_delete
\`\`\`

Si ves todo esto, el setup es correcto.

---

## 🆘 Solucionar Problemas

### Problema: "Syntax error"

**Causa**: Caracteres especiales o script cortado

**Solución**:
1. Elimina todo del editor
2. Abre el archivo `scripts/SCRIPT_SUPABASE_COMPLETO.sql` con un editor de texto
3. Copia DE NUEVO
4. Pega en Supabase
5. Ejecuta

### Problema: "Permission denied"

**Causa**: Tu usuario no tiene permisos

**Solución**:
1. Ve a Supabase Settings
2. Users: Verifica que tengas rol de "admin"
3. Si no, pide a administrador que te agregue permisos

### Problema: "Table already exists"

**Causa**: Ya ejecutaste el script una vez

**Solución**:
1. Es normal, no hay problema
2. El script tiene `IF NOT EXISTS` para evitar duplicados
3. Puedes ejecutarlo de nuevo sin miedo

### Problema: RLS policies no se crean

**Causa**: Syntax error en las políticas

**Solución**:
Ejecuta este script para crear políticas manualmente:

\`\`\`sql
CREATE POLICY "all_authenticated_access" ON students
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated_access" ON instructors
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated_access" ON classes
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated_access" ON student_progress
  FOR ALL USING (auth.role() = 'authenticated');
\`\`\`

---

## 📊 Qué Hace Cada Parte del Script

### Parte 1: Crear Tablas
\`\`\`sql
CREATE TABLE IF NOT EXISTS students ( ... )
\`\`\`
- Crea tabla de estudiantes
- `IF NOT EXISTS` = no falla si ya existe
- Todos los campos con tipos específicos

### Parte 2: Crear Índices
\`\`\`sql
CREATE INDEX IF NOT EXISTS idx_students_ci ON students(ci);
\`\`\`
- Optimiza búsquedas en estos campos
- Hace que `WHERE ci = 'xxx'` sea muy rápido

### Parte 3: Habilitar RLS
\`\`\`sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
\`\`\`
- Activa seguridad a nivel de fila
- Solo usuarios autenticados pueden acceder

### Parte 4: Crear Políticas RLS
\`\`\`sql
CREATE POLICY "Admin can view all students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');
\`\`\`
- Define quién puede hacer qué
- `FOR SELECT` = solo lectura
- `USING (auth.role() = 'authenticated')` = solo usuarios logueados

### Parte 5: Crear Triggers
\`\`\`sql
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`
- Cada vez que se actualiza un registro
- Automáticamente actualiza `updated_at` con la hora actual

---

## 🔄 Ejecutar Script Múltiples Veces

**¿Puedo ejecutar el script varias veces?**

✅ **SÍ, es seguro**

El script tiene `IF NOT EXISTS` en todas partes, así que:
- Si la tabla existe, la ignora
- Si el índice existe, lo ignora
- Si la política existe, la ignora

**Caso de uso**: Si algo falla a mitad, puedes ejecutar de nuevo sin problemas.

---

## 📝 Script Paso a Paso Explicado

### Línea 1-10: Crear tabla students
\`\`\`sql
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Crea ID único automáticamente
  
  ci VARCHAR(20) UNIQUE NOT NULL,
  -- CI debe ser único (no puede haber dos iguales)
  
  nombre VARCHAR(100) NOT NULL,
  -- Nombre obligatorio, máximo 100 caracteres
  
  email VARCHAR(255) UNIQUE NOT NULL,
  -- Email único y obligatorio
  
  estado VARCHAR(20) DEFAULT 'activo',
  -- Por defecto es 'activo'
  
  created_at TIMESTAMP DEFAULT NOW(),
  -- Automáticamente la fecha/hora de creación
  
  updated_at TIMESTAMP DEFAULT NOW()
  -- Automáticamente la fecha/hora de actualización
);
\`\`\`

### Línea 50-60: Crear índices
\`\`\`sql
CREATE INDEX IF NOT EXISTS idx_students_ci ON students(ci);
-- Cuando busques por CI, es muy rápido
-- Sin índice: busca en todas las filas (lento)
-- Con índice: búsqueda binaria (rápido)
\`\`\`

### Línea 70-80: Habilitar RLS
\`\`\`sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- Activa seguridad
-- Sin esto: cualquiera podría acceder a todo
-- Con esto: solo usuarios autenticados
\`\`\`

### Línea 90-100: Crear políticas
\`\`\`sql
CREATE POLICY "Admin can view all students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');
-- Permite SELECT (lectura) si estás autenticado
-- Otros usuarios no pueden ver nada
\`\`\`

---

## ✨ Después de Ejecutar el Script

### Verificación Rápida (2 min)

1. **Tablas creadas**: Ve a Database > Tables
   - [ ] students
   - [ ] instructors
   - [ ] classes
   - [ ] student_progress

2. **Índices creados**: Haz clic en tabla > Indexes
   - [ ] idx_students_ci
   - [ ] idx_students_email
   - [ ] idx_students_estado

3. **RLS habilitado**: Haz clic en tabla > RLS Policies
   - [ ] Ves políticas listadas

4. **Triggers creados**: SQL Editor > New Query
   \`\`\`sql
   SELECT * FROM pg_trigger WHERE tgname LIKE 'update_%';
   \`\`\`
   - [ ] Ves triggers listados

Si todo está ✅, **¡el script funcionó perfectamente!**

---

## 🎯 Próximo Paso

Una vez que el script se ejecutó correctamente:

1. ✅ Script SQL ejecutado
2. ⏭️ **Crear usuario admin** (siguiente paso)
3. ⏭️ Configurar `.env.local`
4. ⏭️ Ejecutar `pnpm dev`

---

## 📞 Soporte

Si algo no funciona:

1. **Revisa los logs**: Supabase muestra el error exacto en rojo
2. **Copia el error**: Búscalo en Google o en docs de Supabase
3. **Reintentar**: Ejecuta el script de nuevo
4. **Contactar soporte**: Supabase tiene chat de soporte 24/7

---

**¡Listo! El script SQL es la base de todo. Una vez ejecutado, todo lo demás funciona automáticamente.** 🚀
