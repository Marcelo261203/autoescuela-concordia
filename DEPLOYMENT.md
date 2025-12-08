# Guía de Despliegue

## Despliegue en Vercel (Recomendado)

### Pasos previos
1. Tienes que haber completado el SETUP.md
2. Tu repositorio debe estar en GitHub

### Pasos de despliegue

1. **Ir a Vercel**
   - Abre https://vercel.com
   - Inicia sesión o crea una cuenta

2. **Conectar repositorio**
   - Haz clic en "New Project"
   - Selecciona "Import Git Repository"
   - Busca y selecciona tu repositorio

3. **Configurar variables de entorno**
   - En "Environment Variables" añade:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   POSTGRES_URL=tu_postgres_url
   SUPABASE_JWT_SECRET=tu_jwt_secret
   POSTGRES_URL_NON_POOLING=tu_postgres_url_non_pooling
   \`\`\`

4. **Desplegar**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente
   - Recibirás una URL pública

5. **Verificación**
   - Abre la URL proporcionada
   - Prueba login y todas las funciones

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
