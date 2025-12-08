# Guía de Setup del Sistema de Gestión de Estudiantes

## Paso 1: Crear la Migración de Base de Datos

### Opción A: Usando Supabase Dashboard (Recomendado)

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú izquierdo, haz clic en "SQL Editor"
4. Haz clic en "New Query"
5. Copia todo el contenido del archivo `scripts/01_create_tables.sql`
6. Pégalo en el editor
7. Haz clic en "Run" (o Ctrl + Enter)
8. Verifica que se muestre "Success" 

### Opción B: Usando Terminal (Requiere psql)

\`\`\`bash
# Si tienes psql instalado
psql $POSTGRES_URL_NON_POOLING < scripts/01_create_tables.sql
\`\`\`

## Paso 2: Crear Usuario Administrador

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú izquierdo, ve a "Authentication" > "Users"
4. Haz clic en "Add user" (arriba a la derecha)
5. Completa:
   - **Email**: admin@autoescuela.com
   - **Password**: Usa una contraseña segura (guárdala)
   - **Confirm password**: Repite la contraseña
6. Marca la opción "Auto confirm user"
7. Haz clic en "Create user"

Verás una confirmación de que el usuario fue creado.

## Paso 3: Instalar Dependencias Localmente

\`\`\`bash
pnpm install
\`\`\`

## Paso 4: Verificar Variables de Entorno

Las variables de entorno ya deben estar configuradas en Vercel. Para verificar localmente, crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=<tu_url_de_supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>
POSTGRES_URL=<tu_postgres_url>
SUPABASE_JWT_SECRET=<tu_jwt_secret>
\`\`\`

Obtén estos valores de:
- Ve a https://app.supabase.com > Tu Proyecto > Settings > API

## Paso 5: Ejecutar la Aplicación Localmente

\`\`\`bash
pnpm dev
\`\`\`

Abre http://localhost:3000 en tu navegador.

## Paso 6: Iniciar Sesión

- Email: `admin@autoescuela.com`
- Password: La que configuraste en el Paso 2

¡Deberías ver el dashboard!

## Verificación de Setup

Después de completar todos los pasos, verifica:

1. ✅ Puedes iniciar sesión
2. ✅ El dashboard muestra "Total de Estudiantes: 0"
3. ✅ Puedes ir a "Estudiantes" y ver la opción "Nuevo Estudiante"
4. ✅ Puedes crear un estudiante de prueba
5. ✅ El estudiante aparece en la lista
6. ✅ Puedes ir a "Reportes" y descargar un CSV

Si todo funciona, ¡el setup está completo!

## Troubleshooting del Setup

### Error: "relation \"students\" does not exist"

**Solución**: La migración no se ejecutó correctamente.
- Ve a Supabase Dashboard > SQL Editor
- Verifica que no haya errores en la ejecución
- Intenta ejecutar nuevamente el script

### Error: "Invalid login credentials"

**Solución**: El usuario no está creado o la contraseña es incorrecta.
- Verifica que el usuario existe en Supabase > Authentication > Users
- Intenta crear un nuevo usuario

### Error: "NEXT_PUBLIC_SUPABASE_URL is not set"

**Solución**: Variables de entorno no configuradas.
- Crea un archivo `.env.local` en la raíz
- Copia las variables desde Supabase Dashboard > Settings > API

### Error: "403 Forbidden"

**Solución**: RLS policy issue.
- Ve a Supabase > SQL Editor
- Ejecuta: `SELECT * FROM auth.users;`
- Verifica que el usuario exista

### La aplicación es lenta o no carga datos

**Solución**: Problema de conexión a Supabase.
- Verifica la URL de Supabase
- Verifica que la API key sea correcta
- Reinicia el servidor: Ctrl+C y `pnpm dev`

## Próximos Pasos

1. Lee el archivo `README.md` para entender todas las características
2. Crea algunos estudiantes de prueba
3. Explora el dashboard y reportes
4. Personaliza según tus necesidades

¿Necesitas ayuda? Abre un issue en el repositorio.
