# 🚀 Inicio Rápido - 20 Minutos

## ⏱️ Cronograma

\`\`\`
0-5 min   → Crear proyecto Supabase
5-10 min  → Ejecutar script SQL
10-15 min → Configurar variables
15-20 min → Ejecutar aplicación
\`\`\`

---

## 🎯 Paso 1: Crear Proyecto Supabase (5 min)

### 1.1 Ir a Supabase
\`\`\`
https://supabase.com → Sign In → New Project
\`\`\`

### 1.2 Completar Formulario
\`\`\`
Project Name:    autoescuela
Database Password: [crea una fuerte]
Region:          [la más cercana]
\`\`\`

### 1.3 Esperar
\`\`\`
⏳ 2-3 minutos mientras se crea...
\`\`\`

### 1.4 Copiar Credenciales
\`\`\`
Settings → API → Copia:
- Project URL
- anon public
- service_role secret
\`\`\`

**Guarda en un archivo de texto temporal** 📝

---

## 🎯 Paso 2: Ejecutar Script SQL (5 min)

### 2.1 Abrir SQL Editor
\`\`\`
Supabase Dashboard → SQL Editor → New Query
\`\`\`

### 2.2 Copiar Script
\`\`\`
Abre: scripts/SCRIPT_SUPABASE_COMPLETO.sql
Ctrl+A → Ctrl+C
\`\`\`

### 2.3 Pegar y Ejecutar
\`\`\`
En el editor: Ctrl+V
Luego: Ctrl+Enter (o botón RUN)
\`\`\`

### 2.4 Verificar
\`\`\`
✅ Ves "Success" en verde
✅ O ves "already exists" (es normal)
\`\`\`

---

## 🎯 Paso 3: Crear Usuario Admin (2 min)

### 3.1 Ir a Authentication
\`\`\`
Supabase Dashboard → Authentication → Users
\`\`\`

### 3.2 Agregar Usuario
\`\`\`
Botón "Add user"
Email:    admin@autoescuela.com
Password: Admin123456
✓ Auto Confirm User
\`\`\`

### 3.3 Crear
\`\`\`
Botón "Create user"
\`\`\`

---

## 🎯 Paso 4: Configurar Variables (3 min)

### 4.1 Crear .env.local
\`\`\`
En la raíz del proyecto (junto a package.json)
Nuevo archivo: .env.local
\`\`\`

### 4.2 Pegar Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

**Reemplaza con tus valores de Supabase** ⚠️

---

## 🎯 Paso 5: Instalar y Ejecutar (5 min)

### 5.1 Terminal
\`\`\`bash
cd tu-proyecto
pnpm install
\`\`\`

### 5.2 Ejecutar
\`\`\`bash
pnpm dev
\`\`\`

### 5.3 Abrir Navegador
\`\`\`
http://localhost:3000
\`\`\`

---

## 🎯 Paso 6: Login (1 min)

### 6.1 Ingresa Credenciales
\`\`\`
Email:    admin@autoescuela.com
Password: Admin123456
\`\`\`

### 6.2 Presiona "Iniciar Sesión"
\`\`\`
✅ Redirige a /dashboard
✅ ¡Listo! Sistema funcionando
\`\`\`

---

## ✅ Verificación Rápida

Después de login, verifica:

- [ ] Dashboard carga
- [ ] Ves 4 tarjetas KPI
- [ ] Puedes ir a Estudiantes
- [ ] Puedes crear un estudiante
- [ ] Puedes buscar
- [ ] Puedes filtrar

Si todo funciona ✅, **¡ÉXITO!** 🎉

---

## 🆘 Si Algo Falla

### Error: "Supabase URL not configured"
\`\`\`
Solución: Verifica .env.local tiene las variables
Reinicia: Ctrl+C + pnpm dev
\`\`\`

### Error: "Invalid API key"
\`\`\`
Solución: Copia nuevamente las keys de Supabase
Verifica que no haya espacios extras
\`\`\`

### Error: "Cannot find module"
\`\`\`
Solución: pnpm install
Luego: pnpm dev
\`\`\`

### No puedo iniciar sesión
\`\`\`
Solución: Verifica que el usuario está "Confirmed" en Supabase
Verifica la contraseña
\`\`\`

---

## 📚 Documentación Completa

Para más detalles, lee:

- `SETUP_COMPLETO.md` - Guía detallada
- `PASO_A_PASO_VISUAL.md` - Guía visual
- `GUIA_SCRIPT_SQL.md` - Detalles del SQL
- `CHECKLIST_VERIFICACION.md` - Verificar todo

---

## 🎓 Ahora Que Funciona

### Explora
- [ ] Dashboard
- [ ] Módulo de Estudiantes
- [ ] Módulo de Instructores
- [ ] Módulo de Clases
- [ ] Reportes

### Personaliza
- [ ] Cambia colores en `app/globals.css`
- [ ] Cambia textos en componentes
- [ ] Agrega tu logo

### Desplega
- [ ] Push a GitHub
- [ ] Conecta a Vercel
- [ ] Deploy automático

---

## 💡 Tips

- **Datos de prueba**: Ejecuta `scripts/02_seed_data.sql` para agregar datos
- **Cambiar contraseña**: Supabase > Authentication > Usuario > Reset Password
- **Agregar más admins**: Crea más usuarios en Authentication
- **Ver logs**: F12 en navegador > Console

---

**¡Listo en 20 minutos! 🚀**

Cualquier duda, revisa la documentación o contacta a soporte de Supabase.
