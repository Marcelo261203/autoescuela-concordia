# Análisis de Requisitos - Sistema de Gestión de Autoescuela Concordia

## 1. Revisión de Fuentes de Datos

### 1.1 Entidades Principales del Sistema

#### **Estudiantes (students)**
- **Campos principales**: id, ci, nombre, apellido, email, telefono, direccion, fecha_nacimiento, estado, fecha_inscripcion, categoria_licencia_deseada
- **Estados posibles**: activo, en_curso, graduado, inactivo
- **Operaciones**: Crear, Leer, Actualizar, Eliminar (con validación de clases asociadas)
- **Validaciones**: CI único, email único, fecha_nacimiento >= 16 años

#### **Instructores (instructors)**
- **Campos principales**: id, nombre, apellido, email, telefono, especialidad, hora_inicio, hora_fin, estado
- **Estados posibles**: activo, inactivo
- **Operaciones**: Crear, Leer, Actualizar, Eliminar (con validación de clases asociadas)
- **Validaciones**: Email único, hora_fin debe ser posterior a hora_inicio
- **Disponibilidad**: Horario de disponibilidad definido por hora_inicio y hora_fin (campos TIME)

#### **Clases (classes)**
- **Campos principales**: id, estudiante_id, instructor_id, tipo, categoria_licencia, fecha, hora, duracion_minutos, estado, nota, observaciones
- **Tipos**: practica, teorica
- **Estados posibles**: agendado, por_calificar, cursado
- **Categorías de licencia**: M (Moto), P (Particular), A (Autobús), B (Bus/Camión), C (Profesional)
- **Operaciones**: Crear, Leer, Actualizar, Eliminar, Calificar
- **Validaciones**: 
  - No permitir conflictos de fecha/hora para el mismo estudiante o instructor
  - No permitir exceder horas requeridas del estudiante
  - No permitir agendar clases fuera del horario de disponibilidad del instructor
  - Actualización automática de estado del estudiante (activo → en_curso)
  - Actualización automática de estado de clase (agendado → por_calificar → cursado)

#### **Progreso de Estudiantes (student_progress)**
- **Campos principales**: 
  - Progreso: clases_practicas_realizadas, clases_teoricas_realizadas (en minutos)
  - Requisitos personalizados: horas_practicas_requeridas, horas_teoricas_requeridas, duracion_estandar_minutos
  - Examen: nota_final, aprobado, reintentos
  - Penalización: horas_penalizacion_practicas, horas_penalizacion_teoricas
  - Calculado: porcentaje_avance
- **Operaciones**: Leer, Actualizar (automático al crear/modificar clases)
- **Lógica de negocio**: 
  - Cálculo automático de horas realizadas basado en duración de clases
  - Cálculo de porcentaje de avance
  - Cambio automático de estado a "graduado" cuando completa horas y aprueba examen

### 1.2 Fuentes Utilizadas

#### **A. Interacciones del Usuario (Entradas)**
1. **Formularios de creación/edición**:
   - Formulario de estudiantes (datos personales, categoría de licencia deseada)
   - Formulario de instructores (datos personales, especialidad)
   - Formulario de clases (estudiante, instructor, tipo, fecha, hora, duración, categoría)
   - Formulario de requisitos personalizados (horas prácticas/teóricas requeridas, duración estándar)
   - Formulario de examen final (nota, penalización)

2. **Filtros y búsquedas**:
   - Búsqueda de estudiantes por CI, email, nombre, apellido, teléfono
   - Filtro por estado de estudiante
   - Filtro de clases por estudiante
   - Filtro de reportes por fecha y tipo

3. **Acciones del usuario**:
   - Crear, editar, eliminar estudiantes
   - Crear, editar, eliminar instructores
   - Crear, editar, eliminar clases
   - Calificar examen final
   - Configurar requisitos personalizados
   - Generar reportes (CSV, JSON)

#### **B. Documentos/Datos (Base de Datos)**
1. **Tablas principales**:
   - `students`: Almacena información de estudiantes
   - `instructors`: Almacena información de instructores
   - `classes`: Almacena información de clases programadas
   - `student_progress`: Almacena progreso y requisitos de estudiantes

2. **Relaciones**:
   - `classes.estudiante_id` → `students.id` (CASCADE DELETE)
   - `classes.instructor_id` → `instructors.id` (RESTRICT DELETE)
   - `student_progress.estudiante_id` → `students.id` (CASCADE DELETE)

3. **Índices**:
   - Índices en CI, email, estado de estudiantes
   - Índices en categoría de licencia
   - Índices en estudiante_id y fecha de clases

4. **Políticas de Seguridad (RLS)**:
   - Row Level Security habilitado en todas las tablas
   - Acceso restringido a usuarios autenticados

#### **C. Observaciones (Lógica de Negocio)**
1. **Gestión de estados automática**:
   - Estudiante creado → estado "activo"
   - Primera clase creada → estado "en_curso"
   - Todas las clases eliminadas → estado vuelve a "activo"
   - Horas completadas + examen aprobado → estado "graduado"

2. **Validaciones de negocio**:
   - No permitir clases duplicadas en misma fecha/hora para mismo estudiante o instructor
   - No permitir exceder horas requeridas (incluyendo penalización)
   - No permitir agendar clases fuera del horario de disponibilidad del instructor
   - No permitir calificar examen hasta completar 100% de horas requeridas
   - No permitir calificar examen hasta que ambos promedios (teóricas y prácticas) sean >= 51
   - No permitir modificar nota de examen una vez calificado
   - No permitir modificar requisitos si el estudiante aprobó el examen

3. **Cálculos automáticos**:
   - Progreso calculado en minutos (suma de duración de clases)
   - Porcentaje de avance basado en horas realizadas vs requeridas (incluyendo penalización)
   - Reintentos incrementados automáticamente al reprobar

4. **Sistema de examen**:
   - Nota sobre 100 puntos
   - 51+ = Aprobado, 50 o menos = Reprobado
   - Penalización manual por parte del administrador
   - Requisito adicional: ambos promedios (teóricas y prácticas) deben ser >= 51 para habilitar examen

5. **Sistema de calificación de clases**:
   - Estados automáticos: agendado → por_calificar (después de hora de fin) → cursado (después de calificar)
   - Calificación con nota (0-100) y observaciones
   - Cálculo de promedios separados por tipo (teóricas y prácticas)
   - Visualización de notas en módulo dedicado

6. **Módulo de Notas**:
   - Lista de estudiantes con acceso a sus calificaciones
   - Visualización de todas las clases con sus notas
   - Promedios separados por tipo (teóricas y prácticas)
   - Indicador de categoría de licencia del estudiante
   - Estado de aprobación para examen final basado en promedios

---

## 2. Captura de Requisitos Candidatos

### 2.1 Requisitos Funcionales (F)

**RF01**: El sistema debe permitir registrar estudiantes con sus datos personales (CI, nombre, apellido, email, teléfono, dirección, fecha de nacimiento) y categoría de licencia deseada.

**RF02**: El sistema debe permitir gestionar instructores con sus datos personales (nombre, apellido, email, teléfono, especialidad, hora_inicio, hora_fin) y estado (activo/inactivo), donde hora_inicio y hora_fin definen el horario de disponibilidad del instructor.

**RF03**: El sistema debe permitir crear, editar y eliminar clases asociadas a un estudiante e instructor, especificando tipo (práctica/teórica), fecha, hora, duración y categoría de licencia.

**RF04**: El sistema debe calcular automáticamente el progreso del estudiante sumando las duraciones de sus clases (en minutos) y mostrando horas realizadas vs horas requeridas para prácticas y teóricas por separado.

**RF05**: El sistema debe permitir configurar requisitos personalizados por estudiante (horas prácticas requeridas, horas teóricas requeridas, duración estándar de clases).

**RF06**: El sistema debe validar que no se puedan crear clases con la misma fecha y hora para el mismo estudiante o instructor.

**RF07**: El sistema debe validar que no se puedan crear clases que excedan las horas requeridas del estudiante (incluyendo penalización si existe).

**RF08**: El sistema debe cambiar automáticamente el estado del estudiante de "activo" a "en_curso" cuando se crea su primera clase, y volver a "activo" si se eliminan todas sus clases.

**RF09**: El sistema debe permitir calificar el examen final del estudiante (nota 0-100) solo cuando haya completado el 100% de sus horas requeridas (prácticas y teóricas).

**RF10**: El sistema debe determinar automáticamente si el estudiante aprobó (nota ≥ 51) o reprobó (nota ≤ 50) el examen y permitir aplicar penalización manual de horas adicionales en caso de reprobación.

**RF11**: El sistema debe impedir modificar la nota del examen una vez que ha sido calificado.

**RF12**: El sistema debe impedir modificar los requisitos personalizados y la duración estándar de clases si el estudiante ya aprobó el examen.

**RF13**: El sistema debe cambiar automáticamente el estado del estudiante a "graduado" cuando complete todas sus horas requeridas (incluyendo penalización) y apruebe el examen.

**RF14**: El sistema debe validar que no se pueda eliminar un instructor que tenga clases asociadas, mostrando un mensaje de error con el número de clases.

**RF15**: El sistema debe advertir al usuario antes de eliminar un estudiante que tenga clases asociadas, indicando que las clases también se eliminarán.

**RF16**: El sistema debe mostrar un dashboard con estadísticas en tiempo real: total de estudiantes, distribución por estado, tendencia de inscripciones de últimos 6 meses.

**RF17**: El sistema debe permitir generar reportes de estudiantes y clases en formato CSV y JSON con filtros opcionales por fecha y tipo.

**RF18**: El sistema debe agrupar y mostrar las clases por estudiante en la interfaz, facilitando la visualización del historial completo.

**RF19**: El sistema debe pre-llenar automáticamente la categoría de licencia y duración estándar al seleccionar un estudiante al crear una clase.

**RF20**: El sistema debe requerir autenticación de usuario para acceder a todas las funcionalidades del sistema.

**RF21**: El sistema debe validar que no se puedan agendar clases fuera del horario de disponibilidad del instructor (hora_inicio y hora_fin).

**RF22**: El sistema debe gestionar estados automáticos de las clases: "agendado" al crear, "por_calificar" después de la hora de fin de la clase, y "cursado" después de ser calificada.

**RF23**: El sistema debe permitir calificar clases con nota (0-100) y observaciones, cambiando automáticamente el estado a "cursado".

**RF24**: El sistema debe calcular y mostrar promedios separados de clases teóricas y prácticas para cada estudiante.

**RF25**: El sistema debe requerir que ambos promedios (teóricas y prácticas) sean >= 51 para habilitar la calificación del examen final.

**RF26**: El sistema debe proporcionar un módulo de Notas que permita visualizar todas las calificaciones de un estudiante, incluyendo promedios por tipo y categoría de licencia.

**RF27**: El sistema debe mostrar la categoría de licencia del estudiante de forma destacada en el módulo de Notas.

### 2.2 Requisitos No Funcionales (NF)

**RNF01**: El sistema debe tener un tiempo de respuesta inferior a 2 segundos para operaciones de lectura (listados, búsquedas).

**RNF02**: El sistema debe mantener la integridad referencial de los datos, eliminando en cascada las clases cuando se elimina un estudiante.

**RNF03**: El sistema debe ser accesible desde navegadores web modernos (Chrome, Firefox, Safari, Edge) con soporte responsive para dispositivos móviles.

**RNF04**: El sistema debe implementar Row Level Security (RLS) en la base de datos para restringir el acceso a datos según el rol del usuario autenticado.

**RNF05**: El sistema debe validar datos en el cliente y servidor para prevenir errores y mejorar la experiencia del usuario.

**RNF06**: El sistema debe manejar errores de manera elegante, mostrando mensajes claros al usuario sin exponer detalles técnicos internos.

**RNF07**: El sistema debe almacenar fechas de manera consistente (formato YYYY-MM-DD) para evitar problemas de zona horaria.

**RNF08**: El sistema debe proporcionar feedback visual inmediato al usuario (loading states, mensajes de éxito/error) durante operaciones asíncronas.

---

## 3. Clasificación de Requisitos

| ID | Requisito | Tipo |
|----|-----------|------|
| RF01 | Registro de estudiantes con datos personales y categoría de licencia | F |
| RF02 | Gestión de instructores con datos personales y estado | F |
| RF03 | CRUD de clases con validaciones | F |
| RF04 | Cálculo automático de progreso basado en duración de clases | F |
| RF05 | Configuración de requisitos personalizados por estudiante | F |
| RF06 | Validación de conflictos de fecha/hora en clases | F |
| RF07 | Validación de horas excedidas al crear clases | F |
| RF08 | Cambio automático de estado estudiante (activo ↔ en_curso) | F |
| RF09 | Calificación de examen solo con 100% de horas completadas | F |
| RF10 | Sistema de examen con aprobación/reprobación y penalización | F |
| RF11 | Inmutabilidad de nota de examen una vez calificado | F |
| RF12 | Inmutabilidad de requisitos si estudiante aprobó examen | F |
| RF13 | Cambio automático a estado "graduado" | F |
| RF14 | Validación de eliminación de instructor con clases | F |
| RF15 | Advertencia al eliminar estudiante con clases | F |
| RF16 | Dashboard con estadísticas en tiempo real | F |
| RF17 | Generación de reportes en CSV y JSON | F |
| RF18 | Agrupación de clases por estudiante | F |
| RF19 | Pre-llenado automático de datos al seleccionar estudiante | F |
| RF20 | Autenticación requerida para acceso | F |
| RF21 | Validación de disponibilidad de instructor al agendar clases | F |
| RF22 | Gestión automática de estados de clases (agendado → por_calificar → cursado) | F |
| RF23 | Calificación de clases con nota y observaciones | F |
| RF24 | Cálculo de promedios separados por tipo de clase | F |
| RF25 | Validación de promedios >= 51 para habilitar examen final | F |
| RF26 | Módulo de Notas para visualización de calificaciones | F |
| RF27 | Visualización de categoría de licencia en módulo de Notas | F |
| RNF01 | Tiempo de respuesta < 2 segundos para lecturas | NF |
| RNF02 | Integridad referencial con eliminación en cascada | NF |
| RNF03 | Compatibilidad con navegadores modernos y responsive | NF |
| RNF04 | Row Level Security (RLS) en base de datos | NF |
| RNF05 | Validación cliente y servidor | NF |
| RNF06 | Manejo elegante de errores | NF |
| RNF07 | Almacenamiento consistente de fechas (YYYY-MM-DD) | NF |
| RNF08 | Feedback visual inmediato en operaciones asíncronas | NF |

---

## 4. Matriz de Requisitos (Verificación y Validación)

| ID | Requisito | Tipo | Verificación | Validación |
|----|-----------|------|--------------|------------|
| **RF01** | El sistema debe permitir registrar estudiantes con sus datos personales (CI, nombre, apellido, email, teléfono, dirección, fecha de nacimiento) y categoría de licencia deseada. | F | **Revisión de Código**: Verificar que `student-form.tsx` y `student-service.ts` implementen todos los campos requeridos. **Prueba de Unidad**: Crear test que valide inserción de estudiante con todos los campos. | **Prueba de Aceptación**: Usuario crea un estudiante completo y verifica que se guarda correctamente en la BD. **Demostración**: Mostrar formulario funcionando con validación de campos requeridos. |
| **RF02** | El sistema debe permitir gestionar instructores con sus datos personales (nombre, apellido, email, teléfono, especialidad, disponibilidad) y estado (activo/inactivo). | F | **Revisión de Código**: Verificar `instructor-form.tsx` y `instructor-service.ts`. **Prueba de Unidad**: Test de CRUD completo de instructores. | **Prueba de Aceptación**: Usuario crea, edita y elimina instructores verificando persistencia. **Demostración**: Mostrar gestión completa de instructores. |
| **RF03** | El sistema debe permitir crear, editar y eliminar clases asociadas a un estudiante e instructor, especificando tipo (práctica/teórica), fecha, hora, duración y categoría de licencia. | F | **Revisión de Código**: Verificar `class-form.tsx` y `class-service.ts`. **Prueba de Integración**: Test que valide creación de clase con relaciones a estudiante e instructor. | **Prueba de Aceptación**: Usuario crea una clase completa y verifica que se asocia correctamente. **Demostración**: Mostrar creación de clase con validaciones. |
| **RF04** | El sistema debe calcular automáticamente el progreso del estudiante sumando las duraciones de sus clases (en minutos) y mostrando horas realizadas vs horas requeridas. | F | **Revisión de Código**: Verificar lógica en `progress-service.ts` función `updateStudentProgress`. **Prueba de Unidad**: Test que calcule progreso correctamente con múltiples clases. | **Prueba de Aceptación**: Usuario crea varias clases y verifica que el progreso se actualiza correctamente. **Demostración**: Mostrar progreso actualizándose en tiempo real. |
| **RF05** | El sistema debe permitir configurar requisitos personalizados por estudiante (horas prácticas requeridas, horas teóricas requeridas, duración estándar de clases). | F | **Revisión de Código**: Verificar `student-requirements.tsx` y API `/api/progress/[studentId]/requirements`. **Prueba de Unidad**: Test de actualización de requisitos personalizados. | **Prueba de Aceptación**: Usuario configura requisitos personalizados y verifica que se aplican al cálculo de progreso. **Demostración**: Mostrar edición de requisitos y su impacto en el progreso. |
| **RF06** | El sistema debe validar que no se puedan crear clases con la misma fecha y hora para el mismo estudiante o instructor. | F | **Revisión de Código**: Verificar `checkClassConflict` en `class-service.ts`. **Prueba de Unidad**: Test que intente crear clases duplicadas y verifique rechazo. | **Prueba de Aceptación**: Usuario intenta crear clase duplicada y verifica mensaje de error. **Demostración**: Mostrar validación de conflicto funcionando. |
| **RF07** | El sistema debe validar que no se puedan crear clases que excedan las horas requeridas del estudiante (incluyendo penalización). | F | **Revisión de Código**: Verificar `checkHoursExceeded` en `class-service.ts`. **Prueba de Unidad**: Test que intente exceder horas y verifique rechazo. | **Prueba de Aceptación**: Usuario intenta crear clase que excede horas y verifica mensaje de error detallado. **Demostración**: Mostrar validación de horas excedidas. |
| **RF08** | El sistema debe cambiar automáticamente el estado del estudiante de "activo" a "en_curso" cuando se crea su primera clase, y volver a "activo" si se eliminan todas sus clases. | F | **Revisión de Código**: Verificar lógica en `createClass` y `deleteClass` de `class-service.ts`. **Prueba de Integración**: Test que cree/elimine clases y verifique cambio de estado. | **Prueba de Aceptación**: Usuario crea primera clase y verifica cambio a "en_curso", luego elimina todas y verifica vuelta a "activo". **Demostración**: Mostrar cambio automático de estado. |
| **RF09** | El sistema debe permitir calificar el examen final del estudiante (nota 0-100) solo cuando haya completado el 100% de sus horas requeridas. | F | **Revisión de Código**: Verificar validación en `student-exam.tsx` componente. **Prueba de Unidad**: Test que intente calificar sin completar horas y verifique rechazo. | **Prueba de Aceptación**: Usuario intenta calificar examen sin completar horas y verifica mensaje de bloqueo. **Demostración**: Mostrar deshabilitación del formulario de examen. |
| **RF10** | El sistema debe determinar automáticamente si el estudiante aprobó (nota ≥ 51) o reprobó (nota ≤ 50) el examen y permitir aplicar penalización manual. | F | **Revisión de Código**: Verificar lógica en `handleNotaChange` y `handleSubmit` de `student-exam.tsx`. **Prueba de Unidad**: Test que califique con diferentes notas y verifique aprobación/reprobación. | **Prueba de Aceptación**: Usuario califica examen con 45 puntos y verifica reprobación y campos de penalización habilitados. **Demostración**: Mostrar sistema de examen completo. |
| **RF11** | El sistema debe impedir modificar la nota del examen una vez que ha sido calificado. | F | **Revisión de Código**: Verificar que `isExamGraded` deshabilite inputs en `student-exam.tsx`. **Prueba de Unidad**: Test que intente modificar nota calificada y verifique rechazo. | **Prueba de Aceptación**: Usuario intenta modificar nota ya calificada y verifica que está bloqueada. **Demostración**: Mostrar campo de nota en modo solo lectura. |
| **RF12** | El sistema debe impedir modificar los requisitos personalizados y la duración estándar si el estudiante ya aprobó el examen. | F | **Revisión de Código**: Verificar validación `examApproved` en `student-requirements.tsx`. **Prueba de Unidad**: Test que intente modificar requisitos con examen aprobado y verifique rechazo. | **Prueba de Aceptación**: Usuario intenta modificar requisitos de estudiante graduado y verifica bloqueo. **Demostración**: Mostrar formulario deshabilitado para graduados. |
| **RF13** | El sistema debe cambiar automáticamente el estado del estudiante a "graduado" cuando complete todas sus horas requeridas (incluyendo penalización) y apruebe el examen. | F | **Revisión de Código**: Verificar lógica en `updateStudentProgress` de `progress-service.ts`. **Prueba de Integración**: Test que complete horas, apruebe examen y verifique cambio a "graduado". | **Prueba de Aceptación**: Usuario completa horas y aprueba examen, verifica cambio automático a "graduado". **Demostración**: Mostrar graduación automática. |
| **RF14** | El sistema debe validar que no se pueda eliminar un instructor que tenga clases asociadas, mostrando mensaje con número de clases. | F | **Revisión de Código**: Verificar `getInstructorClassesCount` y DELETE en `instructors/[id]/route.ts`. **Prueba de Unidad**: Test que intente eliminar instructor con clases y verifique rechazo. | **Prueba de Aceptación**: Usuario intenta eliminar instructor con clases y verifica mensaje de error con conteo. **Demostración**: Mostrar validación de eliminación. |
| **RF15** | El sistema debe advertir al usuario antes de eliminar un estudiante que tenga clases asociadas, indicando que las clases también se eliminarán. | F | **Revisión de Código**: Verificar `checkStudentHasClasses` y DELETE en `students/[id]/route.ts`. **Prueba de Unidad**: Test que intente eliminar estudiante con clases y verifique advertencia. | **Prueba de Aceptación**: Usuario intenta eliminar estudiante con clases y verifica mensaje de advertencia. **Demostración**: Mostrar diálogo de confirmación. |
| **RF16** | El sistema debe mostrar un dashboard con estadísticas en tiempo real: total de estudiantes, distribución por estado, tendencia de inscripciones de últimos 6 meses. | F | **Revisión de Código**: Verificar `getDashboardSummary` en `report-service.ts` y `dashboard/page.tsx`. **Prueba de Integración**: Test que verifique cálculo correcto de estadísticas. | **Prueba de Aceptación**: Usuario accede al dashboard y verifica que las estadísticas coinciden con los datos reales. **Demostración**: Mostrar dashboard con datos reales. |
| **RF17** | El sistema debe permitir generar reportes de estudiantes y clases en formato CSV y JSON con filtros opcionales por fecha y tipo. | F | **Revisión de Código**: Verificar `report-generator.tsx` y APIs de reportes. **Prueba de Unidad**: Test que genere reportes y verifique formato correcto. | **Prueba de Aceptación**: Usuario genera reportes con diferentes filtros y verifica contenido y formato. **Demostración**: Mostrar generación y descarga de reportes. |
| **RF18** | El sistema debe agrupar y mostrar las clases por estudiante en la interfaz, facilitando la visualización del historial completo. | F | **Revisión de Código**: Verificar `class-list.tsx` y filtro por estudiante. **Prueba de Unidad**: Test que agrupe clases por estudiante correctamente. | **Prueba de Aceptación**: Usuario filtra clases por estudiante y verifica agrupación correcta. **Demostración**: Mostrar lista de clases agrupada. |
| **RF19** | El sistema debe pre-llenar automáticamente la categoría de licencia y duración estándar al seleccionar un estudiante al crear una clase. | F | **Revisión de Código**: Verificar `handleStudentChange` en `class-form.tsx`. **Prueba de Unidad**: Test que verifique pre-llenado de campos. | **Prueba de Aceptación**: Usuario selecciona estudiante y verifica que se pre-llenan los campos. **Demostración**: Mostrar pre-llenado automático. |
| **RF20** | El sistema debe requerir autenticación de usuario para acceder a todas las funcionalidades del sistema. | F | **Revisión de Código**: Verificar `middleware.ts` y políticas RLS. **Prueba de Integración**: Test que intente acceder sin autenticación y verifique redirección. | **Prueba de Aceptación**: Usuario intenta acceder sin login y verifica redirección a página de login. **Demostración**: Mostrar protección de rutas. |
| **RF21** | El sistema debe validar que no se puedan agendar clases fuera del horario de disponibilidad del instructor (hora_inicio y hora_fin). | F | **Revisión de Código**: Verificar `checkInstructorAvailability` en `class-service.ts`. **Prueba de Unidad**: Test que intente agendar clase fuera del horario y verifique rechazo. | **Prueba de Aceptación**: Usuario intenta agendar clase fuera del horario del instructor y verifica mensaje de error. **Demostración**: Mostrar validación de disponibilidad. |
| **RF22** | El sistema debe gestionar estados automáticos de las clases: "agendado" al crear, "por_calificar" después de la hora de fin, y "cursado" después de calificar. | F | **Revisión de Código**: Verificar lógica de estados en `class-service.ts` y actualización automática. **Prueba de Integración**: Test que cree clase, espere hora de fin y verifique cambio de estado. | **Prueba de Aceptación**: Usuario crea clase y verifica cambio automático de estado después de la hora de fin. **Demostración**: Mostrar estados automáticos funcionando. |
| **RF23** | El sistema debe permitir calificar clases con nota (0-100) y observaciones, cambiando automáticamente el estado a "cursado". | F | **Revisión de Código**: Verificar `class-form.tsx` y API de actualización de clases. **Prueba de Unidad**: Test que califique clase y verifique cambio de estado. | **Prueba de Aceptación**: Usuario califica una clase y verifica que el estado cambia a "cursado". **Demostración**: Mostrar calificación de clases. |
| **RF24** | El sistema debe calcular y mostrar promedios separados de clases teóricas y prácticas para cada estudiante. | F | **Revisión de Código**: Verificar cálculo de promedios en `grades/[id]/page.tsx`. **Prueba de Unidad**: Test que calcule promedios correctamente por tipo. | **Prueba de Aceptación**: Usuario visualiza notas y verifica promedios separados por tipo. **Demostración**: Mostrar promedios calculados correctamente. |
| **RF25** | El sistema debe requerir que ambos promedios (teóricas y prácticas) sean >= 51 para habilitar la calificación del examen final. | F | **Revisión de Código**: Verificar validación en `student-exam.tsx` y `grades/[id]/page.tsx`. **Prueba de Unidad**: Test que verifique habilitación de examen basada en promedios. | **Prueba de Aceptación**: Usuario verifica que el examen solo se habilita cuando ambos promedios son >= 51. **Demostración**: Mostrar validación de promedios. |
| **RF26** | El sistema debe proporcionar un módulo de Notas que permita visualizar todas las calificaciones de un estudiante, incluyendo promedios por tipo y categoría de licencia. | F | **Revisión de Código**: Verificar `grades/page.tsx` y `grades/[id]/page.tsx`. **Prueba de Integración**: Test que verifique visualización completa de notas. | **Prueba de Aceptación**: Usuario accede al módulo de Notas y verifica información completa. **Demostración**: Mostrar módulo de Notas funcionando. |
| **RF27** | El sistema debe mostrar la categoría de licencia del estudiante de forma destacada en el módulo de Notas. | F | **Revisión de Código**: Verificar visualización de categoría en `grades/[id]/page.tsx`. **Prueba de Unidad**: Test que verifique presencia de categoría en la interfaz. | **Prueba de Aceptación**: Usuario visualiza notas y verifica que la categoría se muestra destacada. **Demostración**: Mostrar categoría de licencia en notas. |
| **RNF01** | El sistema debe tener un tiempo de respuesta inferior a 2 segundos para operaciones de lectura (listados, búsquedas). | NF | **Prueba de Rendimiento**: Medir tiempo de respuesta de APIs con herramientas como Lighthouse o Postman. **Monitoreo**: Implementar logging de tiempos de respuesta. | **Prueba de Aceptación**: Usuario realiza búsquedas y listados y verifica que la respuesta es rápida (< 2s). **Demostración**: Mostrar tiempos de respuesta en diferentes escenarios. |
| **RNF02** | El sistema debe mantener la integridad referencial de los datos, eliminando en cascada las clases cuando se elimina un estudiante. | NF | **Revisión de Código**: Verificar constraints de BD en `01_create_schema.sql`. **Prueba de Integración**: Test que elimine estudiante y verifique eliminación en cascada. | **Prueba de Aceptación**: Usuario elimina estudiante y verifica que sus clases también se eliminan. **Demostración**: Mostrar integridad referencial funcionando. |
| **RNF03** | El sistema debe ser accesible desde navegadores web modernos (Chrome, Firefox, Safari, Edge) con soporte responsive para dispositivos móviles. | NF | **Prueba de Compatibilidad**: Probar en diferentes navegadores y dispositivos. **Revisión de Código**: Verificar uso de componentes responsive (Tailwind CSS). | **Prueba de Aceptación**: Usuario accede desde diferentes navegadores y dispositivos móviles y verifica funcionalidad. **Demostración**: Mostrar sistema funcionando en diferentes plataformas. |
| **RNF04** | El sistema debe implementar Row Level Security (RLS) en la base de datos para restringir el acceso a datos según el rol del usuario autenticado. | NF | **Revisión de Código**: Verificar políticas RLS en `01_create_schema.sql`. **Prueba de Seguridad**: Intentar acceder a datos sin autenticación y verificar rechazo. | **Prueba de Aceptación**: Usuario sin autenticación intenta acceder a datos y verifica rechazo. **Demostración**: Mostrar políticas de seguridad activas. |
| **RNF05** | El sistema debe validar datos en el cliente y servidor para prevenir errores y mejorar la experiencia del usuario. | NF | **Revisión de Código**: Verificar validaciones en formularios (cliente) y APIs (servidor). **Prueba de Unidad**: Test que envíe datos inválidos y verifique rechazo en ambos niveles. | **Prueba de Aceptación**: Usuario ingresa datos inválidos y verifica mensajes de error claros. **Demostración**: Mostrar validaciones en acción. |
| **RNF06** | El sistema debe manejar errores de manera elegante, mostrando mensajes claros al usuario sin exponer detalles técnicos internos. | NF | **Revisión de Código**: Verificar manejo de errores en componentes y APIs. **Prueba de Unidad**: Test que genere errores y verifique mensajes apropiados. | **Prueba de Aceptación**: Usuario provoca errores y verifica mensajes claros y útiles. **Demostración**: Mostrar manejo de errores en diferentes escenarios. |
| **RNF07** | El sistema debe almacenar fechas de manera consistente (formato YYYY-MM-DD) para evitar problemas de zona horaria. | NF | **Revisión de Código**: Verificar manejo de fechas en `student-service.ts` y `class-service.ts`. **Prueba de Unidad**: Test que verifique formato consistente de fechas. | **Prueba de Aceptación**: Usuario crea registros con fechas y verifica que se almacenan correctamente sin cambios de día. **Demostración**: Mostrar consistencia de fechas. |
| **RNF08** | El sistema debe proporcionar feedback visual inmediato al usuario (loading states, mensajes de éxito/error) durante operaciones asíncronas. | NF | **Revisión de Código**: Verificar uso de estados de carga y mensajes en componentes. **Prueba de Unidad**: Test que verifique presencia de feedback visual. | **Prueba de Aceptación**: Usuario realiza operaciones y verifica feedback visual apropiado. **Demostración**: Mostrar diferentes estados de UI (loading, éxito, error). |

---

## 5. Resumen Ejecutivo

### 5.1 Total de Requisitos Identificados
- **Requisitos Funcionales**: 27
- **Requisitos No Funcionales**: 8
- **Total**: 35 requisitos

### 5.2 Cobertura de Funcionalidades
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

### 5.3 Métodos de Verificación Aplicados
- Revisión de Código
- Pruebas de Unidad
- Pruebas de Integración
- Pruebas de Rendimiento
- Pruebas de Compatibilidad
- Pruebas de Seguridad

### 5.4 Métodos de Validación Aplicados
- Pruebas de Aceptación
- Demostraciones al Cliente
- Verificación de Funcionalidad End-to-End

---

**Documento generado el**: 2025-12-05  
**Sistema**: Sistema de Gestión de Autoescuela Concordia  
**Versión del Análisis**: 2.0

### 5.5 Cambios desde la Versión 1.0

**Nuevas Funcionalidades Agregadas:**
- Sistema de estados automáticos de clases (agendado, por_calificar, cursado)
- Calificación de clases individuales con nota y observaciones
- Módulo de Notas para visualización completa de calificaciones
- Cálculo de promedios separados por tipo de clase (teóricas y prácticas)
- Validación de promedios >= 51 para habilitar examen final
- Visualización destacada de categoría de licencia en módulo de Notas
- Gestión de disponibilidad de instructores con horarios (hora_inicio, hora_fin)
- Validación de disponibilidad de instructores al agendar clases
- Logo de la autoescuela en la interfaz


