# Resumen Completo del Sistema de Gestión de Autoescuela Concordia

**Documento de Referencia para el Informe del Proyecto**

---

## 1. Descripción General del Sistema

### 1.1 Propósito

El **Sistema de Gestión de Autoescuela Concordia** es una aplicación web full-stack diseñada para gestionar integralmente todas las operaciones administrativas y académicas de una autoescuela. El sistema permite el registro, seguimiento y control completo del ciclo de vida de los estudiantes desde su inscripción hasta su graduación, incluyendo la gestión de instructores, programación de clases, cálculo automático de progreso, calificación de sesiones y generación de reportes analíticos.

### 1.2 Características Principales

- ✅ **Sistema Web Full-Stack**: Frontend interactivo y Backend robusto
- ✅ **Gestión Integral**: Cubre todos los aspectos operativos de una autoescuela
- ✅ **Automatización**: Cálculos y actualizaciones automáticas
- ✅ **Seguridad**: Autenticación y autorización implementadas
- ✅ **Análisis**: Dashboard con estadísticas y reportes
- ✅ **Escalabilidad**: Arquitectura preparada para crecimiento

---

## 2. Arquitectura Técnica

### 2.1 Stack Tecnológico

#### Frontend
- **Framework**: Next.js 16 (React Framework con Server-Side Rendering)
- **Librería UI**: React 19.2
- **Lenguaje**: TypeScript (tipado estático)
- **Estilos**: Tailwind CSS v4 (framework CSS utility-first)
- **Componentes UI**: Shadcn/ui (biblioteca de componentes accesibles)
- **Iconos**: Lucide React
- **Gráficos**: Recharts (visualización de datos)
- **Gestión de Estado**: SWR (data fetching y cache)
- **Formularios**: React Hook Form con validación Zod

#### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes (API REST)
- **Lenguaje**: TypeScript
- **Autenticación**: Supabase Auth (JWT tokens)
- **Validación**: Validación en cliente y servidor

#### Base de Datos
- **Sistema**: PostgreSQL (base de datos relacional)
- **Plataforma**: Supabase (Backend-as-a-Service)
- **Seguridad**: Row Level Security (RLS) - políticas de seguridad a nivel de fila
- **Índices**: Optimización de consultas con índices en campos clave

#### Herramientas y Servicios
- **Control de Versiones**: Git/GitHub
- **Package Manager**: pnpm
- **Hosting**: Vercel (plataforma de despliegue)
- **Autenticación y BD**: Supabase Cloud

### 2.2 Arquitectura de Capas

```
┌─────────────────────────────────────┐
│   Frontend (Next.js + React)        │
│   - Páginas y Componentes UI        │
│   - Formularios y Validación        │
│   - Visualización de Datos          │
└──────────────┬──────────────────────┘
               │ HTTP Requests
┌──────────────▼──────────────────────┐
│   API Routes (Next.js)              │
│   - Endpoints REST                  │
│   - Validación de datos             │
│   - Autenticación                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Servicios (TypeScript)            │
│   - Lógica de negocio               │
│   - Validaciones de reglas          │
│   - Cálculos automáticos            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Base de Datos (PostgreSQL)         │
│   - Tablas relacionales             │
│   - Políticas RLS                    │
│   - Triggers y Funciones             │
└──────────────────────────────────────┘
```

---

## 3. Módulos del Sistema

### 3.1 Módulo de Autenticación y Seguridad

#### Funcionalidades
- **Login seguro**: Autenticación con email y contraseña mediante Supabase Auth
- **Protección de rutas**: Middleware que valida sesiones y redirige usuarios no autenticados
- **Renovación automática**: Renovación automática de tokens JWT
- **Logout seguro**: Cierre de sesión con limpieza de tokens y cookies
- **Row Level Security**: Políticas de seguridad a nivel de base de datos que restringen acceso según usuario autenticado

#### Validaciones
- Email debe tener formato válido
- Contraseña debe cumplir requisitos de seguridad
- Sesión expira después de tiempo de inactividad
- Tokens JWT validados en cada solicitud

#### Características Técnicas
- Autenticación basada en JWT tokens
- Sesiones seguras con renovación automática
- Protección de rutas mediante middleware
- Validación de tokens en cada solicitud

---

### 3.2 Módulo de Gestión de Estudiantes

#### Funcionalidades

**CRUD Completo:**
- ✅ Crear nuevos estudiantes
- ✅ Leer/obtener estudiantes (listado y detalle)
- ✅ Actualizar información de estudiantes
- ✅ Eliminar estudiantes (con validación de clases asociadas)

**Búsqueda y Filtrado:**
- ✅ Búsqueda en tiempo real por:
  - CI (Cédula de Identidad)
  - Email
  - Nombre
  - Apellido
  - Teléfono
- ✅ Filtrado por estado (activo, en_curso, graduado, inactivo)
- ✅ Paginación de resultados (optimización de rendimiento)

**Gestión de Estados:**
- ✅ Estados automáticos:
  - **"activo"**: Al crear un nuevo estudiante
  - **"en_curso"**: Cuando se crea su primera clase
  - **"graduado"**: Cuando completa horas requeridas y aprueba examen
  - **"inactivo"**: Cambio manual por parte del administrador
- ✅ Cambio automático de estado cuando se eliminan todas las clases (vuelve a "activo")

**Categorías de Licencia:**
- ✅ Soporte para múltiples categorías:
  - **M**: Moto
  - **P**: Particular
  - **A**: Autobús
  - **B**: Bus/Camión
  - **C**: Profesional

#### Validaciones

**Validaciones de Datos:**
- ✅ **CI único**: No permite duplicados (constraint UNIQUE en base de datos)
- ✅ **Email único**: No permite duplicados (constraint UNIQUE en base de datos)
- ✅ **Edad mínima**: Fecha de nacimiento debe ser >= 16 años
- ✅ **Formato de email**: Validación de formato de email válido
- ✅ **Campos requeridos**: CI, nombre, apellido, email son obligatorios

**Validaciones de Negocio:**
- ✅ No permite eliminar estudiante si tiene clases asociadas (muestra advertencia)
- ✅ Validación de formato de teléfono
- ✅ Validación de formato de fecha de nacimiento

#### Campos de la Entidad

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| id | UUID | Identificador único | PK, generado automáticamente |
| ci | VARCHAR | Cédula de Identidad | UNIQUE, NOT NULL |
| nombre | VARCHAR | Nombre del estudiante | NOT NULL |
| apellido | VARCHAR | Apellido del estudiante | NOT NULL |
| email | VARCHAR | Correo electrónico | UNIQUE, NOT NULL, formato válido |
| telefono | VARCHAR | Teléfono de contacto | Opcional |
| direccion | VARCHAR | Dirección de residencia | Opcional |
| fecha_nacimiento | DATE | Fecha de nacimiento | NOT NULL, >= 16 años |
| estado | VARCHAR | Estado del estudiante | activo, en_curso, graduado, inactivo |
| fecha_inscripcion | TIMESTAMP | Fecha de inscripción | Generado automáticamente |
| categoria_licencia_deseada | VARCHAR | Categoría de licencia | M, P, A, B, C |

---

### 3.3 Módulo de Gestión de Instructores

#### Funcionalidades

**CRUD Completo:**
- ✅ Crear nuevos instructores
- ✅ Leer/obtener instructores (listado y detalle)
- ✅ Actualizar información de instructores
- ✅ Eliminar instructores (con validación de clases asociadas)

**Gestión de Disponibilidad:**
- ✅ **Horarios de disponibilidad**: Campos `hora_inicio` y `hora_fin` para definir disponibilidad
- ✅ Validación que `hora_fin` sea posterior a `hora_inicio`
- ✅ Validación al agendar clases fuera del horario de disponibilidad

**Estados:**
- ✅ **Activo**: Instructor disponible para clases
- ✅ **Inactivo**: Instructor no disponible temporalmente

**Especialidad:**
- ✅ Campo para definir especialidad del instructor (ej: práctica, teórica, ambas)

#### Validaciones

**Validaciones de Datos:**
- ✅ **Email único**: No permite duplicados (constraint UNIQUE en base de datos)
- ✅ **Horarios válidos**: `hora_fin` debe ser posterior a `hora_inicio`
- ✅ **Campos requeridos**: Nombre, apellido, email son obligatorios

**Validaciones de Negocio:**
- ✅ No permite eliminar instructor si tiene clases asociadas (muestra mensaje con número de clases)
- ✅ Validación de formato de email
- ✅ Validación de formato de teléfono

#### Campos de la Entidad

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| id | UUID | Identificador único | PK, generado automáticamente |
| nombre | VARCHAR | Nombre del instructor | NOT NULL |
| apellido | VARCHAR | Apellido del instructor | NOT NULL |
| email | VARCHAR | Correo electrónico | UNIQUE, NOT NULL, formato válido |
| telefono | VARCHAR | Teléfono de contacto | Opcional |
| especialidad | VARCHAR | Especialidad del instructor | Opcional |
| hora_inicio | TIME | Hora de inicio de disponibilidad | Opcional, formato HH:MM |
| hora_fin | TIME | Hora de fin de disponibilidad | Opcional, debe ser > hora_inicio |
| estado | VARCHAR | Estado del instructor | activo, inactivo |

---

### 3.4 Módulo de Gestión de Clases

#### Funcionalidades

**CRUD Completo:**
- ✅ Crear nuevas clases
- ✅ Leer/obtener clases (listado y detalle)
- ✅ Actualizar información de clases
- ✅ Eliminar clases
- ✅ Calificar clases

**Tipos de Clase:**
- ✅ **Práctica**: Clases prácticas de conducción
- ✅ **Teórica**: Clases teóricas de educación vial

**Estados Automáticos:**
- ✅ **"agendado"**: Estado inicial al crear una clase
- ✅ **"por_calificar"**: Cambio automático después de la hora de fin de la clase
- ✅ **"cursado"**: Cambio automático después de calificar la clase

**Calificación de Clases:**
- ✅ Nota numérica (0-100 puntos)
- ✅ Campo de observaciones (texto libre)
- ✅ Cambio automático de estado a "cursado" al calificar
- ✅ Validación que la clase haya finalizado antes de calificar

**Pre-llenado Automático:**
- ✅ Al seleccionar un estudiante, se pre-llenan automáticamente:
  - Categoría de licencia (del estudiante)
  - Duración estándar (del progreso del estudiante)

**Actualización Automática:**
- ✅ Al crear/eliminar clases, se actualiza automáticamente el progreso del estudiante
- ✅ Al crear la primera clase, el estado del estudiante cambia a "en_curso"
- ✅ Al eliminar todas las clases, el estado del estudiante vuelve a "activo"

#### Validaciones

**Validaciones de Datos:**
- ✅ **Estudiante requerido**: Debe seleccionar un estudiante
- ✅ **Instructor requerido**: Debe seleccionar un instructor
- ✅ **Fecha requerida**: Debe especificar fecha de la clase
- ✅ **Hora requerida**: Debe especificar hora de la clase
- ✅ **Duración requerida**: Debe especificar duración en minutos
- ✅ **Tipo requerido**: Debe especificar si es práctica o teórica

**Validaciones de Negocio:**
- ✅ **No conflictos de horario**: No permite crear clases con la misma fecha y hora para:
  - El mismo estudiante
  - El mismo instructor
- ✅ **No exceder horas requeridas**: No permite crear clases que excedan las horas requeridas del estudiante (incluyendo penalización si existe)
- ✅ **Disponibilidad del instructor**: No permite agendar clases fuera del horario de disponibilidad del instructor (`hora_inicio` y `hora_fin`)
- ✅ **Calificación válida**: 
  - Nota debe estar entre 0 y 100
  - Solo se puede calificar si el estado es "por_calificar" o "agendado" (si ya pasó la hora de fin)
  - Observaciones opcionales pero recomendadas

**Validaciones de Calificación:**
- ✅ La clase debe haber finalizado (hora actual >= hora de fin de la clase)
- ✅ Nota debe ser numérica entre 0 y 100
- ✅ Una vez calificada, el estado cambia automáticamente a "cursado"

#### Campos de la Entidad

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| id | UUID | Identificador único | PK, generado automáticamente |
| estudiante_id | UUID | Referencia al estudiante | FK → students.id, CASCADE DELETE |
| instructor_id | UUID | Referencia al instructor | FK → instructors.id, RESTRICT DELETE |
| tipo | VARCHAR | Tipo de clase | practica, teorica |
| categoria_licencia | VARCHAR | Categoría de licencia | M, P, A, B, C |
| fecha | DATE | Fecha de la clase | NOT NULL, formato YYYY-MM-DD |
| hora | TIME | Hora de inicio | NOT NULL, formato HH:MM |
| duracion_minutos | INTEGER | Duración en minutos | NOT NULL, > 0 |
| estado | VARCHAR | Estado de la clase | agendado, por_calificar, cursado |
| nota | NUMERIC | Nota de la clase | 0-100, NULLABLE |
| observaciones | TEXT | Observaciones de la clase | NULLABLE |

---

### 3.5 Módulo de Progreso de Estudiantes

#### Funcionalidades

**Cálculo Automático:**
- ✅ **Suma automática**: Suma automática de duraciones de clases (en minutos)
- ✅ **Separación por tipo**: Horas prácticas y teóricas calculadas por separado
- ✅ **Porcentaje de avance**: Cálculo automático basado en horas realizadas vs requeridas (incluyendo penalización)

**Requisitos Personalizados:**
- ✅ Configuración de horas prácticas requeridas por estudiante
- ✅ Configuración de horas teóricas requeridas por estudiante
- ✅ Configuración de duración estándar de clases por estudiante
- ✅ Visualización de "Configurar Curso" si los requisitos no están configurados

**Sistema de Penalización:**
- ✅ Campos para penalización de horas en caso de reprobación de examen
- ✅ Penalización aplicada a horas prácticas y/o teóricas
- ✅ Penalización considerada en el cálculo de porcentaje de avance

**Cambio Automático de Estado:**
- ✅ Cambio a "graduado" cuando:
  - Completa 100% de horas requeridas (incluyendo penalización)
  - Aprueba el examen final

**Visualización:**
- ✅ Progreso visual con barras de progreso
- ✅ Porcentajes de avance por tipo (prácticas y teóricas)
- ✅ Horas realizadas vs requeridas
- ✅ Indicador de elegibilidad para examen final

#### Validaciones

**Validaciones de Requisitos:**
- ✅ Horas requeridas deben ser números positivos
- ✅ Duración estándar debe ser número positivo
- ✅ No permite modificar requisitos si el estudiante ya aprobó el examen

**Validaciones de Penalización:**
- ✅ Penalización debe ser número positivo o cero
- ✅ Penalización se suma a las horas requeridas para el cálculo

#### Campos de la Entidad

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| id | UUID | Identificador único | PK, generado automáticamente |
| estudiante_id | UUID | Referencia al estudiante | FK → students.id, UNIQUE, CASCADE DELETE |
| clases_practicas_realizadas | INTEGER | Minutos de prácticas realizadas | Calculado automáticamente |
| clases_teoricas_realizadas | INTEGER | Minutos de teóricas realizadas | Calculado automáticamente |
| horas_practicas_requeridas | INTEGER | Horas prácticas requeridas | NULLABLE, > 0 si configurado |
| horas_teoricas_requeridas | INTEGER | Horas teóricas requeridas | NULLABLE, > 0 si configurado |
| duracion_estandar_minutos | INTEGER | Duración estándar de clases | NULLABLE, > 0 si configurado |
| porcentaje_avance | NUMERIC | Porcentaje de avance total | Calculado automáticamente |
| nota_final | NUMERIC | Nota del examen final | 0-100, NULLABLE |
| aprobado | BOOLEAN | Si aprobó el examen | NULLABLE |
| reintentos | INTEGER | Número de reintentos | DEFAULT 0 |
| horas_penalizacion_practicas | INTEGER | Penalización en prácticas | DEFAULT 0 |
| horas_penalizacion_teoricas | INTEGER | Penalización en teóricas | DEFAULT 0 |

---

### 3.6 Módulo de Calificaciones (Notas)

#### Funcionalidades

**Lista de Estudiantes:**
- ✅ Vista de todos los estudiantes con acceso a sus calificaciones
- ✅ Botón "Notas" junto a cada estudiante para acceder a sus calificaciones

**Visualización Completa:**
- ✅ Todas las clases con sus notas y observaciones
- ✅ Organización por estados:
  - **"Pendientes de Calificar"**: Clases que ya finalizaron pero no tienen nota
  - **"Calificadas"**: Clases con nota asignada
  - **"Programadas"**: Clases futuras

**Promedios Separados:**
- ✅ **Promedio de clases teóricas**: Cálculo automático basado en clases teóricas calificadas
- ✅ **Promedio de clases prácticas**: Cálculo automático basado en clases prácticas calificadas
- ✅ **Total de clases**: Conteo de clases por tipo
- ✅ **Estado de aprobación**: Indicador si el promedio es >= 51 (APROBADO) o < 51 (REPROBADO)

**Categoría de Licencia:**
- ✅ Visualización destacada de la categoría de licencia del estudiante
- ✅ Mostrada prominentemente en la parte superior del módulo

**Calificación Inline:**
- ✅ Posibilidad de calificar clases pendientes directamente desde el módulo
- ✅ Formulario de calificación con nota y observaciones
- ✅ Validación que la clase haya finalizado

**Validación para Examen Final:**
- ✅ Indicador de elegibilidad para examen final basado en:
  - Completar 100% de horas requeridas
  - Tener promedio >= 51 en teóricas
  - Tener promedio >= 51 en prácticas
- ✅ Mensaje claro si no cumple los requisitos

#### Cálculos

**Cálculo de Promedios:**
```typescript
promedioTeoricas = suma(notas_clases_teoricas) / cantidad_clases_teoricas
promedioPracticas = suma(notas_clases_practicas) / cantidad_clases_practicas
promedioGeneral = (promedioTeoricas + promedioPracticas) / 2
```

**Validación de Elegibilidad para Examen:**
```typescript
puedeRendirExamen = 
  horasCompletadas >= 100% AND
  promedioTeoricas >= 51 AND
  promedioPracticas >= 51
```

---

### 3.7 Módulo de Examen Final

#### Funcionalidades

**Calificación de Examen:**
- ✅ Nota de 0-100 puntos
- ✅ Determinación automática de aprobación/reprobación:
  - **Nota >= 51**: Aprobado
  - **Nota <= 50**: Reprobado

**Validaciones Previas:**
- ✅ Requiere 100% de horas completadas (prácticas y teóricas)
- ✅ Requiere promedio >= 51 en clases teóricas
- ✅ Requiere promedio >= 51 en clases prácticas
- ✅ Si no cumple requisitos, el formulario está deshabilitado

**Sistema de Penalización:**
- ✅ Campos para aplicar horas adicionales en caso de reprobación
- ✅ Penalización aplicada a horas prácticas y/o teóricas
- ✅ Penalización incrementa las horas requeridas

**Reintentos:**
- ✅ Contador automático de reintentos
- ✅ Incrementado automáticamente al reprobar

**Inmutabilidad:**
- ✅ No permite modificar nota una vez calificada
- ✅ Campos bloqueados después de calificar

**Cambio de Estado:**
- ✅ Cambio automático a "graduado" al aprobar el examen
- ✅ Actualización del estado del estudiante

#### Validaciones

**Validaciones de Datos:**
- ✅ Nota debe estar entre 0 y 100
- ✅ Nota debe ser numérica

**Validaciones de Negocio:**
- ✅ No permite calificar si no cumple requisitos previos
- ✅ No permite modificar nota una vez calificada
- ✅ No permite modificar requisitos si el estudiante aprobó el examen

---

### 3.8 Dashboard Administrativo

#### Funcionalidades

**KPIs en Tiempo Real:**
- ✅ **Total de estudiantes**: Conteo total de estudiantes registrados
- ✅ **Estudiantes activos**: Conteo de estudiantes en estado "activo"
- ✅ **Estudiantes en curso**: Conteo de estudiantes en estado "en_curso"
- ✅ **Estudiantes graduados**: Conteo de estudiantes en estado "graduado"
- ✅ **Estudiantes inactivos**: Conteo de estudiantes en estado "inactivo"

**Gráficos Visuales:**
- ✅ **Gráfico de tendencia**: Gráfico de barras con inscripciones de últimos 6 meses
- ✅ **Gráfico circular**: Distribución de estudiantes por estado (pie chart)
- ✅ Actualización automática de datos

**Tabla de Resumen:**
- ✅ Resumen detallado por estado con conteos
- ✅ Porcentajes de distribución
- ✅ Visualización clara y organizada

**Actualización Automática:**
- ✅ Datos actualizados en tiempo real
- ✅ Carga automática al acceder al dashboard

---

### 3.9 Módulo de Reportes

#### Funcionalidades

**Reportes de Estudiantes:**
- ✅ Listado completo de estudiantes
- ✅ Filtros por estado
- ✅ Información detallada de cada estudiante

**Reportes de Clases:**
- ✅ Historial completo de clases
- ✅ Filtros por fecha, tipo, estado
- ✅ Información detallada de cada clase

**Filtros Avanzados:**
- ✅ Por fecha (rango de fechas)
- ✅ Por tipo (práctica, teórica)
- ✅ Por estado (estudiantes o clases)
- ✅ Combinación de múltiples filtros

**Exportación:**
- ✅ **Formato CSV**: Compatible con Excel y otras herramientas
- ✅ **Formato JSON**: Para integraciones y procesamiento programático
- ✅ Descarga directa de archivos

**Resumen Estadístico:**
- ✅ Estadísticas agregadas en los reportes
- ✅ Conteos y totales
- ✅ Información resumida

---

## 4. Validaciones y Reglas de Negocio

### 4.1 Validaciones de Datos

#### Estudiantes
- ✅ CI único (no permite duplicados)
- ✅ Email único (no permite duplicados)
- ✅ Edad mínima de 16 años
- ✅ Formato de email válido
- ✅ Campos requeridos: CI, nombre, apellido, email

#### Instructores
- ✅ Email único (no permite duplicados)
- ✅ `hora_fin` debe ser posterior a `hora_inicio`
- ✅ Formato de email válido
- ✅ Campos requeridos: nombre, apellido, email

#### Clases
- ✅ Estudiante e instructor requeridos
- ✅ Fecha, hora y duración requeridas
- ✅ Tipo de clase requerido (práctica o teórica)
- ✅ Nota entre 0 y 100 (si se califica)
- ✅ No conflictos de horario para mismo estudiante o instructor
- ✅ No exceder horas requeridas del estudiante
- ✅ Clase debe estar dentro del horario de disponibilidad del instructor

### 4.2 Reglas de Negocio

#### Gestión de Estados Automática

**Estudiantes:**
- Al crear estudiante → estado "activo"
- Al crear primera clase → estado "en_curso"
- Al eliminar todas las clases → estado vuelve a "activo"
- Al completar horas y aprobar examen → estado "graduado"

**Clases:**
- Al crear clase → estado "agendado"
- Después de hora de fin → estado "por_calificar" (automático)
- Al calificar clase → estado "cursado"

#### Validaciones de Negocio

**Clases:**
- ❌ No permite crear clases con misma fecha y hora para mismo estudiante
- ❌ No permite crear clases con misma fecha y hora para mismo instructor
- ❌ No permite crear clases que excedan horas requeridas (incluyendo penalización)
- ❌ No permite agendar clases fuera del horario de disponibilidad del instructor
- ✅ Actualiza automáticamente el progreso al crear/eliminar clases

**Examen Final:**
- ❌ No permite calificar examen hasta completar 100% de horas requeridas
- ❌ No permite calificar examen hasta que promedio teóricas >= 51
- ❌ No permite calificar examen hasta que promedio prácticas >= 51
- ❌ No permite modificar nota de examen una vez calificado
- ✅ Incrementa reintentos automáticamente al reprobar

**Requisitos:**
- ❌ No permite modificar requisitos si el estudiante aprobó el examen
- ✅ Permite configurar requisitos personalizados por estudiante

**Eliminación:**
- ❌ No permite eliminar instructor con clases asociadas (muestra mensaje con número de clases)
- ⚠️ Permite eliminar estudiante con clases asociadas (muestra advertencia, elimina en cascada)

### 4.3 Cálculos Automáticos

**Progreso:**
```typescript
// Horas realizadas
clases_practicas_realizadas = suma(duracion_minutos de clases prácticas)
clases_teoricas_realizadas = suma(duracion_minutos de clases teóricas)

// Porcentaje de avance
totalHorasRequeridas = (horas_practicas_requeridas + horas_penalizacion_practicas) + 
                       (horas_teoricas_requeridas + horas_penalizacion_teoricas)
totalHorasRealizadas = clases_practicas_realizadas + clases_teoricas_realizadas
porcentaje_avance = (totalHorasRealizadas / totalHorasRequeridas) * 100
```

**Promedios:**
```typescript
// Promedio teóricas
promedioTeoricas = suma(notas de clases teóricas calificadas) / cantidad de clases teóricas calificadas

// Promedio prácticas
promedioPracticas = suma(notas de clases prácticas calificadas) / cantidad de clases prácticas calificadas

// Promedio general
promedioGeneral = (promedioTeoricas + promedioPracticas) / 2
```

**Elegibilidad para Examen:**
```typescript
puedeRendirExamen = 
  porcentaje_avance >= 100 AND
  promedioTeoricas >= 51 AND
  promedioPracticas >= 51
```

---

## 5. Modelo de Datos

### 5.1 Entidades Principales

#### Estudiantes (students)
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ci VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  fecha_nacimiento DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'en_curso', 'graduado', 'inactivo')),
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),
  categoria_licencia_deseada VARCHAR(1) CHECK (categoria_licencia_deseada IN ('M', 'P', 'A', 'B', 'C'))
);
```

#### Instructores (instructors)
```sql
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  especialidad VARCHAR(100),
  hora_inicio TIME,
  hora_fin TIME,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  CHECK (hora_fin IS NULL OR hora_inicio IS NULL OR hora_fin > hora_inicio)
);
```

#### Clases (classes)
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('practica', 'teorica')),
  categoria_licencia VARCHAR(1) CHECK (categoria_licencia IN ('M', 'P', 'A', 'B', 'C')),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos > 0),
  estado VARCHAR(20) DEFAULT 'agendado' CHECK (estado IN ('agendado', 'por_calificar', 'cursado')),
  nota NUMERIC(5,2) CHECK (nota IS NULL OR (nota >= 0 AND nota <= 100)),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Progreso de Estudiantes (student_progress)
```sql
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  clases_practicas_realizadas INTEGER DEFAULT 0,
  clases_teoricas_realizadas INTEGER DEFAULT 0,
  horas_practicas_requeridas INTEGER,
  horas_teoricas_requeridas INTEGER,
  duracion_estandar_minutos INTEGER,
  porcentaje_avance NUMERIC(5,2) DEFAULT 0,
  nota_final NUMERIC(5,2) CHECK (nota_final IS NULL OR (nota_final >= 0 AND nota_final <= 100)),
  aprobado BOOLEAN,
  reintentos INTEGER DEFAULT 0,
  horas_penalizacion_practicas INTEGER DEFAULT 0,
  horas_penalizacion_teoricas INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Relaciones

- **Clases → Estudiantes**: Relación muchos a uno (CASCADE DELETE)
  - Una clase pertenece a un estudiante
  - Al eliminar estudiante, se eliminan sus clases

- **Clases → Instructores**: Relación muchos a uno (RESTRICT DELETE)
  - Una clase pertenece a un instructor
  - No se puede eliminar instructor con clases asociadas

- **Progreso → Estudiantes**: Relación uno a uno (CASCADE DELETE)
  - Un estudiante tiene un registro de progreso
  - Al eliminar estudiante, se elimina su progreso

### 5.3 Índices

```sql
-- Índices para optimización de búsquedas
CREATE INDEX idx_students_ci ON students(ci);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_estado ON students(estado);
CREATE INDEX idx_classes_estudiante_id ON classes(estudiante_id);
CREATE INDEX idx_classes_fecha ON classes(fecha);
CREATE INDEX idx_classes_categoria_licencia ON classes(categoria_licencia);
```

---

## 6. Seguridad

### 6.1 Autenticación

- **Método**: Autenticación basada en JWT tokens mediante Supabase Auth
- **Login**: Email y contraseña
- **Sesiones**: Renovación automática de tokens
- **Protección de rutas**: Middleware que valida sesiones
- **Logout**: Limpieza de tokens y cookies

### 6.2 Autorización

- **Row Level Security (RLS)**: Políticas de seguridad a nivel de base de datos
- **Acceso restringido**: Solo usuarios autenticados pueden acceder a datos
- **Validación de permisos**: Validación en API routes

### 6.3 Validación de Datos

- **Cliente**: Validación en formularios (React Hook Form + Zod)
- **Servidor**: Validación en API routes
- **Base de datos**: Constraints y validaciones a nivel de BD
- **Prevención de inyección SQL**: Mediante Supabase (prepared statements)

### 6.4 Integridad de Datos

- **Constraints**: UNIQUE, CHECK, FOREIGN KEY
- **Validaciones de negocio**: En servicios TypeScript
- **Prevención de duplicados**: Constraints UNIQUE
- **Eliminación en cascada**: Controlada mediante FOREIGN KEY

---

## 7. Características Técnicas

### 7.1 Automatización de Procesos

- ✅ Actualización automática de estados de estudiantes
- ✅ Cambio automático de estados de clases
- ✅ Cálculo automático de progreso
- ✅ Actualización automática de promedios
- ✅ Cambio automático a "graduado" al aprobar examen

### 7.2 Optimización de Rendimiento

- ✅ Paginación de listados
- ✅ Índices en base de datos
- ✅ Cache con SWR
- ✅ Consultas optimizadas
- ✅ Lazy loading de componentes

### 7.3 Experiencia de Usuario

- ✅ Interfaz responsive (mobile-first)
- ✅ Feedback visual inmediato (loading states, mensajes)
- ✅ Validación en tiempo real
- ✅ Diseño moderno con Tailwind CSS y Shadcn/ui
- ✅ Iconos y gráficos visuales

### 7.4 Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Diseño responsive para móvil, tablet y desktop
- ✅ Accesibilidad (componentes Shadcn/ui)

---

## 8. Requisitos Implementados

### 8.1 Requisitos Funcionales (27)

| ID | Requisito | Estado |
|----|-----------|--------|
| RF01 | Registro de estudiantes con datos personales y categoría de licencia | ✅ |
| RF02 | Gestión de instructores con datos personales y estado | ✅ |
| RF03 | CRUD de clases con validaciones | ✅ |
| RF04 | Cálculo automático de progreso basado en duración de clases | ✅ |
| RF05 | Configuración de requisitos personalizados por estudiante | ✅ |
| RF06 | Validación de conflictos de fecha/hora en clases | ✅ |
| RF07 | Validación de horas excedidas al crear clases | ✅ |
| RF08 | Cambio automático de estado estudiante (activo ↔ en_curso) | ✅ |
| RF09 | Calificación de examen solo con 100% de horas completadas | ✅ |
| RF10 | Sistema de examen con aprobación/reprobación y penalización | ✅ |
| RF11 | Inmutabilidad de nota de examen una vez calificado | ✅ |
| RF12 | Inmutabilidad de requisitos si estudiante aprobó examen | ✅ |
| RF13 | Cambio automático a estado "graduado" | ✅ |
| RF14 | Validación de eliminación de instructor con clases | ✅ |
| RF15 | Advertencia al eliminar estudiante con clases | ✅ |
| RF16 | Dashboard con estadísticas en tiempo real | ✅ |
| RF17 | Generación de reportes en CSV y JSON | ✅ |
| RF18 | Agrupación de clases por estudiante | ✅ |
| RF19 | Pre-llenado automático de datos al seleccionar estudiante | ✅ |
| RF20 | Autenticación requerida para acceso | ✅ |
| RF21 | Validación de disponibilidad de instructor al agendar clases | ✅ |
| RF22 | Gestión automática de estados de clases | ✅ |
| RF23 | Calificación de clases con nota y observaciones | ✅ |
| RF24 | Cálculo de promedios separados por tipo de clase | ✅ |
| RF25 | Validación de promedios >= 51 para habilitar examen final | ✅ |
| RF26 | Módulo de Notas para visualización de calificaciones | ✅ |
| RF27 | Visualización de categoría de licencia en módulo de Notas | ✅ |

### 8.2 Requisitos No Funcionales (8)

| ID | Requisito | Estado |
|----|-----------|--------|
| RNF01 | Tiempo de respuesta < 2 segundos para lecturas | ✅ |
| RNF02 | Integridad referencial con eliminación en cascada | ✅ |
| RNF03 | Compatibilidad con navegadores modernos y responsive | ✅ |
| RNF04 | Row Level Security (RLS) en base de datos | ✅ |
| RNF05 | Validación cliente y servidor | ✅ |
| RNF06 | Manejo elegante de errores | ✅ |
| RNF07 | Almacenamiento consistente de fechas (YYYY-MM-DD) | ✅ |
| RNF08 | Feedback visual inmediato en operaciones asíncronas | ✅ |

**Total de Requisitos Implementados: 35 (27 funcionales + 8 no funcionales)**

---

## 9. Arquitectura de Archivos

```
app/
├── api/                    # API Routes (Backend)
│   ├── auth/              # Autenticación
│   │   ├── login/
│   │   ├── logout/
│   │   └── user/
│   ├── students/          # CRUD estudiantes
│   │   └── [id]/
│   ├── instructors/        # CRUD instructores
│   │   └── [id]/
│   ├── classes/           # CRUD clases
│   │   ├── [id]/
│   │   └── check-conflict/
│   ├── progress/          # Progreso de estudiantes
│   │   └── [studentId]/
│   │       └── requirements/
│   └── reports/           # Reportes
│       └── export/
├── dashboard/              # Páginas del dashboard
│   ├── students/          # Gestión de estudiantes
│   │   ├── create/
│   │   └── [id]/
│   ├── instructors/       # Gestión de instructores
│   │   ├── create/
│   │   └── [id]/
│   ├── classes/           # Gestión de clases
│   │   ├── create/
│   │   └── [id]/
│   ├── progress/          # Seguimiento de progreso
│   │   └── [id]/
│   ├── grades/            # Módulo de notas
│   │   └── [id]/
│   └── reports/           # Reportes
└── auth/                   # Páginas de autenticación
    └── login/

components/
├── layout/                 # Componentes de layout
│   └── sidebar.tsx
├── students/               # Componentes de estudiantes
│   ├── student-form.tsx
│   ├── student-list.tsx
│   ├── student-progress.tsx
│   ├── student-requirements.tsx
│   └── student-exam.tsx
├── instructors/            # Componentes de instructores
│   ├── instructor-form.tsx
│   └── instructor-list.tsx
├── classes/                # Componentes de clases
│   ├── class-form.tsx
│   └── class-list.tsx
├── reports/                # Componentes de reportes
│   └── report-generator.tsx
└── ui/                     # Componentes UI reutilizables

lib/
├── supabase/               # Clientes Supabase
│   ├── client.ts
│   └── server.ts
├── services/               # Servicios de lógica de negocio
│   ├── student-service.ts
│   ├── instructor-service.ts
│   ├── class-service.ts
│   ├── progress-service.ts
│   └── report-service.ts
├── types/                  # Tipos TypeScript
│   └── index.ts
└── utils/                  # Utilidades

scripts/
└── *.sql                   # Scripts de base de datos
```

---

## 10. Resumen Ejecutivo

### 10.1 Cobertura de Funcionalidades

El sistema cubre las siguientes áreas principales:

1. **Gestión de Estudiantes**: CRUD completo con estados automáticos y requisitos personalizados
2. **Gestión de Instructores**: CRUD completo con validaciones de integridad y horarios de disponibilidad
3. **Gestión de Clases**: CRUD con validaciones de conflictos, horas excedidas y disponibilidad de instructores, con estados automáticos y calificación
4. **Seguimiento de Progreso**: Cálculo automático basado en duración real de clases
5. **Sistema de Calificación**: Calificación de clases individuales con notas y observaciones, cálculo de promedios por tipo
6. **Módulo de Notas**: Visualización completa de calificaciones con promedios separados y categoría de licencia
7. **Sistema de Examen**: Calificación con aprobación/reprobación y penalización manual, validación de promedios previos
8. **Dashboard y Reportes**: Visualización de estadísticas y generación de reportes
9. **Seguridad**: Autenticación y Row Level Security

### 10.2 Métricas del Sistema

- **Módulos implementados**: 9
- **Requisitos funcionales**: 27
- **Requisitos no funcionales**: 8
- **Total de requisitos**: 35
- **Entidades principales**: 4
- **Relaciones**: 3
- **Índices de optimización**: 7
- **Validaciones de negocio**: 15+
- **Cálculos automáticos**: 5+

---

**Documento generado**: 2025-12-05  
**Sistema**: Sistema de Gestión de Autoescuela Concordia  
**Versión**: 2.0  
**Propósito**: Referencia completa para el informe del proyecto



