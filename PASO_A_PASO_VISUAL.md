# Guía Visual Paso a Paso - Sistema de Autoescuela

## 🎯 Objetivo
Tener el sistema completamente funcional en 30 minutos.

---

## ⏱️ Tiempo estimado: 5 min - Crear Proyecto Supabase

### Paso 1: Ir a Supabase
\`\`\`
1. Abre https://supabase.com
2. Haz clic en "Sign In" (esquina superior derecha)
3. Si no tienes cuenta, crea una (GitHub/Google/Email)
\`\`\`

### Paso 2: Crear Proyecto
\`\`\`
1. Dashboard > New Project
2. Selecciona organización (o crea una)
3. Nombre: "autoescuela" (o lo que prefieras)
4. Password: [crea una fuerte y cópiala en un lugar seguro]
5. Region: Selecciona la más cercana
6. Haz clic en "Create new project"
7. Espera 2-3 minutos
\`\`\`

### Paso 3: Copiar Credenciales
Una vez listo el proyecto:
\`\`\`
1. Settings (engranaje, abajo a la izquierda)
   ↓
2. API (en el menú)
   ↓
3. Verás:
   - Project URL          → Copia esto
   - anon public          → Copia esto
   - service_role secret  → Copia esto
\`\`\`

**Guarda en un editor de texto:**
\`\`\`
URL: https://xxxxxxxxxxxxx.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

---

## ⏱️ Tiempo estimado: 8 min - Crear Base de Datos

### Paso 4: Ir a SQL Editor
\`\`\`
1. Supabase Dashboard
2. Menú izquierdo: "SQL Editor"
3. Botón azul "New query"
\`\`\`

### Paso 5: Ejecutar Script SQL
\`\`\`
1. Abre el archivo: scripts/SCRIPT_SUPABASE_COMPLETO.sql
2. Copia TODO el contenido
3. Pega en el editor SQL de Supabase
4. Presiona Ctrl+Enter (o botón "RUN")
5. Espera a que termine (verás checkmark verde)
\`\`\`

### Paso 6: Crear Usuario Admin
\`\`\`
1. Supabase Dashboard
2. Menú izquierdo: "Authentication"
3. Tab "Users"
4. Botón azul "Add user"
5. Completa:
   - Email: admin@autoescuela.com
   - Password: Admin123456
   - Marca "Auto Confirm User"
6. Botón "Create user"
\`\`\`

---

## ⏱️ Tiempo estimado: 5 min - Configurar Variables de Entorno

### Paso 7: Crear .env.local
\`\`\`
1. En la raíz del proyecto (junto a package.json)
2. Crea archivo: .env.local
3. Pega esto (reemplaza con tus valores):

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

**¿De dónde copiar?**
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL que copiaste antes
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role secret

---

## ⏱️ Tiempo estimado: 10 min - Instalar y Ejecutar

### Paso 8: Instalar dependencias
\`\`\`bash
cd tu-proyecto
pnpm install
\`\`\`

### Paso 9: Ejecutar en desarrollo
\`\`\`bash
pnpm dev
\`\`\`

Verás:
\`\`\`
▲ Next.js 16.0.0

  ▲ Local:        http://localhost:3000
\`\`\`

### Paso 10: Abrir en navegador
\`\`\`
1. Abre http://localhost:3000
2. Verás página de login
3. Ingresa:
   - Email: admin@autoescuela.com
   - Password: Admin123456
4. Presiona "Iniciar Sesión"
5. ¡Listo! Estás en el dashboard
\`\`\`

---

## ✅ Verificación Final

### Dashboard
- [ ] Ves los 4 KPIs (Total Estudiantes, Instructores, etc.)
- [ ] Los números son correctos (si agregaste datos de prueba)

### Estudiantes
- [ ] Lista carga correctamente
- [ ] Puedes buscar
- [ ] Puedes filtrar por estado
- [ ] Puedes crear nuevo estudiante
- [ ] Puedes editar
- [ ] Puedes eliminar

### Instructores
- [ ] Lista carga correctamente
- [ ] CRUD funciona

### Clases
- [ ] Calendario carga
- [ ] Puedes crear clase

### Reportes
- [ ] Se generan reportes
- [ ] Puedes exportar

Si TODO funciona ✅, ¡**CONGRATULATIONS!** 🎉

---

## 🆘 Solucionar Problemas

### Problema: Error "Cannot find module"
\`\`\`
Solución:
1. Terminal: Ctrl+C (para el servidor)
2. Elimina carpeta: node_modules
3. Elimina archivo: pnpm-lock.yaml
4. Ejecuta: pnpm install
5. Luego: pnpm dev
\`\`\`

### Problema: "Supabase URL not configured"
\`\`\`
Solución:
1. Verifica .env.local existe
2. Verifica que tenga NEXT_PUBLIC_SUPABASE_URL
3. Verifica que tenga NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Reinicia: Ctrl+C + pnpm dev
\`\`\`

### Problema: Error de login "Invalid credentials"
\`\`\`
Solución:
1. Verifica que el usuario "admin@autoescuela.com" existe en Supabase > Authentication > Users
2. Verifica que el estado sea "Confirmed" (no "Invited")
3. Verifica que escribes la contraseña correctamente
\`\`\`

### Problema: "Table does not exist"
\`\`\`
Solución:
1. Vuelve a ejecutar el script SQL en Supabase
2. Verifica que no hay errores (mira en rojo al lado del query)
3. Si dice "Table already exists", es normal, ignora
\`\`\`

### Problema: "Cannot find modules @supabase/ssr"
\`\`\`
Solución:
1. Terminal: pnpm install @supabase/ssr
2. Reinicia: pnpm dev
\`\`\`

---

## 📚 Estructura de Carpetas

\`\`\`
proyecto/
├── app/
│   ├── api/                    # Rutas API
│   │   ├── auth/               # Autenticación
│   │   ├── students/           # Estudiantes CRUD
│   │   ├── instructors/        # Instructores CRUD
│   │   ├── classes/            # Clases CRUD
│   │   ├── progress/           # Avance
│   │   ├── dashboard/          # Dashboard data
│   │   └── reports/            # Reportes
│   ├── dashboard/              # Páginas del dashboard
│   ├── login/                  # Página de login
│   ├── page.tsx                # Inicio
│   └── layout.tsx              # Layout principal
├── lib/
│   ├── supabase/               # Clientes Supabase
│   ├── services/               # Lógica de negocio
│   ├── types/                  # Tipos TypeScript
│   └── utils.ts                # Utilidades
├── components/                 # Componentes React
│   ├── layout/                 # Componentes de layout
│   ├── students/               # Componentes de estudiantes
│   ├── instructors/            # Componentes de instructores
│   ├── classes/                # Componentes de clases
│   └── ui/                     # Componentes UI base
├── scripts/                    # Scripts SQL
│   ├── 01_create_schema.sql
│   ├── 02_seed_data.sql
│   └── SCRIPT_SUPABASE_COMPLETO.sql
├── .env.local                  # Variables de entorno (crear)
├── middleware.ts               # Middleware de autenticación
└── package.json                # Dependencias
\`\`\`

---

## 🚀 Siguientes Pasos

Después de que esté funcionando:

1. **Personalizar**: Cambia colores, logos, textos
2. **Datos reales**: Importa tus estudiantes e instructores
3. **Desplegar**: 
   - Supabase + Vercel (recomendado)
   - Supabase + Railway
   - Supabase + tu servidor propio
4. **Backups**: Configura backups automáticos en Supabase

---

## 💡 Tips

- **Contraseña olvidada**: Ve a Supabase > Authentication, haz clic en usuario y "Reset password"
- **Agregar más usuarios admin**: Crea más usuarios en Supabase > Authentication
- **Cambiar requisitos de clases**: Edita `clases_practicas_requeridas` en `student_progress` tabla
- **Ver logs**: Abre consola del navegador (F12) y mira Console

---

¡Listo! Cualquier duda, revisa la documentación en Supabase o de Next.js. 🎓
