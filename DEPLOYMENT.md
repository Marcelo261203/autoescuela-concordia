# Guía de Despliegue

> 📚 **Para una guía detallada paso a paso, consulta [GUIA_DESPLIEGUE_VERCEL.md](./GUIA_DESPLIEGUE_VERCEL.md)**

## Despliegue en Vercel (Recomendado)

### Pasos previos
1. ✅ Tienes que haber completado el SETUP.md
2. ✅ Tu repositorio debe estar en GitHub
3. ✅ Tienes las credenciales de Supabase listas

### Pasos rápidos de despliegue

1. **Ir a Vercel**
   - Abre https://vercel.com
   - Inicia sesión o crea una cuenta (con GitHub recomendado)

2. **Conectar repositorio**
   - Haz clic en "Add New..." → "Project"
   - Selecciona "Import Git Repository"
   - Conecta tu cuenta de GitHub si es necesario
   - Busca y selecciona tu repositorio

3. **Configurar variables de entorno** ⚠️ CRÍTICO
   - En "Environment Variables" añade estas 3 variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   \`\`\`
   - **Importante**: Marca todas las variables para Production, Preview y Development
   - Obtén estos valores en: Supabase Dashboard > Settings > API

4. **Desplegar**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente (2-5 minutos)
   - Recibirás una URL pública: `https://tu-proyecto.vercel.app`

5. **Verificación**
   - Abre la URL proporcionada
   - Prueba login y todas las funciones
   - Verifica que no haya errores en los logs

### Variables de entorno requeridas

Solo necesitas estas 3 variables (las demás mencionadas anteriormente no son necesarias):

- `NEXT_PUBLIC_SUPABASE_URL` - URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave pública anónima
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio (secret)

### Configurar Supabase para producción

Después del despliegue, actualiza las URLs de redirección en Supabase:

1. Ve a **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Agrega tu URL de Vercel:
   ```
   https://tu-proyecto.vercel.app/**
   https://tu-proyecto.vercel.app/dashboard
   ```

## Despliegue en Railway

1. **Conectar repositorio**
   - Abre https://railway.app
   - Conecta tu repositorio de GitHub

2. **Crear servicio**
   - Crea un nuevo proyecto
   - Selecciona "Deploy from GitHub repo"

3. **Configurar variables**
   - Añade las mismas variables que en Vercel
   - Railway las reconocerá automáticamente

4. **Desplegar**
   - Railway desplegará automáticamente

## Despliegue en Docker

### Crear Dockerfile

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json pnpm-lock.yaml ./

# Instalar dependencias
RUN npm install -g pnpm && pnpm install --prod

# Copiar código
COPY . .

# Construir
RUN pnpm build

# Exponer puerto
EXPOSE 3000

# Iniciar
CMD ["pnpm", "start"]
\`\`\`

### Crear docker-compose.yml

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
      - POSTGRES_URL=\${POSTGRES_URL}
    restart: always
\`\`\`

### Desplegar con Docker

\`\`\`bash
docker-compose up -d
\`\`\`

## Despliegue en DigitalOcean

1. **Crear Droplet**
   - Crea un droplet Ubuntu 22.04
   - SSH a tu droplet

2. **Instalar Node.js**
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pnpm
   \`\`\`

3. **Clonar repositorio**
   \`\`\`bash
   cd /var/www
   git clone <tu-repo>
   cd student-management-system
   \`\`\`

4. **Instalar dependencias**
   \`\`\`bash
   pnpm install --prod
   pnpm build
   \`\`\`

5. **Configurar variables**
   \`\`\`bash
   nano .env
   # Pegar variables de entorno
   \`\`\`

6. **Iniciar aplicación**
   \`\`\`bash
   pnpm start
   \`\`\`

7. **Usar PM2 para mantener viva la aplicación**
   \`\`\`bash
   npm install -g pm2
   pm2 start "pnpm start" --name "student-app"
   pm2 startup
   pm2 save
   \`\`\`

8. **Configurar Nginx como proxy**
   \`\`\`bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/default
   \`\`\`

   Agregar:
   \`\`\`nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

## Checklist Pre-Producción

- [ ] Base de datos migrada
- [ ] Usuario admin creado
- [ ] Variables de entorno configuradas
- [ ] SSL/HTTPS activado
- [ ] Backups configurados
- [ ] Monitoreo habilitado
- [ ] Email de soporte configurado
- [ ] Política de privacidad actualizada
- [ ] Términos de servicio revisados
- [ ] Pruebas de carga completadas

## Monitoreo y Mantenimiento

### Logs
- Vercel: Dashboard > Logs
- Docker: `docker logs <container-id>`
- Node: Ver `/var/log/app.log`

### Backups
- Supabase: Backups automáticos habilitados
- Descargar backups regularmente

### Actualizaciones
\`\`\`bash
pnpm update
pnpm build
# Redeploy en tu plataforma
\`\`\`

---

¡Tu aplicación está lista para producción!
