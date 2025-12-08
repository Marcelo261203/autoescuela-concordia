# Índice Completo del Sistema de Gestión de Estudiantes

## Documentación Rápida

### Para Usuarios Nuevos
1. Lee [README.md](./README.md) - Descripción general
2. Lee [SETUP.md](./SETUP.md) - Instrucciones de instalación
3. Lee [FEATURES.md](./FEATURES.md) - Características disponibles

### Para Desarrolladores
1. Revisa la [estructura del proyecto](./README.md#estructura-del-proyecto)
2. Lee [lib/types/student.ts](./lib/types/student.ts) - Tipos de datos
3. Estudia [lib/services/student-service.ts](./lib/services/student-service.ts) - Lógica de negocio
4. Examina [app/api/](./app/api/) - Endpoints disponibles

### Para DevOps/Despliegue
1. Lee [DEPLOYMENT.md](./DEPLOYMENT.md) - Guías de despliegue
2. Lee [SETUP.md](./SETUP.md) - Configuración de Supabase
3. Revisa [.env.example](./.env.example) - Variables necesarias

## Archivos Principales

### Configuración
- `app/layout.tsx` - Layout raíz
- `app/globals.css` - Estilos globales
- `middleware.ts` - Middleware de autenticación
- `next.config.mjs` - Configuración de Next.js
- `tsconfig.json` - Configuración de TypeScript
- `package.json` - Dependencias del proyecto

### Autenticación
- `lib/supabase/client.ts` - Cliente Supabase
- `lib/supabase/server.ts` - Servidor Supabase
- `lib/supabase/middleware.ts` - Middleware de Supabase
- `app/auth/login/page.tsx` - Página de login

### API Routes
- `app/api/students/` - CRUD de estudiantes
- `app/api/dashboard/summary/` - Resumen del dashboard
- `app/api/reports/` - Endpoints de reportes

### Páginas del Dashboard
- `app/dashboard/page.tsx` - Dashboard principal
- `app/dashboard/students/page.tsx` - Listado de estudiantes
- `app/dashboard/students/create/page.tsx` - Crear estudiante
- `app/dashboard/students/[id]/page.tsx` - Editar estudiante
- `app/dashboard/reports/page.tsx` - Reportes

### Componentes
- `components/layout/sidebar.tsx` - Barra lateral
- `components/students/student-form.tsx` - Formulario de estudiante
- `components/students/student-list.tsx` - Listado de estudiantes
- `components/reports/report-generator.tsx` - Generador de reportes

### Servicios y Lógica
- `lib/services/student-service.ts` - Lógica de estudiantes
- `lib/services/report-service.ts` - Lógica de reportes
- `lib/hooks/use-students.ts` - Hook para estudiantes

### Utilidades
- `lib/types/student.ts` - Tipos TypeScript
- `lib/utils/validation.ts` - Validaciones
- `lib/utils/security.ts` - Funciones de seguridad
- `lib/utils/error-handler.ts` - Manejo de errores

### Base de Datos
- `scripts/01_create_tables.sql` - Script de migración
- `scripts/setup-database.ts` - Setup script

## Flujo de Datos

\`\`\`
Usuario
  ↓
Página (Page.tsx)
  ↓
Componente (Component.tsx)
  ↓
Hook (use-students.ts)
  ↓
API Route (app/api/...)
  ↓
Service (student-service.ts)
  ↓
Supabase
  ↓
PostgreSQL
\`\`\`

## Estructura de Carpetas

\`\`\`
/
├── app/
│   ├── api/                    # API Routes
│   ├── auth/                   # Autenticación
│   ├── dashboard/              # Dashboard
│   ├── layout.tsx              # Layout raíz
│   ├── page.tsx                # Página inicio
│   └── globals.css             # Estilos globales
├── components/                 # Componentes React
│   ├── layout/
│   ├── students/
│   ├── reports/
│   └── ui/                     # Componentes shadcn/ui
├── lib/
│   ├── supabase/              # Config Supabase
│   ├── services/              # Lógica de negocio
│   ├── types/                 # Tipos TypeScript
│   ├── utils/                 # Utilidades
│   └── hooks/                 # Custom hooks
├── middleware.ts              # Middleware
├── scripts/                   # Scripts de setup
├── public/                    # Archivos estáticos
└── .env.example              # Variables de ejemplo
\`\`\`

## Stack Tecnológico

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Shadcn/ui
- Lucide Icons
- SWR

### Backend
- Next.js API Routes
- TypeScript
- Supabase Auth

### Base de Datos
- PostgreSQL
- Supabase
- Row Level Security

### Herramientas
- Vercel (Hosting)
- GitHub (Versionado)
- Docker (Containerización)

## Comandos Útiles

\`\`\`bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo
pnpm build            # Construir para producción
pnpm start            # Iniciar servidor de producción
pnpm lint             # Ejecutar linter

# Dependencias
pnpm install          # Instalar dependencias
pnpm update           # Actualizar dependencias

# Base de datos
psql $POSTGRES_URL_NON_POOLING < scripts/01_create_tables.sql  # Ejecutar migraciones
\`\`\`

## Endpoints API Completos

### Estudiantes
\`\`\`
GET    /api/students                    # Listar con paginación y búsqueda
POST   /api/students                    # Crear
GET    /api/students/[id]               # Obtener por ID
PUT    /api/students/[id]               # Actualizar
DELETE /api/students/[id]               # Eliminar
\`\`\`

### Dashboard
\`\`\`
GET    /api/dashboard/summary           # Resumen de estadísticas
\`\`\`

### Reportes
\`\`\`
GET    /api/reports/summary             # Resumen para reportes
GET    /api/reports/export?format=csv   # Exportar CSV
\`\`\`

## Variables de Entorno Necesarias

\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URL
POSTGRES_URL_NON_POOLING
SUPABASE_JWT_SECRET
POSTGRES_HOST
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DATABASE
\`\`\`

## Guía Rápida de Contribución

1. Crea una rama: `git checkout -b feature/nombre`
2. Haz cambios
3. Commit: `git commit -m "Descripción"`
4. Push: `git push origin feature/nombre`
5. Abre Pull Request

## FAQ

### ¿Cómo agrego un nuevo campo a estudiantes?
1. Modifica el script SQL en `scripts/01_create_tables.sql`
2. Actualiza `lib/types/student.ts`
3. Actualiza `StudentForm` en `components/students/student-form.tsx`
4. Actualiza `StudentService` en `lib/services/student-service.ts`

### ¿Cómo agrego una nueva página?
1. Crea `app/nueva-pagina/page.tsx`
2. Importa componentes necesarios
3. El routing es automático

### ¿Cómo hago debug?
1. Abre DevTools (F12)
2. Revisa la consola y Network
3. Usa `console.log()` en el código

## Soporte

- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación existente

---

**Sistema de Gestión de Estudiantes v1.0**
Desarrollado con ❤️ usando Next.js y Supabase
