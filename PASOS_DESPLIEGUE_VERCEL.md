# 🚀 Pasos para Desplegar en Vercel - Guía Interactiva

## ✅ Paso 1: Ya Completado
- [x] Crear cuenta en Vercel con GitHub

---

## 📦 Paso 2: Conectar tu Repositorio

### 2.1 En el Dashboard de Vercel

1. **Haz clic en "Add New..."** (botón grande en la parte superior)
2. **Selecciona "Project"**
3. Si es la primera vez:
   - Verás una pantalla para conectar GitHub
   - Haz clic en **"Configure GitHub App"** o **"Install"**
   - Autoriza a Vercel a acceder a tus repositorios
   - Selecciona los repositorios que quieres dar acceso (o "All repositories")
   - Haz clic en **"Install"**

4. **Busca tu repositorio** en la lista:
   - Busca: `COPIA-sistema-autoescuela` (o el nombre que tenga)
   - Haz clic en **"Import"** al lado del repositorio

---

## ⚙️ Paso 3: Configurar el Proyecto

### 3.1 Configuración Automática

Vercel debería detectar automáticamente que es un proyecto Next.js. Verás algo como:

```
Framework Preset: Next.js
Root Directory: ./
Build Command: next build (o pnpm build)
Output Directory: .next
Install Command: pnpm install (o npm install)
```

**✅ Deja estos valores como están** (Vercel los detecta automáticamente)

### 3.2 Nombre del Proyecto (Opcional)

- Puedes cambiar el nombre del proyecto si quieres
- Por defecto será el nombre del repositorio
- Ejemplo: `copia-sistema-autoescuela`

**⚠️ NO HAGAS CLIC EN "DEPLOY" TODAVÍA** - Primero necesitamos configurar las variables de entorno.

---

## 🔑 Paso 4: Obtener Credenciales de Supabase

### 4.1 Abre tu Proyecto en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto de autoescuela
3. Ve a **Settings** (⚙️) en el menú lateral izquierdo
4. Haz clic en **"API"** en el submenú

### 4.2 Copiar los 3 Valores Necesarios

En la sección **"Project API keys"** encontrarás:

#### Valor 1: Project URL
- **Nombre de la variable**: `NEXT_PUBLIC_SUPABASE_URL`
- **Dónde está**: En la parte superior, sección "Project URL"
- **Ejemplo**: `https://xxxxxxxxxxxxx.supabase.co`
- **Copia este valor completo** 📋

#### Valor 2: anon public key
- **Nombre de la variable**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Dónde está**: En "Project API keys" > "anon" > "public"
- **Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Copia este valor completo** 📋

#### Valor 3: service_role key (SECRET)
- **Nombre de la variable**: `SUPABASE_SERVICE_ROLE_KEY`
- **Dónde está**: En "Project API keys" > "service_role" > "secret"
- **⚠️ IMPORTANTE**: Este es un valor SENSIBLE, no lo compartas
- **Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Copia este valor completo** 📋

**💡 Tip**: Guarda estos 3 valores en un archivo de texto temporal mientras los configuras.

---

## 🔐 Paso 5: Configurar Variables de Entorno en Vercel

### 5.1 Ir a la Sección de Variables

En la página de configuración del proyecto en Vercel:

1. **Desplázate hacia abajo** hasta encontrar la sección **"Environment Variables"**
2. Verás un botón **"Add"** o un campo para agregar variables

### 5.2 Agregar Variable 1: NEXT_PUBLIC_SUPABASE_URL

1. Haz clic en **"Add"** o en el campo de nombre
2. **Name**: Escribe exactamente: `NEXT_PUBLIC_SUPABASE_URL`
3. **Value**: Pega el Project URL que copiaste de Supabase
4. **Environment**: Marca las 3 casillas:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Haz clic en **"Save"** o **"Add"**

### 5.3 Agregar Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Haz clic en **"Add"** nuevamente
2. **Name**: Escribe exactamente: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Value**: Pega el anon public key que copiaste
4. **Environment**: Marca las 3 casillas:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Haz clic en **"Save"** o **"Add"**

### 5.4 Agregar Variable 3: SUPABASE_SERVICE_ROLE_KEY

1. Haz clic en **"Add"** nuevamente
2. **Name**: Escribe exactamente: `SUPABASE_SERVICE_ROLE_KEY`
3. **Value**: Pega el service_role key (secret) que copiaste
4. **Environment**: Marca las 3 casillas:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
5. Haz clic en **"Save"** o **"Add"**

### 5.5 Verificar

Deberías ver 3 variables en la lista:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Paso 6: Realizar el Despliegue

### 6.1 Iniciar el Deploy

1. **Desplázate hacia arriba** en la página
2. Haz clic en el botón grande **"Deploy"**
3. Vercel comenzará a trabajar automáticamente

### 6.2 Monitorear el Proceso

Verás un log en tiempo real que muestra:

```
✓ Cloning repository...
✓ Installing dependencies...
  → pnpm install
✓ Building application...
  → pnpm build
✓ Deploying...
```

**⏱️ Tiempo estimado**: 2-5 minutos

### 6.3 Esperar a que Complete

No cierres la pestaña. Cuando termine, verás:

```
✓ Deployment successful!
```

Y recibirás una URL como:
```
https://copia-sistema-autoescuela.vercel.app
```

---

## ✅ Paso 7: Verificar que Funciona

### 7.1 Abrir la Aplicación

1. Haz clic en la URL que te dio Vercel
2. O copia y pega la URL en tu navegador
3. Deberías ver la página de inicio de tu sistema

### 7.2 Probar el Login

1. Ve a `/login` (ej: `https://tu-proyecto.vercel.app/login`)
2. Inicia sesión con tu usuario admin
3. Verifica que te redirija al dashboard

### 7.3 Probar Funcionalidades Básicas

- ✅ Navegar por el dashboard
- ✅ Ver la lista de estudiantes
- ✅ Ver la lista de instructores
- ✅ Crear un estudiante de prueba (opcional)

---

## 🔧 Paso 8: Configurar Supabase para Producción

### 8.1 Actualizar URLs de Redirección

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Ve a **Authentication** → **URL Configuration**
3. En **"Redirect URLs"**, agrega:
   ```
   https://tu-proyecto.vercel.app/**
   https://tu-proyecto.vercel.app/dashboard
   ```
   (Reemplaza `tu-proyecto` con el nombre real de tu proyecto)
4. Haz clic en **"Save"**

### 8.2 Verificar

Ahora el login debería funcionar correctamente en producción.

---

## 🐛 Si Algo Sale Mal

### Error: "Build Failed"

1. Ve a **Deployments** en el dashboard de Vercel
2. Haz clic en el deployment fallido
3. Revisa los **"Logs"** para ver el error específico
4. Los errores comunes son:
   - Variables de entorno faltantes → Verifica que agregaste las 3 variables
   - Error de TypeScript → Revisa el código
   - Dependencias faltantes → Verifica `package.json`

### Error: "Cannot connect to Supabase"

1. Verifica que las variables de entorno sean correctas
2. Asegúrate de copiar los valores completos (sin espacios al inicio/final)
3. Verifica que el proyecto de Supabase esté activo

### Error: "404 Not Found" en rutas

1. Verifica que `next.config.mjs` esté correcto
2. Asegúrate de que las rutas estén en la carpeta `app/`

---

## 📝 Checklist Final

Antes de considerar que está listo:

- [ ] Repositorio conectado a Vercel
- [ ] 3 variables de entorno configuradas
- [ ] Deploy exitoso sin errores
- [ ] URL de producción funciona
- [ ] Login funciona correctamente
- [ ] Dashboard carga correctamente
- [ ] URLs de redirección configuradas en Supabase

---

## 🎉 ¡Listo!

Tu sistema está desplegado. Cada vez que hagas `git push` a la rama `main`, Vercel desplegará automáticamente una nueva versión.

**URL de tu aplicación**: `https://tu-proyecto.vercel.app`

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Revisa los logs en Vercel (Deployments → Logs)
2. Verifica que las variables de entorno estén correctas
3. Asegúrate de que Supabase esté funcionando


