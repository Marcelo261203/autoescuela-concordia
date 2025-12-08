# Checklist de Verificación

Usa este documento para verificar que todo está funcionando correctamente.

---

## ✅ Fase 1: Infraestructura Supabase

- [ ] Proyecto Supabase creado
- [ ] Credenciales copiadas (URL, anon key, service key)
- [ ] Usuario admin@autoescuela.com creado y confirmado
- [ ] Script SQL ejecutado sin errores
- [ ] Tablas visibles en Supabase > Database > Tables
  - [ ] students
  - [ ] instructors
  - [ ] classes
  - [ ] student_progress

---

## ✅ Fase 2: Configuración Local

- [ ] Archivo `.env.local` creado
- [ ] Variables correctas en `.env.local`:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] No hay errores de instalación

---

## ✅ Fase 3: Ejecución

- [ ] Servidor inicia: `pnpm dev`
- [ ] No hay errores en la terminal
- [ ] Terminal muestra: `Local: http://localhost:3000`
- [ ] Navegador abre sin errores

---

## ✅ Fase 4: Autenticación

- [ ] Página de login carga
- [ ] Login con `admin@autoescuela.com` / `Admin123456` funciona
- [ ] Redirige a `/dashboard` después del login
- [ ] Logout funciona (vuelve a login)
- [ ] Intentar acceder a `/dashboard` sin autenticación redirige a `/login`

---

## ✅ Fase 5: Dashboard

- [ ] Dashboard carga sin errores
- [ ] Se ven 4 tarjetas KPI:
  - [ ] Total de Estudiantes
  - [ ] Total de Instructores
  - [ ] Clases Hoy
  - [ ] Estudiantes Inactivos
- [ ] Gráfico de tendencia se visualiza (línea)
- [ ] Gráfico de distribución se visualiza (círculo)
- [ ] Los números son realistas

---

## ✅ Fase 6: Módulo Estudiantes

### Listado
- [ ] Se carga sin errores
- [ ] Muestra tabla con estudiantes (o está vacía si es nuevo)
- [ ] Paginación funciona (10 por página)
- [ ] Botón "Nuevo Estudiante" visible

### Búsqueda
- [ ] Puedes escribir en buscador
- [ ] La búsqueda funciona en tiempo real
- [ ] Se filtran resultados

### Filtro
- [ ] Selector de estado funciona
- [ ] Filtra por: Activo, En Curso, Graduado, Inactivo

### Crear Estudiante
- [ ] Formulario abre al hacer clic en "Nuevo"
- [ ] Campos visibles:
  - [ ] CI (validar formato)
  - [ ] Nombre
  - [ ] Apellido
  - [ ] Email
  - [ ] Teléfono
  - [ ] Dirección
  - [ ] Fecha de Nacimiento
- [ ] Validaciones funcionan (campos obligatorios)
- [ ] Al guardar, se agrega a la lista
- [ ] Aparece mensaje de éxito

### Prevención de Duplicados
- [ ] Intenta crear dos estudiantes con el mismo CI
  - [ ] Aparece error: "Ya existe estudiante con ese CI"
- [ ] Intenta crear dos con el mismo email
  - [ ] Aparece error: "Ya existe estudiante con ese email"

### Editar Estudiante
- [ ] Haz clic en un estudiante (o botón editar)
- [ ] Se abre formulario con datos precargados
- [ ] Puedes cambiar valores
- [ ] Al guardar, se actualiza en BD

### Ver Detalles
- [ ] Haz clic en nombre de estudiante
- [ ] Se abre vista de detalle
- [ ] Muestra toda la información
- [ ] Se ve progreso (si existe)
- [ ] Botón "Editar" funciona

### Eliminar
- [ ] Botón de eliminar visible
- [ ] Al hacer clic, pide confirmación
- [ ] Al confirmar, se elimina de la lista

---

## ✅ Fase 7: Módulo Instructores

- [ ] Página carga
- [ ] Tabla muestra instructores
- [ ] Crear instructor funciona
  - [ ] Campos: Nombre, Apellido, Email, Teléfono, Especialidad
- [ ] Editar funciona
- [ ] Eliminar funciona
- [ ] Email es único

---

## ✅ Fase 8: Módulo Clases

- [ ] Página carga
- [ ] Calendario se visualiza
- [ ] Puedes crear clase:
  - [ ] Seleccionar estudiante
  - [ ] Seleccionar instructor
  - [ ] Elegir tipo: Práctica/Teórica
  - [ ] Establecer fecha
  - [ ] Establecer hora
  - [ ] Establecer duración
  - [ ] Agregar observaciones
- [ ] Al guardar, aparece en calendario
- [ ] Puedes ver historial de clases del estudiante

---

## ✅ Fase 9: Progreso Automático

- [ ] Crea una clase para un estudiante
- [ ] Ve a detalles del estudiante
- [ ] El contador de clases prácticas/teóricas se actualiza
- [ ] El porcentaje de avance se calcula
- [ ] Si llega a 100%, estado cambia a "graduado"

---

## ✅ Fase 10: Reportes

- [ ] Página de reportes carga
- [ ] Puedes generar reporte de estudiantes activos
- [ ] Puedes generar reporte por estado
- [ ] Puedes generar reporte de clases
- [ ] Exportación a CSV funciona
  - [ ] Archivo se descarga
  - [ ] Se abre correctamente en Excel
- [ ] Exportación a JSON funciona

---

## ✅ Fase 11: Navegación

- [ ] Sidebar visible y funcional
- [ ] Enlaces a:
  - [ ] Dashboard
  - [ ] Estudiantes
  - [ ] Instructores
  - [ ] Clases
  - [ ] Reportes
  - [ ] Logout
- [ ] Active link resaltado
- [ ] Responsive en móvil (menú hamburguesa)

---

## ✅ Fase 12: Diseño y UX

- [ ] Interfaz moderna y limpia
- [ ] Colores consistentes
- [ ] Tipografía legible
- [ ] Espaciado adecuado
- [ ] Botones interactivos (hover effects)
- [ ] Formularios bien diseñados
- [ ] Tablas claras y organizadas
- [ ] Responsive en:
  - [ ] Desktop
  - [ ] Tablet
  - [ ] Móvil

---

## ✅ Fase 13: Errores y Validaciones

- [ ] Intenta crear estudiante sin nombre
  - [ ] Muestra error
- [ ] Intenta crear con email inválido
  - [ ] Muestra error
- [ ] Intenta crear con teléfono inválido
  - [ ] Muestra error
- [ ] Intenta crear estudiante menor de 16 años
  - [ ] Rechaza o muestra error
- [ ] Buscas algo que no existe
  - [ ] Muestra "Sin resultados"

---

## ✅ Fase 14: Rendimiento

- [ ] Página carga en menos de 3 segundos
- [ ] No hay retrasos al buscar
- [ ] Las transiciones son suaves
- [ ] Gráficos se renderean rápido
- [ ] No hay memory leaks (abre DevTools > Memory)

---

## ✅ Fase 15: Datos

Si ejecutaste script de datos de prueba:
- [ ] Hay instructores en el sistema
- [ ] Hay estudiantes en el sistema
- [ ] Dashboard muestra números correctos
- [ ] Se pueden listar y filtrar

---

## 📋 Resumen Final

Cuenta cuántos items completaste:

\`\`\`
✅ Completados: ____ / 95
\`\`\`

- **90-95**: Todo funciona perfecto 🎉
- **75-89**: Hay algunos pequeños issues menores
- **60-74**: Hay problemas que revisar
- **< 60**: Revisar setup desde el principio

---

## 🆘 Si Algo No Funciona

1. Revisa el archivo correspondiente en `SETUP_COMPLETO.md`
2. Verifica logs en la consola (F12)
3. Reinicia el servidor (`Ctrl+C` + `pnpm dev`)
4. Revisa que `.env.local` tenga valores correctos
5. Verifica que Supabase tiene las tablas creadas

---

**¡Cuando termines este checklist, tu sistema está listo para producción! 🚀**
