# 🚀 Guía Completa de Despliegue en Vercel

Esta guía te llevará paso a paso para desplegar tu sistema de autoescuela en Vercel de forma profesional.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Tu proyecto funcionando correctamente en local
- ✅ Repositorio en GitHub (público o privado)
- ✅ Cuenta en Supabase con el proyecto configurado
- ✅ Cuenta en Vercel (puedes crear una gratis)

---

## 🔑 Paso 1: Preparar Variables de Entorno

### 1.1 Obtener Credenciales de Supabase

1. Ve a tu proyecto en **Supabase Dashboard**
2. Navega a **Settings** → **API**
3. Copia los siguientes valores:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** (secret): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

   ⚠️ **IMPORTANTE**: El `service_role key` es muy sensible, nunca lo compartas públicamente.

### 1.2 Variables Necesarias

Necesitarás configurar estas variables en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nota**: `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` solo es necesaria para desarrollo local, no para producción.

---

## 🌐 Paso 2: Conectar Repositorio con Vercel

### 2.1 Crear Cuenta en Vercel (si no tienes)

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (recomendado)
4. Autoriza los permisos necesarios

### 2.2 Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Si es la primera vez, conectarás tu cuenta de GitHub:
   - Haz clic en **"Import Git Repository"**
   - Selecciona **"GitHub"**
   - Autoriza a Vercel a acceder a tus repositorios
   - Elige el repositorio de tu proyecto
3. Si ya tienes repositorios conectados:
   - Busca tu repositorio en la lista
   - Haz clic en **"Import"**

---

## ⚙️ Paso 3: Configurar el Proyecto en Vercel

### 3.1 Configuración del Proyecto

Vercel detectará automáticamente que es un proyecto Next.js. Verás algo como:

```
Framework Preset: Next.js
Root Directory: ./
Build Command: next build
Output Directory: .next
Install Command: pnpm install (o npm install)
```

**Ajustes recomendados**:

- **Framework Preset**: `Next.js` (debe detectarse automáticamente)
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `pnpm build` (si usas pnpm) o `npm run build`
- **Output Directory**: `.next` (por defecto)
- **Install Command**: `pnpm install` (si usas pnpm) o `npm install`

### 3.2 Configurar Variables de Entorno

**⚠️ CRÍTICO**: Antes de hacer el deploy, configura las variables de entorno.

1. En la página de configuración del proyecto, desplázate hasta **"Environment Variables"**
2. Haz clic en **"Add"** para cada variable:

   **Variable 1:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Tu URL de Supabase (ej: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Environment**: Selecciona todas (Production, Preview, Development)

   **Variable 2:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Tu anon public key
   - **Environment**: Selecciona todas (Production, Preview, Development)

   **Variable 3:**
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Tu service_role key (secret)
   - **Environment**: Selecciona todas (Production, Preview, Development)

3. Haz clic en **"Save"** después de agregar cada variable

**💡 Tip**: Puedes agregar todas las variables de una vez o una por una. Asegúrate de que todas estén marcadas para todos los ambientes.

---

## 🚀 Paso 4: Realizar el Despliegue

### 4.1 Iniciar el Deploy

1. Una vez configuradas las variables de entorno, haz clic en **"Deploy"**
2. Vercel comenzará a:
   - Instalar dependencias (`pnpm install`)
   - Construir el proyecto (`pnpm build`)
   - Desplegar la aplicación

### 4.2 Monitorear el Proceso

Verás un log en tiempo real del proceso:

```
✓ Cloning repository...
✓ Installing dependencies...
✓ Building application...
✓ Deploying...
```

**Tiempo estimado**: 2-5 minutos (depende del tamaño del proyecto)

### 4.3 Verificar el Deploy

Una vez completado, verás:

```
✓ Deployment successful!
```

Y recibirás una URL como:
```
https://tu-proyecto.vercel.app
```

---

## ✅ Paso 5: Verificar que Todo Funciona

### 5.1 Pruebas Básicas

1. **Abrir la URL**: Visita `https://tu-proyecto.vercel.app`
2. **Probar Login**:
   - Ve a `/login`
   - Inicia sesión con tu usuario admin
   - Verifica que redirija correctamente al dashboard
3. **Probar Funcionalidades**:
   - Navega por las diferentes secciones
   - Crea un estudiante de prueba
   - Crea un instructor de prueba
   - Agenda una clase

### 5.2 Verificar Logs (si hay errores)

Si algo no funciona:

1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a la pestaña **"Deployments"**
4. Haz clic en el deployment más reciente
5. Revisa los **"Logs"** para ver errores

**Errores comunes**:
- ❌ Variables de entorno faltantes → Agrega las variables que faltan
- ❌ Error de build → Revisa los logs para ver el error específico
- ❌ Error de conexión a Supabase → Verifica que las URLs y keys sean correctas

---

## 🔄 Paso 6: Configurar Dominio Personalizado (Opcional)

### 6.1 Agregar Dominio

1. En el dashboard de Vercel, ve a **Settings** → **Domains**
2. Ingresa tu dominio (ej: `autoescuela.com`)
3. Sigue las instrucciones para configurar los DNS

### 6.2 Configurar DNS

Vercel te dará instrucciones específicas. Generalmente necesitarás:

- Agregar un registro **CNAME** apuntando a `cname.vercel-dns.com`
- O agregar un registro **A** con la IP proporcionada

---

## 🔐 Paso 7: Configurar Supabase para Producción

### 7.1 Actualizar URLs de Redirección

1. Ve a **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Agrega tu URL de Vercel a las **Redirect URLs**:
   ```
   https://tu-proyecto.vercel.app/**
   https://tu-proyecto.vercel.app/dashboard
   ```
3. Guarda los cambios

### 7.2 Verificar Políticas RLS

Asegúrate de que las políticas de Row Level Security estén correctamente configuradas para producción.

---

## 📊 Paso 8: Monitoreo y Mantenimiento

### 8.1 Ver Logs en Vercel

- **Dashboard** → **Tu Proyecto** → **Deployments** → **Logs**
- Aquí verás todos los logs de producción

### 8.2 Analytics (Opcional)

Vercel ofrece analytics gratuitos:
- Ve a **Analytics** en el dashboard
- Activa **Web Analytics** para ver estadísticas de tráfico

### 8.3 Actualizaciones Automáticas

Cada vez que hagas `git push` a la rama `main` (o la rama configurada), Vercel desplegará automáticamente una nueva versión.

**Flujo de trabajo**:
```bash
# Hacer cambios en local
git add .
git commit -m "Nueva funcionalidad"
git push origin main

# Vercel detecta el push y despliega automáticamente
```

---

## 🐛 Solución de Problemas Comunes

### Problema 1: "Build Failed"

**Causa**: Error en el código o dependencias faltantes

**Solución**:
1. Revisa los logs de build en Vercel
2. Prueba hacer `pnpm build` localmente para reproducir el error
3. Corrige el error y vuelve a hacer push

### Problema 2: "Environment Variable Missing"

**Causa**: Falta alguna variable de entorno

**Solución**:
1. Ve a **Settings** → **Environment Variables**
2. Verifica que todas las variables estén configuradas
3. Asegúrate de que estén marcadas para el ambiente correcto (Production)

### Problema 3: "Cannot connect to Supabase"

**Causa**: URLs o keys incorrectas

**Solución**:
1. Verifica que las variables de entorno sean correctas
2. Asegúrate de copiar los valores completos (sin espacios)
3. Verifica que el proyecto de Supabase esté activo

### Problema 4: "404 Not Found" en rutas

**Causa**: Problema con el routing de Next.js

**Solución**:
1. Verifica que `next.config.mjs` esté correctamente configurado
2. Asegúrate de que las rutas estén en la carpeta `app/`
3. Revisa los logs de Vercel para más detalles

---

## 📝 Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] Variables de entorno configuradas correctamente
- [ ] Deploy exitoso sin errores
- [ ] Login funciona correctamente
- [ ] Dashboard carga correctamente
- [ ] Puedes crear estudiantes/instructores
- [ ] Puedes agendar clases
- [ ] URLs de redirección configuradas en Supabase
- [ ] Dominio personalizado configurado (si aplica)
- [ ] Logs sin errores críticos

---

## 🎉 ¡Listo!

Tu sistema de autoescuela está ahora desplegado en producción. Cada vez que hagas cambios y los subas a GitHub, Vercel los desplegará automáticamente.

**URL de tu aplicación**: `https://tu-proyecto.vercel.app`

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)

---

**¿Necesitas ayuda?** Revisa los logs en Vercel o consulta la documentación oficial.


