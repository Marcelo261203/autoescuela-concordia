# Guía Completa de Setup - Sistema de Gestión de Autoescuela

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Configurar Supabase](#paso-1-configurar-supabase)
3. [Paso 2: Crear la Base de Datos](#paso-2-crear-la-base-de-datos)
4. [Paso 3: Configurar Variables de Entorno](#paso-3-configurar-variables-de-entorno)
5. [Paso 4: Crear Usuario Admin](#paso-4-crear-usuario-admin)
6. [Paso 5: Ejecutar la Aplicación](#paso-5-ejecutar-la-aplicación)
7. [Verificación Final](#verificación-final)

---

## Requisitos Previos

Asegúrate de tener instalado:
- Node.js 18+ (recomendado 20+)
- npm o pnpm (recomendado pnpm)
- Una cuenta en [Supabase](https://supabase.com)

**Instalación de dependencias:**
\`\`\`bash
pnpm install
\`\`\`

---

## Paso 1: Configurar Supabase

### 1.1 Crear Proyecto
1. Ve a https://supabase.com y crea una cuenta
2. Haz clic en "New Project"
3. Selecciona o crea una organización
4. Completa los datos:
   - **Project Name**: `autoescuela-admin` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña fuerte (guárdala)
   - **Region**: Selecciona la más cercana a ti
5. Espera a que se cree el proyecto (2-3 minutos)

### 1.2 Obtener Credenciales
Una vez creado el proyecto:
1. Ve a **Settings** > **API**
2. Copia estos valores (los necesitarás después):
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Paso 2: Crear la Base de Datos

### 2.1 Ejecutar Script SQL

**IMPORTANTE**: Ejecuta los scripts EN ESTE ORDEN exacto.

#### Script 1: Crear Esquema (OBLIGATORIO)

1. Ve a **Supabase Dashboard** > **SQL Editor**
2. Haz clic en **"New Query"**
3. Copia TODO el contenido del archivo `scripts/01_create_schema.sql`
4. Pega en el editor SQL
5. Haz clic en **"RUN"** o presiona `Ctrl+Enter`
6. Espera a que termine (verás un checkmark verde)

**Qué hace este script:**
- ✅ Crea tabla `students` (estudiantes)
- ✅ Crea tabla `instructors` (instructores)
- ✅ Crea tabla `classes` (clases)
- ✅ Crea tabla `student_progress` (progreso)
- ✅ Configura índices para optimización
- ✅ Activa Row Level Security (RLS)
- ✅ Configura políticas de seguridad

#### Script 2: Datos de Prueba (OPCIONAL)

1. Nueva Query en SQL Editor
2. Copia el contenido del archivo `scripts/02_seed_data.sql`
3. Pega y ejecuta
4. Esto agrega instructores y estudiantes de prueba para demostración

---

## Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo `.env.local`

En la raíz del proyecto, crea un archivo `.env.local`:

\`\`\`bash
# Archivo: .env.local

# URLs de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (solo para servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL para redirect después de login (solo desarrollo)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

**¿Dónde conseguir estos valores?**
- Ve a tu proyecto Supabase
- Settings > API
- Copia los valores exactamente como aparecen
- ¡NO agregues espacios extras!

### 3.2 Verificar Variables

Abre `lib/supabase/client.ts` y verifica que use:
\`\`\`typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
\`\`\`

---

## Paso 4: Crear Usuario Admin

### 4.1 Crear usuario en Supabase

1. Ve a **Supabase Dashboard** > **Authentication** > **Users**
2. Haz clic en **"Add user"**
3. Completa los datos:
   - **Email**: `admin@autoescuela.com` (o el que prefieras)
   - **Password**: `Admin123456` (cámbialo después)
   - Marca "Auto Confirm User" (para que esté activo)
4. Haz clic en **"Create user"**

### 4.2 Verificar Usuario

El usuario debe aparecer en la lista de usuarios con estado "Confirmed".

---

## Paso 5: Ejecutar la Aplicación

### 5.1 Iniciar servidor de desarrollo

\`\`\`bash
pnpm dev
\`\`\`

Deberías ver:
\`\`\`
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
\`\`\`

### 5.2 Acceder a la Aplicación

1. Abre http://localhost:3000 en tu navegador
2. Verás la página de login
3. Ingresa las credenciales:
   - **Email**: `admin@autoescuela.com`
   - **Password**: `Admin123456`
4. Presiona "Iniciar Sesión"

---

## Verificación Final

Después de iniciar sesión, verifica que:

### Dashboard
- [ ] Se cargan los KPIs (Total Estudiantes, Instructores, etc.)
- [ ] Se visualizan los gráficos

### Módulo de Estudiantes
1. Ve a **Estudiantes** en la barra lateral
2. [ ] Se carga la lista
3. [ ] Puedes buscar estudiantes
4. [ ] Puedes filtrar por estado
5. [ ] Puedes crear un nuevo estudiante
6. [ ] Puedes editar un estudiante
7. [ ] Puedes ver detalles
8. [ ] Puedes eliminar un estudiante

### Módulo de Instructores
1. Ve a **Instructores**
2. [ ] Se carga la lista
3. [ ] Funciona CRUD completo

### Módulo de Clases
1. Ve a **Clases**
2. [ ] Se carga el calendario
3. [ ] Puedes crear una clase
4. [ ] Se actualiza el progreso automáticamente

### Reportes
1. Ve a **Reportes**
2. [ ] Se pueden generar reportes
3. [ ] Se puede exportar a CSV/PDF

---

## Solución de Problemas

### Error: "Supabase URL not configured"
**Solución**: Verifica que `.env.local` tenga las variables correctas y reinicia el servidor (`Ctrl+C` y `pnpm dev`).

### Error: "Invalid API key"
**Solución**: Copia nuevamente la `NEXT_PUBLIC_SUPABASE_ANON_KEY` desde Supabase Settings > API.

### Error: "PGRST116 - Record not found"
**Solución**: Es un error esperado cuando el progreso no existe. El sistema lo crea automáticamente.

### No puedo iniciar sesión
**Solución**:
1. Verifica que el usuario está "Confirmed" en Supabase > Authentication
2. Verifica la contraseña
3. Revisa la consola del navegador (F12) para ver el error exacto

### Las clases no se sincronizan
**Solución**: Los cambios se guardan en Supabase automáticamente. Si no se ven:
1. Recarga la página (F5)
2. Limpia cookies: DevTools > Application > Cookies > Delete

---

## Estructura de Bases de Datos

### Tabla: students
\`\`\`
id (UUID)                  - Identificador único
ci (VARCHAR)               - Cédula de identidad (única)
nombre (VARCHAR)           - Nombre del estudiante
apellido (VARCHAR)         - Apellido
email (VARCHAR)            - Email (único)
telefono (VARCHAR)         - Teléfono
direccion (TEXT)           - Dirección
fecha_nacimiento (DATE)    - Fecha de nacimiento (mín. 16 años)
estado (VARCHAR)           - activo/en_curso/graduado/inactivo
fecha_inscripcion (TIMESTAMP) - Cuándo se inscribió
created_at (TIMESTAMP)     - Creado
updated_at (TIMESTAMP)     - Actualizado
\`\`\`

### Tabla: instructors
\`\`\`
id (UUID)              - Identificador único
nombre (VARCHAR)       - Nombre
apellido (VARCHAR)     - Apellido
email (VARCHAR)        - Email (único)
telefono (VARCHAR)     - Teléfono
especialidad (VARCHAR) - Especialidad (ej: "Conducción Práctica")
disponibilidad (TEXT)  - Horarios disponibles
estado (VARCHAR)       - activo/inactivo
\`\`\`

### Tabla: classes
\`\`\`
id (UUID)              - Identificador único
estudiante_id (UUID)   - FK a students
instructor_id (UUID)   - FK a instructors
tipo (VARCHAR)         - practica/teorica
fecha (DATE)           - Fecha de la clase
hora (TIME)            - Hora de inicio
duracion_minutos (INT) - Duración en minutos
observaciones (TEXT)   - Notas
\`\`\`

### Tabla: student_progress
\`\`\`
id (UUID)                           - Identificador único
estudiante_id (UUID)                - FK a students (única)
clases_practicas_realizadas (INT)   - Contador
clases_teoricas_realizadas (INT)    - Contador
clases_practicas_requeridas (INT)   - Meta: 40
clases_teoricas_requeridas (INT)    - Meta: 20
porcentaje_avance (INT)             - Calculado automáticamente
\`\`\`

---

## Flujo de Funcionamiento

### Cuando se crea una clase:
1. Se inserta en tabla `classes`
2. Se llama automáticamente a `updateStudentProgress()`
3. Se recuenta clases prácticas y teóricas
4. Se calcula el porcentaje: `(realizadas / requeridas) * 100`
5. Se actualiza `student_progress`
6. El estado del estudiante puede cambiar a "graduado" si llega a 100%

### Cuando se intenta crear un duplicado:
1. Se verifica si existe otro estudiante con el mismo CI
2. Se verifica si existe otro estudiante con el mismo email
3. Si existe alguno, se rechaza la operación con error claro

---

## Comandos Útiles

\`\`\`bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar producción
pnpm start

# Limpiar caché
pnpm prune

# Verificar tipos TypeScript
pnpm tsc --noEmit
\`\`\`

---

## Soporte

Si necesitas ayuda:
1. Revisa la documentación oficial: https://supabase.com/docs
2. Consulta los logs en la consola del navegador (F12)
3. Revisa la consola del servidor terminal

¡Éxito con tu sistema! 🚀
