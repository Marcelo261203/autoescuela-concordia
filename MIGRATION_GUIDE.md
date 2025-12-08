# Guía de Migración de Base de Datos

## Estados del Sistema

### ✅ Completamente Funcional
- Autenticación con Supabase
- CRUD de estudiantes
- Búsqueda y filtros
- Dashboard con estadísticas
- Reportes y exportación
- Validaciones completas
- Seguridad implementada

### 📋 Checklist de Implementación

#### Autenticación
- [x] Login con email/password
- [x] Middleware de protección
- [x] Logout seguro
- [x] Renovación de sesiones
- [x] RLS habilitado

#### Base de Datos
- [x] Tabla students
- [x] Tabla student_activities
- [x] Tabla student_documents
- [x] Índices creados
- [x] Triggers para timestamps
- [x] Políticas RLS

#### CRUD
- [x] Crear estudiante
- [x] Leer/Obtener estudiantes
- [x] Actualizar estudiante
- [x] Eliminar estudiante
- [x] Paginación
- [x] Búsqueda
- [x] Filtrado

#### Validaciones
- [x] Email válido
- [x] Teléfono válido
- [x] CI requerido
- [x] Edad mínima (16 años)
- [x] Prevención de duplicados CI
- [x] Prevención de duplicados email
- [x] Mensajes de error claros

#### Dashboard
- [x] Total de estudiantes
- [x] Distribución por estado
- [x] Gráfico visual
- [x] Datos en tiempo real

#### Reportes
- [x] Reporte por estado
- [x] Reporte general
- [x] Exportación CSV
- [x] Filtrado de datos

#### UI/UX
- [x] Responsive design
- [x] Sidebar navegable
- [x] Formularios accesibles
- [x] Validación visual
- [x] Mensajes toast
- [x] Loading states
- [x] Error handling

## Pasos de Migración Completa

### Paso 1: Setup de Base de Datos (5 min)
1. Ve a Supabase Dashboard
2. Abre SQL Editor
3. Copia contenido de `scripts/01_create_tables.sql`
4. Ejecuta el script
5. Verifica que no haya errores

**Verificar:**
\`\`\`sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
\`\`\`

### Paso 2: Crear Usuario Admin (2 min)
1. Ve a Authentication > Users
2. Crea usuario: admin@autoescuela.com
3. Marca "Auto confirm user"
4. Haz clic en "Create user"

**Verificar:**
\`\`\`sql
SELECT * FROM auth.users WHERE email = 'admin@autoescuela.com';
\`\`\`

### Paso 3: Configurar Variables de Entorno (3 min)
1. Obtén valores de Settings > API
2. Crea `.env.local`
3. Pega variables
4. Reinicia servidor

**Verificar:**
\`\`\`bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`

### Paso 4: Instalar Dependencias (2 min)
\`\`\`bash
pnpm install
\`\`\`

### Paso 5: Ejecutar Localmente (1 min)
\`\`\`bash
pnpm dev
\`\`\`

**Verificar:** Abre http://localhost:3000

### Paso 6: Pruebas Básicas (5 min)
- [ ] Login funciona
- [ ] Dashboard muestra 0 estudiantes
- [ ] Puedes crear un estudiante
- [ ] El estudiante aparece en la lista
- [ ] Puedes editar el estudiante
- [ ] Puedes descargar CSV vacío
- [ ] Logout funciona

### Paso 7: Despliegue (Varía según plataforma)

**Vercel:**
1. Conecta repositorio
2. Configura variables en Settings
3. Deploy automático

**Otros:**
Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

## Rollback Plan

Si algo sale mal:

### Base de Datos
\`\`\`bash
# Eliminar tablas
psql $POSTGRES_URL_NON_POOLING

DROP TABLE IF EXISTS student_documents CASCADE;
DROP TABLE IF EXISTS student_activities CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
\`\`\`

### Reejecutar Setup
\`\`\`bash
# Desde el principio
psql $POSTGRES_URL_NON_POOLING < scripts/01_create_tables.sql
\`\`\`

## Validación Post-Migración

\`\`\`sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar índices
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public';

-- Verificar datos
SELECT COUNT(*) FROM students;

-- Verificar usuario auth
SELECT email FROM auth.users;
\`\`\`

## Troubleshooting

### Error: "relation students does not exist"
**Solución:** Ejecutar el script SQL nuevamente

### Error: "permission denied"
**Solución:** Verificar RLS policies están creadas

### Error: "Unauthorized"
**Solución:** Verificar variables de entorno

### Datos no aparecen
**Solución:** Verificar autenticación y permisos RLS

## Timeline de Implementación

- **Hora 0-15 min**: Setup de BD y usuario admin
- **Hora 15-20 min**: Configurar variables
- **Hora 20-30 min**: Pruebas locales
- **Hora 30-45 min**: Despliegue
- **Hora 45-60 min**: Pruebas en producción

## Soporte

Si tienes problemas:
1. Revisa [README.md](./README.md)
2. Revisa [SETUP.md](./SETUP.md)
3. Abre un issue en GitHub

---

¡Migración completada exitosamente!
