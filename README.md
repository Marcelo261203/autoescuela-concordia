# Sistema de Gestión de Estudiantes - Autoescuela

Frontend moderno e interactivo con datos mock para gestión de estudiantes en autoescuelas. Construido con Next.js 16, React 19, TypeScript y Tailwind CSS.

## Características

### Dashboard Administrativo
- ✅ Estadísticas en tiempo real con 5 KPIs
- ✅ Gráfico de tendencia (6 meses)
- ✅ Gráfico circular de distribución
- ✅ Tabla de resumen interactiva

### Gestión de Estudiantes
- ✅ CRUD completo con datos mock
- ✅ Listado con paginación (10 estudiantes por página)
- ✅ Búsqueda en tiempo real por CI, email, nombre
- ✅ Filtrado por estado (Activo, En Curso, Graduado, Inactivo)
- ✅ Crear nuevos estudiantes
- ✅ Editar información
- ✅ Eliminar con confirmación
- ✅ Vista detallada de estudiante

### Reportes y Exportación
- ✅ Filtro por estado
- ✅ Exportación a CSV
- ✅ Exportación a JSON
- ✅ Tabla con resultados
- ✅ Descarga directa de archivos

### Interfaz de Usuario
- ✅ Diseño responsive (mobile-first)
- ✅ Sidebar de navegación
- ✅ Animaciones smooth y transiciones
- ✅ Temas claros/oscuros
- ✅ Componentes modernos (Shadcn/ui)
- ✅ Iconos de Lucide React
- ✅ Formularios con validación UI

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19.2, TypeScript
- **Estilos**: Tailwind CSS v4, Shadcn/ui
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Cliente HTTP**: SWR (mock local)
- **Animaciones**: Tailwind CSS + Custom CSS

## Inicio Rápido

### Requisitos
- Node.js 18+
- npm o pnpm

### Instalación

1. **Instalar dependencias**
   \`\`\`bash
   pnpm install
   \`\`\`

2. **Ejecutar servidor de desarrollo**
   \`\`\`bash
   pnpm dev
   \`\`\`

3. **Acceder a la aplicación**
   - Abre http://localhost:3000
   - Serás redirigido a la página de login

## Credenciales Demo

- **Email:** admin@autoescuela.com
- **Contraseña:** admin123

## Estructura del Proyecto

\`\`\`
app/
├── login/               # Página de autenticación demo
├── dashboard/           # Dashboard principal
│   ├── page.tsx         # Home del dashboard
│   ├── students/        # Gestión de estudiantes
│   │   ├── page.tsx     # Listado
│   │   ├── create/      # Crear estudiante
│   │   └── [id]/        # Editar estudiante
│   └── reports/         # Página de reportes
├── layout.tsx           # Layout raíz
├── page.tsx             # Home que redirige a login
└── globals.css          # Estilos globales

components/
├── layout/
│   └── sidebar.tsx      # Navbar del dashboard
├── students/
│   ├── student-form.tsx # Formulario CRUD
│   └── student-list.tsx # Tabla con listado
├── reports/
│   └── report-generator.tsx # Generador de reportes
└── ui/                  # Componentes shadcn/ui

lib/
└── utils.ts             # Utilidades
\`\`\`

## Datos Mock

El sistema incluye 9 estudiantes de ejemplo:

| CI | Nombre | Apellido | Email | Estado |
|--|--|--|--|--|
| 12345678 | Juan | Pérez | juan@example.com | Activo |
| 87654321 | María | García | maria@example.com | En Curso |
| 11223344 | Carlos | López | carlos@example.com | Graduado |
| 55667788 | Ana | Rodríguez | ana@example.com | Activo |
| 99001122 | Luis | Martínez | luis@example.com | En Curso |
| 33445566 | Sofia | Sánchez | sofia@example.com | Inactivo |
| 77889900 | Miguel | Hernández | miguel@example.com | Activo |
| 12121212 | Laura | Torres | laura@example.com | En Curso |
| 34343434 | Diego | Flores | diego@example.com | Graduado |

## Funcionalidades por Página

### Login (/login)
- Formulario de autenticación mock
- Validación de email y contraseña
- Mensajes de error
- Redirección a dashboard

### Dashboard (/dashboard)
- 5 tarjetas KPI animadas
- Gráfico de barras con tendencia
- Gráfico circular con distribución
- Tabla con resumen por estado

### Estudiantes (/dashboard/students)
- Tabla con datos mock
- Búsqueda en tiempo real
- Filtro por estado
- Paginación
- Botones de editar/eliminar

### Crear Estudiante (/dashboard/students/create)
- Formulario completo
- Campos: CI, Email, Nombre, Apellido, Teléfono, Dirección, Fecha Nacimiento, Estado, Notas
- Validación en UI
- Feedback visual

### Editar Estudiante (/dashboard/students/[id])
- Carga datos del estudiante
- Formulario pre-rellenado
- Validación en UI
- Mensaje de éxito

### Reportes (/dashboard/reports)
- Filtro por estado
- Exportación a CSV
- Exportación a JSON
- Tabla de resultados
- Resumen de datos

## Animaciones Incluidas

- **Fade-in**: Entrada suave de páginas (400ms)
- **Hover Scale**: Escala en hover de cards (300ms)
- **Transiciones**: Cambios de color suaves (200ms)
- **Delays escalonados**: Cards del dashboard con delay (50ms cada una)

## Desarrollo

### Agregar nuevos estudiantes mock
Edita `components/students/student-list.tsx` en el array `mockStudents`

### Cambiar datos del dashboard
Edita `app/dashboard/page.tsx` en las constantes `mockSummary` y `trendData`

### Personalizar colores
Modifica las variables CSS en `app/globals.css` (sección `:root`)

## Notas Importantes

- ✅ **Sin backend**: Todo funciona en el cliente
- ✅ **Sin base de datos**: Datos mock locales
- ✅ **Sin APIs externas**: Completamente independiente
- ✅ **Completamente funcional**: Todas las interacciones trabajan
- ✅ **Responsive**: Compatible con mobile, tablet y desktop

## Próximos Pasos

Para convertir esto en un sistema real con backend:

1. Conectar a una base de datos (Supabase, PostgreSQL, etc.)
2. Implementar autenticación real
3. Reemplazar datos mock con llamadas API
4. Agregar validación de servidor
5. Implementar Row Level Security

## Build para Producción

\`\`\`bash
pnpm build
pnpm start
\`\`\`

---

**Frontend Demo - Gestión de Estudiantes 🎓**

*Sistema completo de UI con datos mock y animaciones suaves.*
\`\`\`
