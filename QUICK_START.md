# Inicio Rápido - 10 Minutos

## Para Usuarios Nuevos

### Minuto 1: Leer la Descripción
Este es un **Sistema de Gestión de Estudiantes completo** para autoescuelas con:
- Autenticación segura
- Gestión de estudiantes (CRUD)
- Dashboard con estadísticas
- Reportes y exportación
- Búsqueda y filtros avanzados

### Minuto 2-4: Setup en Supabase
1. Ve a https://supabase.com (crea cuenta si necesario)
2. Crea un proyecto nuevo
3. Ve a SQL Editor
4. Copia el contenido de `scripts/01_create_tables.sql`
5. Pégalo y ejecuta
6. Ve a Authentication > Users
7. Crea usuario: `admin@autoescuela.com` con contraseña
8. Marca "Auto confirm user"

### Minuto 5-7: Configurar Variables
1. En Supabase > Settings > API, copia:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Crea archivo `.env.local` en la raíz
3. Pega las variables
4. También agrega `POSTGRES_URL` desde Pool Connection

### Minuto 8: Instalar Dependencias
\`\`\`bash
pnpm install
\`\`\`

### Minuto 9: Ejecutar Localmente
\`\`\`bash
pnpm dev
\`\`\`

### Minuto 10: Prueba
1. Abre http://localhost:3000
2. Ingresa: `admin@autoescuela.com` y tu contraseña
3. ¡Listo! Estás en el dashboard

---

## Próximos Pasos

### Crear tu Primer Estudiante
1. Haz clic en "Estudiantes" en la barra lateral
2. Haz clic en "Nuevo Estudiante"
3. Completa el formulario:
   - Cédula: 12345678
   - Email: estudiante@example.com
   - Nombre: Juan
   - Apellido: Pérez
   - Teléfono: +58 414 1234567
   - Dirección: Calle Principal 123
   - Fecha de Nacimiento: 2005-01-01
   - Estado: Activo
4. Haz clic en "Crear"

### Explorar Funcionalidades
- **Estudiantes**: Ver, editar, eliminar, buscar
- **Dashboard**: Ver estadísticas en tiempo real
- **Reportes**: Descargar CSV con datos

---

## Problemas Comunes

**Error: "relation students does not exist"**
→ La migración SQL no se ejecutó. Ve a Supabase SQL Editor y ejecuta `scripts/01_create_tables.sql`

**Error: "Unauthorized"**
→ Crea el usuario admin en Supabase Authentication

**Error: "NEXT_PUBLIC_SUPABASE_URL is not set"**
→ Crea `.env.local` con las variables

**No puedo iniciar sesión**
→ Verifica que el usuario exista en Supabase > Authentication > Users

---

## Comandos Útiles

\`\`\`bash
# Desarrollo
pnpm dev

# Producción
pnpm build
pnpm start

# Instalar dependencias
pnpm install
\`\`\`

---

## Para Desarrolladores

Lee los siguientes archivos en orden:
1. [INDEX.md](./INDEX.md) - Índice completo
2. [README.md](./README.md) - Descripción general
3. [FEATURES.md](./FEATURES.md) - Características
4. Código en `lib/services/student-service.ts`

---

¡Eso es! Tu sistema está listo para usar.

Para más detalles, lee [README.md](./README.md) o [SETUP.md](./SETUP.md).
