# 📊 Diagramas UML - Sistema de Gestión de Autoescuela

Este documento proporciona toda la información necesaria para crear los diagramas UML del sistema: **Clases**, **Secuencia**, **Actividades** y **Despliegue**.

---

## 📋 ÍNDICE

1. [Diagrama de Clases](#1-diagrama-de-clases)
2. [Diagrama de Secuencia](#2-diagrama-de-secuencia)
3. [Diagrama de Actividades](#3-diagrama-de-actividades)
4. [Diagrama de Despliegue](#4-diagrama-de-despliegue)

---

## 1. DIAGRAMA DE CLASES

### 1.1 Clases Principales del Sistema

#### **Clase: Student (Estudiante)**

**Atributos:**
- `id: string` (PK)
- `ci: string` (único)
- `nombre: string`
- `apellido: string`
- `email: string` (único)
- `telefono: string`
- `direccion: string`
- `fecha_nacimiento: string`
- `estado: enum` (activo, en_curso, graduado, inactivo)
- `fecha_inscripcion: string`
- `categoria_licencia_deseada: enum` (M, P, A, B, C, null)
- `created_at: string`
- `updated_at: string`

**Relaciones:**
- `1..*` → `Class` (un estudiante tiene muchas clases)
- `1` → `StudentProgress` (un estudiante tiene un registro de progreso)

---

#### **Clase: Instructor (Instructor)**

**Atributos:**
- `id: string` (PK)
- `nombre: string`
- `apellido: string`
- `email: string` (único)
- `telefono: string`
- `especialidad: string`
- `hora_inicio: string` (formato HH:MM, nullable)
- `hora_fin: string` (formato HH:MM, nullable)
- `tipos_licencias: string` (formato: "P,A,B,C", nullable)
- `auth_user_id: string` (FK a auth.users, nullable)
- `estado: enum` (activo, inactivo)
- `created_at: string`
- `updated_at: string`

**Relaciones:**
- `1..*` → `Class` (un instructor tiene muchas clases)
- `1` → `AuthUser` (un instructor puede estar vinculado a un usuario de autenticación)

---

#### **Clase: Class (Clase)**

**Atributos:**
- `id: string` (PK)
- `estudiante_id: string` (FK a Student)
- `instructor_id: string` (FK a Instructor)
- `tipo: enum` (practica, teorica)
- `categoria_licencia: enum` (M, P, A, B, C, null)
- `fecha: string` (formato YYYY-MM-DD)
- `hora: string` (formato HH:MM)
- `duracion_minutos: number`
- `observaciones: string`
- `estado: enum` (agendado, por_calificar, cursado, suspendida)
- `nota: number` (0-100, nullable)
- `created_at: string`
- `updated_at: string`

**Relaciones:**
- `*` → `Student` (muchas clases pertenecen a un estudiante)
- `*` → `Instructor` (muchas clases pertenecen a un instructor)

---

#### **Clase: StudentProgress (Progreso del Estudiante)**

**Atributos:**
- `id: string` (PK)
- `estudiante_id: string` (FK a Student, único)
- `clases_practicas_realizadas: number` (en minutos)
- `clases_teoricas_realizadas: number` (en minutos)
- `clases_practicas_requeridas: number` (en minutos, legacy)
- `clases_teoricas_requeridas: number` (en minutos, legacy)
- `horas_practicas_requeridas: number` (en minutos, nullable)
- `horas_teoricas_requeridas: number` (en minutos, nullable)
- `duracion_estandar_minutos: number` (nullable)
- `nota_final: number` (0-100, nullable)
- `aprobado: boolean` (nullable: null=pendiente, true=aprobado, false=reprobado)
- `reintentos: number` (default: 0)
- `horas_penalizacion_practicas: number` (en minutos, default: 0)
- `horas_penalizacion_teoricas: number` (en minutos, default: 0)
- `porcentaje_avance: number` (0-100)
- `actualizado_en: string`

**Relaciones:**
- `1` → `Student` (un progreso pertenece a un estudiante)

---

#### **Clase: AuthUser (Usuario de Autenticación - Supabase Auth)**

**Atributos:**
- `id: string` (PK, UUID)
- `email: string` (único)
- `encrypted_password: string`
- `email_confirmed_at: timestamp` (nullable)
- `created_at: timestamp`
- `updated_at: timestamp`

**Relaciones:**
- `0..1` → `Instructor` (un usuario puede estar vinculado a un instructor)

---

### 1.2 Clases de Servicio (Lógica de Negocio)

#### **Clase: StudentService**

**Métodos:**
- `+getStudents(page: number, limit: number, search?: string, estado?: string): Promise<PaginatedResult<Student>>`
- `+getStudentById(id: string): Promise<Student>`
- `+checkStudentExists(ci: string, email: string, excludeId?: string): Promise<boolean>`
- `+createStudent(student: StudentInput): Promise<Student>`
- `+updateStudent(id: string, updates: Partial<Student>): Promise<Student>`
- `+deleteStudent(id: string): Promise<void>`
- `+checkStudentHasClasses(studentId: string): Promise<boolean>`
- `+getStudentsByInstructor(instructorId: string, excludeGraduated?: boolean): Promise<Student[]>`

**Relaciones:**
- Usa `SupabaseClient` para acceso a datos
- Manipula `Student` y `Class`

---

#### **Clase: InstructorService**

**Métodos:**
- `+getInstructors(page: number, limit: number, estado?: string): Promise<PaginatedResult<Instructor>>`
- `+getInstructorById(id: string): Promise<Instructor>`
- `+getInstructorByAuthUserId(authUserId: string): Promise<Instructor | null>`
- `+createInstructor(instructor: InstructorInput): Promise<Instructor>`
- `+updateInstructor(id: string, updates: Partial<Instructor>): Promise<Instructor>`
- `+deleteInstructor(id: string): Promise<void>`
- `+checkInstructorHasClasses(instructorId: string): Promise<boolean>`
- `+getInstructorClassesCount(instructorId: string): Promise<number>`
- `+createInstructorAuthUser(email: string, password: string): Promise<string>`
- `+instructorHasAuthUser(instructorId: string): Promise<boolean>`
- `+updateInstructorPassword(authUserId: string, newPassword: string): Promise<void>`

**Relaciones:**
- Usa `SupabaseClient` y `SupabaseAdminClient`
- Manipula `Instructor` y `AuthUser`

---

#### **Clase: ClassService**

**Métodos:**
- `+getClasses(page: number, limit: number, filters?: ClassFilters): Promise<PaginatedResult<ClassWithDetails>>`
- `+getClassesByStudent(studentId: string): Promise<ClassWithDetails[]>`
- `+createClass(clase: ClassInput): Promise<ClassWithDetails>`
- `+updateClass(id: string, updates: Partial<Class>): Promise<Class>`
- `+deleteClass(id: string): Promise<void>`
- `+checkClassConflict(fecha: string, hora: string, duracion_minutos: number, estudiante_id?: string, instructor_id?: string, excludeId?: string): Promise<ConflictResult>`
- `+checkHoursExceeded(estudiante_id: string, tipo: string, duracion_minutos: number, excludeClassId?: string): Promise<HoursExceededResult>`
- `+checkInstructorAvailability(instructor_id: string, hora: string, duracion_minutos: number): Promise<AvailabilityResult>`
- `-updateClassStatuses(): Promise<void>` (privado, actualiza estados automáticamente)

**Relaciones:**
- Usa `SupabaseClient` y `SupabaseAdminClient`
- Manipula `Class`, `Student`, `Instructor`, `StudentProgress`

---

#### **Clase: ProgressService**

**Métodos:**
- `+getStudentProgress(studentId: string): Promise<StudentProgress | null>`
- `+updateStudentProgress(studentId: string): Promise<StudentProgress>`
- `+getStudentProgressReport(studentId: string): Promise<ProgressReport>`

**Relaciones:**
- Usa `SupabaseClient` y `SupabaseAdminClient`
- Manipula `StudentProgress`, `Class`, `Student`

---

#### **Clase: AuthService**

**Métodos:**
- `+getUserRole(): Promise<UserRole>` (admin | instructor | null)
- `+getCurrentInstructorId(): Promise<string | null>`

**Relaciones:**
- Usa `SupabaseClient`
- Usa `InstructorService`

---

#### **Clase: ReportService**

**Métodos:**
- `+getDashboardSummary(): Promise<DashboardSummary>`
- `+getInstructorDashboardSummary(instructorId: string): Promise<InstructorDashboardSummary>`
- `+getActiveStudentsReport(): Promise<Student[]>`
- `+getStudentsByStateReport(): Promise<Record<string, number>>`
- `+getClassesReport(filters?: ReportFilters): Promise<ClassWithDetails[]>`

**Relaciones:**
- Usa `SupabaseClient` y `SupabaseAdminClient`
- Manipula `Student`, `Class`, `StudentProgress`

---

### 1.3 Clases de Componentes Frontend

#### **Clase: StudentList (Componente React)**

**Atributos:**
- `students: Student[]`
- `isLoading: boolean`
- `searchTerm: string`
- `selectedEstado: string`
- `currentPage: number`

**Métodos:**
- `+handleSearch(term: string): void`
- `+handleFilter(estado: string): void`
- `+handlePageChange(page: number): void`
- `+handleDelete(id: string): void`

**Relaciones:**
- Usa `StudentService` (a través de API routes)

---

#### **Clase: StudentForm (Componente React)**

**Atributos:**
- `formData: StudentInput`
- `errors: ValidationErrors`
- `isSubmitting: boolean`

**Métodos:**
- `+handleSubmit(data: StudentInput): Promise<void>`
- `+handleChange(field: string, value: any): void`
- `+validate(): boolean`

**Relaciones:**
- Usa `StudentService` (a través de API routes)

---

#### **Clase: ClassForm (Componente React)**

**Atributos:**
- `formData: ClassInput`
- `availableStudents: Student[]`
- `availableInstructors: Instructor[]`
- `conflictError: string | null`

**Métodos:**
- `+handleSubmit(data: ClassInput): Promise<void>`
- `+checkConflict(): Promise<void>`
- `+validateAvailability(): Promise<void>`

**Relaciones:**
- Usa `ClassService` (a través de API routes)
- Usa `StudentService` y `InstructorService`

---

#### **Clase: StudentProgressCard (Componente React)**

**Atributos:**
- `studentId: string`
- `progress: StudentProgress | null`
- `isLoading: boolean`

**Métodos:**
- `+loadProgress(): Promise<void>`
- `+formatHours(minutes: number): string`

**Relaciones:**
- Usa `ProgressService` (a través de API routes)

---

### 1.4 Clases de Utilidades

#### **Clase: FormatHours (Utilidad)**

**Métodos estáticos:**
- `+formatMinutesToHours(minutes: number): string` (convierte minutos a "Xh Ymin")

---

#### **Clase: SupabaseClient (Cliente de Base de Datos)**

**Métodos:**
- `+from(table: string): QueryBuilder`
- `+auth.getUser(): Promise<UserResponse>`
- `+auth.signInWithPassword(credentials: Credentials): Promise<AuthResponse>`
- `+auth.signOut(): Promise<void>`

**Relaciones:**
- Se conecta a `SupabaseDatabase`

---

#### **Clase: SupabaseAdminClient (Cliente Admin de Base de Datos)**

**Métodos:**
- `+from(table: string): QueryBuilder` (bypass RLS)
- `+auth.admin.createUser(userData: CreateUserData): Promise<AdminUserResponse>`
- `+auth.admin.updateUserById(id: string, updates: UpdateUserData): Promise<AdminUserResponse>`

**Relaciones:**
- Se conecta a `SupabaseDatabase` (con permisos elevados)

---

### 1.5 Diagrama de Clases Completo - Relaciones

```
┌─────────────────┐
│   AuthUser      │
│  (Supabase)     │
└────────┬────────┘
         │ 0..1
         │
         │
┌────────▼────────┐        1..*      ┌──────────────┐
│   Instructor    │◄─────────────────│    Class     │
└─────────────────┘                  └──────┬───────┘
         │ 1..*                             │
         │                                  │
         │                                  │
┌────────▼────────┐        1..*             │
│    Student     │◄────────────────────────┘
└────────┬───────┘
         │ 1
         │
         │
┌────────▼────────┐
│StudentProgress  │
└─────────────────┘

┌─────────────────┐
│ StudentService  │───────► usa ────────┐
└─────────────────┘                     │
                                        │
┌─────────────────┐                     │
│InstructorService│───────► usa ────────┼──► SupabaseClient
└─────────────────┘                     │
                                        │
┌─────────────────┐                     │
│  ClassService   │───────► usa ────────┘
└─────────────────┘
         │
         │ también usa
         │
┌────────▼────────┐
│SupabaseAdminClient
└─────────────────┘
```

---

## 2. DIAGRAMA DE SECUENCIA

### 2.1 Secuencia: Login de Usuario

**Actores:** Usuario, Frontend, API Route, AuthService, Supabase Auth, InstructorService, Middleware

```
Usuario -> Frontend: Ingresa email y password
Frontend -> API Route (/api/auth/login): POST {email, password}
API Route -> Supabase Auth: signInWithPassword(email, password)
Supabase Auth --> API Route: {user, session}
API Route -> InstructorService: getInstructorByAuthUserId(user.id)
InstructorService -> Supabase: SELECT * FROM instructors WHERE auth_user_id = ?
Supabase --> InstructorService: Instructor | null
InstructorService --> API Route: Instructor | null

alt Si es instructor y está inactivo
    API Route -> Supabase Auth: signOut()
    API Route --> Frontend: 403 Error "Cuenta inactiva"
else Si es instructor activo o admin
    API Route --> Frontend: {user, session}
    Frontend -> Middleware: Redirige a /dashboard
    Middleware -> Supabase Auth: getUser()
    Supabase Auth --> Middleware: user
    Middleware -> InstructorService: getInstructorByAuthUserId(user.id)
    InstructorService --> Middleware: Instructor | null
    alt Si es instructor
        Middleware --> Frontend: Redirige a /dashboard/instructor
    else Si es admin
        Middleware --> Frontend: Redirige a /dashboard
    end
end
```

---

### 2.2 Secuencia: Crear Clase (con Validaciones)

**Actores:** Instructor/Admin, Frontend, API Route, ClassService, StudentService, ProgressService, Supabase

```
Instructor -> Frontend: Completa formulario de clase
Frontend -> API Route (/api/classes): POST {estudiante_id, instructor_id, fecha, hora, tipo, duracion_minutos}
API Route -> ClassService: createClass(claseData)
ClassService -> ClassService: checkClassConflict(fecha, hora, duracion_minutos, estudiante_id, instructor_id)
ClassService -> Supabase: SELECT * FROM classes WHERE fecha = ? AND (estudiante_id = ? OR instructor_id = ?)
Supabase --> ClassService: existingClasses[]
ClassService -> ClassService: Verifica superposiciones de horario
alt Si hay conflicto
    ClassService --> API Route: Error "Conflicto de horario"
    API Route --> Frontend: 400 Error
else Si no hay conflicto
    ClassService -> ClassService: checkInstructorAvailability(instructor_id, hora, duracion_minutos)
    ClassService -> Supabase: SELECT hora_inicio, hora_fin FROM instructors WHERE id = ?
    Supabase --> ClassService: {hora_inicio, hora_fin}
    ClassService -> ClassService: Verifica si hora está dentro del rango
    alt Si está fuera del horario
        ClassService --> API Route: Error "Fuera de horario disponible"
        API Route --> Frontend: 400 Error
    else Si está dentro del horario
        ClassService -> ClassService: checkHoursExceeded(estudiante_id, tipo, duracion_minutos)
        ClassService -> Supabase: SELECT * FROM student_progress WHERE estudiante_id = ?
        Supabase --> ClassService: progress
        ClassService -> Supabase: SELECT * FROM classes WHERE estudiante_id = ? AND tipo = ?
        Supabase --> ClassService: classes[]
        ClassService -> ClassService: Calcula horas actuales + nueva clase
        alt Si excede horas requeridas
            ClassService --> API Route: Error "Excede horas requeridas"
            API Route --> Frontend: 400 Error
        else Si no excede
            ClassService -> Supabase (Admin): INSERT INTO classes VALUES (...)
            Supabase --> ClassService: newClass
            ClassService -> ProgressService: updateStudentProgress(estudiante_id)
            ProgressService -> Supabase: SELECT * FROM classes WHERE estudiante_id = ?
            Supabase --> ProgressService: classes[]
            ProgressService -> ProgressService: Calcula horas realizadas
            ProgressService -> Supabase: UPSERT student_progress
            Supabase --> ProgressService: updatedProgress
            ProgressService --> ClassService: updatedProgress
            ClassService --> API Route: ClassWithDetails
            API Route --> Frontend: 201 Created {class}
            Frontend -> Frontend: Muestra mensaje de éxito y actualiza lista
        end
    end
end
```

---

### 2.3 Secuencia: Calificar Clase

**Actores:** Instructor, Frontend, API Route, ClassService, ProgressService, Supabase

```
Instructor -> Frontend: Ingresa nota y observaciones
Frontend -> API Route (/api/classes/[id]): PUT {nota, observaciones, estado: "cursado"}
API Route -> ClassService: updateClass(id, {nota, observaciones, estado: "cursado"})
ClassService -> Supabase: UPDATE classes SET nota = ?, observaciones = ?, estado = ? WHERE id = ?
Supabase --> ClassService: updatedClass
ClassService -> ProgressService: updateStudentProgress(estudiante_id)
ProgressService -> Supabase: SELECT * FROM classes WHERE estudiante_id = ? AND estado != 'suspendida'
Supabase --> ProgressService: classes[]
ProgressService -> ProgressService: Calcula horas realizadas (suma duracion_minutos)
ProgressService -> Supabase: SELECT * FROM student_progress WHERE estudiante_id = ?
Supabase --> ProgressService: currentProgress
ProgressService -> ProgressService: Calcula porcentaje de avance
ProgressService -> ProgressService: Calcula promedios de notas (teóricas y prácticas)
ProgressService -> Supabase: UPSERT student_progress SET clases_practicas_realizadas = ?, clases_teoricas_realizadas = ?, porcentaje_avance = ?
Supabase --> ProgressService: updatedProgress
ProgressService -> ProgressService: Verifica si puede graduar (100% horas + examen aprobado)
alt Si puede graduar
    ProgressService -> Supabase (Admin): UPDATE students SET estado = 'graduado' WHERE id = ?
    Supabase --> ProgressService: success
end
ProgressService --> ClassService: updatedProgress
ClassService --> API Route: updatedClass
API Route --> Frontend: 200 OK {class}
Frontend -> Frontend: Actualiza vista de clase y progreso del estudiante
```

---

### 2.4 Secuencia: Calificar Examen Final

**Actores:** Admin/Instructor, Frontend, API Route, ProgressService, StudentService, Supabase

```
Admin -> Frontend: Ingresa nota final y marca aprobado/reprobado
Frontend -> API Route (/api/progress/[studentId]/exam): PUT {nota_final, aprobado}
API Route -> ProgressService: getStudentProgress(studentId)
ProgressService -> Supabase: SELECT * FROM student_progress WHERE estudiante_id = ?
Supabase --> ProgressService: progress
ProgressService --> API Route: progress
API Route -> API Route: Verifica requisitos (100% horas, promedios >= 51)
alt Si no cumple requisitos
    API Route --> Frontend: 400 Error "No cumple requisitos"
else Si cumple requisitos
    API Route -> Supabase: UPDATE student_progress SET nota_final = ?, aprobado = ? WHERE estudiante_id = ?
    Supabase --> API Route: updatedProgress
    API Route -> ProgressService: updateStudentProgress(studentId)
    ProgressService -> Supabase: SELECT * FROM classes WHERE estudiante_id = ?
    Supabase --> ProgressService: classes[]
    ProgressService -> ProgressService: Calcula progreso actualizado
    ProgressService -> ProgressService: Verifica si puede graduar (100% + examen aprobado)
    alt Si puede graduar
        ProgressService -> Supabase (Admin): UPDATE students SET estado = 'graduado' WHERE id = ?
        Supabase --> ProgressService: success
    end
    ProgressService --> API Route: updatedProgress
    API Route --> Frontend: 200 OK {progress}
    Frontend -> Frontend: Actualiza vista de progreso y estado del estudiante
end
```

---

### 2.5 Secuencia: Agregar Horas de Penalización

**Actores:** Instructor, Frontend, API Route, ProgressService, Supabase

```
Instructor -> Frontend: Ingresa horas adicionales (formato: "1h 30min")
Frontend -> Frontend: Convierte a minutos (90)
Frontend -> API Route (/api/progress/[studentId]/additional-hours): PUT {horas_penalizacion_practicas, horas_penalizacion_teoricas}
API Route -> ProgressService: getStudentProgress(studentId)
ProgressService -> Supabase: SELECT * FROM student_progress WHERE estudiante_id = ?
Supabase --> ProgressService: progress
ProgressService --> API Route: progress
API Route -> API Route: Verifica si examen ya está calificado (nota_final !== null)
alt Si examen ya está calificado
    API Route --> Frontend: 400 Error "No se pueden editar horas después de calificar examen"
else Si examen no está calificado
    API Route -> Supabase: UPDATE student_progress SET horas_penalizacion_practicas = ?, horas_penalizacion_teoricas = ? WHERE estudiante_id = ?
    Supabase --> API Route: updatedProgress
    API Route -> ProgressService: updateStudentProgress(studentId)
    ProgressService -> Supabase: SELECT * FROM classes WHERE estudiante_id = ?
    Supabase --> ProgressService: classes[]
    ProgressService -> ProgressService: Recalcula horas requeridas (base + penalización)
    ProgressService -> ProgressService: Recalcula porcentaje de avance
    ProgressService -> Supabase: UPSERT student_progress
    Supabase --> ProgressService: updatedProgress
    ProgressService --> API Route: updatedProgress
    API Route --> Frontend: 200 OK {progress}
    Frontend -> Frontend: Actualiza vista de progreso con nuevas horas requeridas
end
```

---

## 3. DIAGRAMA DE ACTIVIDADES

### 3.1 Actividad: Proceso de Login

```
[Inicio] → [Usuario ingresa email y password]
    ↓
[Frontend valida formato] → ¿Válido? → No → [Muestra error] → [Fin]
    ↓ Sí
[Envía POST a /api/auth/login]
    ↓
[Supabase Auth valida credenciales] → ¿Válidas? → No → [Muestra "Email o contraseña incorrectos"] → [Fin]
    ↓ Sí
[Obtiene usuario de auth.users]
    ↓
[Verifica si está vinculado a instructor]
    ↓
¿Es instructor? → No → [Rol = admin] → [Redirige a /dashboard] → [Fin]
    ↓ Sí
[Verifica estado del instructor]
    ↓
¿Estado = inactivo? → Sí → [Cierra sesión] → [Muestra "Cuenta inactiva"] → [Fin]
    ↓ No
[Rol = instructor] → [Redirige a /dashboard/instructor] → [Fin]
```

---

### 3.2 Actividad: Proceso de Crear Clase

```
[Inicio] → [Usuario completa formulario]
    ↓
[Frontend valida datos] → ¿Válidos? → No → [Muestra errores] → [Fin]
    ↓ Sí
[Envía POST a /api/classes]
    ↓
[Verifica autenticación] → ¿Autenticado? → No → [Error 401] → [Fin]
    ↓ Sí
[Verifica permisos] → ¿Tiene permisos? → No → [Error 403] → [Fin]
    ↓ Sí
[Verifica conflicto de horario]
    ↓
¿Hay conflicto? → Sí → [Muestra "Conflicto de horario"] → [Fin]
    ↓ No
[Verifica disponibilidad del instructor]
    ↓
¿Está dentro del horario? → No → [Muestra "Fuera de horario disponible"] → [Fin]
    ↓ Sí
[Verifica límite de horas requeridas]
    ↓
¿Excede horas? → Sí → [Muestra "Excede horas requeridas"] → [Fin]
    ↓ No
[Inserta clase en base de datos]
    ↓
[Actualiza progreso del estudiante]
    ↓
[Calcula horas realizadas]
    ↓
[Actualiza porcentaje de avance]
    ↓
[Verifica si estudiante tiene clases] → ¿Tiene clases? → No → [Fin]
    ↓ Sí
[Actualiza estado de estudiante a "en_curso"]
    ↓
[Muestra mensaje de éxito]
    ↓
[Actualiza lista de clases]
    ↓
[Fin]
```

---

### 3.3 Actividad: Proceso de Calificar Clase

```
[Inicio] → [Instructor ingresa nota y observaciones]
    ↓
[Frontend valida nota (0-100)] → ¿Válida? → No → [Muestra error] → [Fin]
    ↓ Sí
[Envía PUT a /api/classes/[id]]
    ↓
[Actualiza clase: nota, observaciones, estado = "cursado"]
    ↓
[Actualiza progreso del estudiante]
    ↓
[Obtiene todas las clases del estudiante (excluyendo suspendidas)]
    ↓
[Calcula horas realizadas por tipo (suma duracion_minutos)]
    ↓
[Obtiene requisitos del estudiante (base + penalización)]
    ↓
[Calcula porcentaje de avance]
    ↓
[Calcula promedios de notas (teóricas y prácticas)]
    ↓
[Actualiza student_progress]
    ↓
[Verifica si puede graduar]
    ↓
¿Completó 100% horas? → No → [Fin]
    ↓ Sí
¿Examen calificado? → No → [Fin]
    ↓ Sí
¿Examen aprobado? → No → [Fin]
    ↓ Sí
[Actualiza estado del estudiante a "graduado"]
    ↓
[Muestra mensaje de éxito]
    ↓
[Actualiza vista de progreso]
    ↓
[Fin]
```

---

### 3.4 Actividad: Proceso de Habilitar y Calificar Examen Final

```
[Inicio] → [Usuario accede a módulo de examen]
    ↓
[Verifica requisitos del estudiante]
    ↓
[Obtiene progreso del estudiante]
    ↓
¿Completó 100% horas prácticas? → No → [Muestra "Faltan horas prácticas"] → [Fin]
    ↓ Sí
¿Completó 100% horas teóricas? → No → [Muestra "Faltan horas teóricas"] → [Fin]
    ↓ Sí
[Calcula promedio de notas prácticas]
    ↓
¿Promedio prácticas >= 51? → No → [Muestra "Promedio práctico insuficiente"] → [Fin]
    ↓ Sí
[Calcula promedio de notas teóricas]
    ↓
¿Promedio teóricas >= 51? → No → [Muestra "Promedio teórico insuficiente"] → [Fin]
    ↓ Sí
[Habilita formulario de examen]
    ↓
[Usuario ingresa nota final y marca aprobado/reprobado]
    ↓
[Frontend valida nota (0-100)] → ¿Válida? → No → [Muestra error] → [Fin]
    ↓ Sí
[Envía PUT a /api/progress/[studentId]/exam]
    ↓
[Actualiza student_progress: nota_final, aprobado]
    ↓
[Recalcula progreso]
    ↓
¿Examen aprobado? → No → [Incrementa reintentos] → [Fin]
    ↓ Sí
[Verifica si puede graduar]
    ↓
¿Completó 100% horas? → No → [Fin]
    ↓ Sí
[Actualiza estado del estudiante a "graduado"]
    ↓
[Muestra mensaje "Estudiante graduado"]
    ↓
[Fin]
```

---

### 3.5 Actividad: Proceso de Agregar Horas de Penalización

```
[Inicio] → [Instructor accede a módulo de horas adicionales]
    ↓
[Verifica promedios del estudiante]
    ↓
¿Promedio prácticas < 51? → Sí → [Muestra formulario de horas prácticas]
    ↓
¿Promedio teóricas < 51? → Sí → [Muestra formulario de horas teóricas]
    ↓
[Instructor ingresa horas (formato: "1h 30min")]
    ↓
[Frontend convierte a minutos]
    ↓
[Envía PUT a /api/progress/[studentId]/additional-hours]
    ↓
[Obtiene progreso actual]
    ↓
¿Examen ya calificado? → Sí → [Muestra "No se pueden editar horas después de calificar examen"] → [Fin]
    ↓ No
[Actualiza horas_penalizacion_practicas y/o horas_penalizacion_teoricas]
    ↓
[Recalcula horas requeridas (base + penalización)]
    ↓
[Recalcula porcentaje de avance]
    ↓
[Actualiza student_progress]
    ↓
[Muestra mensaje de éxito]
    ↓
[Actualiza vista de progreso]
    ↓
[Fin]
```

---

## 4. DIAGRAMA DE DESPLIEGUE

### 4.1 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Navegador)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Frontend (Next.js + React)                    │  │
│  │                                                            │  │
│  │  - Páginas (app/dashboard/*)                             │  │
│  │  - Componentes React (components/*)                       │  │
│  │  - Hooks personalizados                                   │  │
│  │  - Utilidades (lib/utils/*)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ HTTPS                                │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    SERVIDOR (Next.js)                            │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Server (Node.js)                      │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         API Routes (app/api/*)                      │  │  │
│  │  │                                                      │  │  │
│  │  │  - /api/auth/* (login, logout, user, role)          │  │  │
│  │  │  - /api/students/* (CRUD estudiantes)               │  │  │
│  │  │  - /api/instructors/* (CRUD instructores)           │  │  │
│  │  │  - /api/classes/* (CRUD clases)                     │  │  │
│  │  │  - /api/progress/* (progreso y exámenes)            │  │  │
│  │  │  - /api/dashboard/* (estadísticas)                  │  │  │
│  │  │  - /api/reports/* (reportes)                        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                           │                                 │  │
│  │                           │                                 │  │
│  │  ┌────────────────────────▼─────────────────────────────┐  │  │
│  │  │         Servicios (lib/services/*)                    │  │  │
│  │  │                                                         │  │  │
│  │  │  - StudentService                                      │  │  │
│  │  │  - InstructorService                                  │  │  │
│  │  │  - ClassService                                        │  │  │
│  │  │  - ProgressService                                     │  │  │
│  │  │  - AuthService                                         │  │  │
│  │  │  - ReportService                                       │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  │                           │                                 │  │
│  │                           │                                 │  │
│  │  ┌────────────────────────▼─────────────────────────────┐  │  │
│  │  │    Clientes Supabase (lib/supabase/*)                 │  │  │
│  │  │                                                         │  │  │
│  │  │  - createClient() (con RLS)                           │  │  │
│  │  │  - createAdminClient() (sin RLS)                      │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  │                           │                                 │  │
│  │                           │                                 │  │
│  │  ┌────────────────────────▼─────────────────────────────┐  │  │
│  │  │         Middleware (middleware.ts)                    │  │  │
│  │  │                                                         │  │  │
│  │  │  - Autenticación                                      │  │  │
│  │  │  - Autorización por rol                               │  │  │
│  │  │  - Redirecciones                                      │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ HTTPS                                │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    SUPABASE (Cloud)                                │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase API                                  │  │
│  │                                                            │  │
│  │  - REST API                                               │  │
│  │  - Real-time Subscriptions                                │  │
│  │  - Row Level Security (RLS)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │         PostgreSQL Database                                │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Tablas:                                            │  │  │
│  │  │  - students                                         │  │  │
│  │  │  - instructors                                      │  │  │
│  │  │  - classes                                          │  │  │
│  │  │  - student_progress                                 │  │  │
│  │  │  - auth.users (Supabase Auth)                       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Políticas RLS:                                     │  │  │
│  │  │  - Instructores solo ven sus propios datos         │  │  │
│  │  │  - Admins tienen acceso completo                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Auth                                 │  │
│  │                                                            │  │
│  │  - Autenticación de usuarios                              │  │
│  │  - Gestión de sesiones                                    │  │
│  │  - Tokens JWT                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Componentes de Despliegue Detallados

#### **Nodo: Cliente (Browser)**
- **Tipo:** Navegador Web (Chrome, Firefox, Edge, Safari)
- **Componentes:**
  - Frontend Next.js (compilado y servido como estático)
  - JavaScript/TypeScript ejecutándose en el navegador
  - React Components renderizados
- **Comunicación:** HTTPS con servidor Next.js

---

#### **Nodo: Servidor Next.js**
- **Tipo:** Servidor de aplicaciones (Node.js)
- **Componentes:**
  - **Next.js Server:**
    - API Routes
    - Middleware
    - SSR (Server-Side Rendering)
  - **Servicios de Negocio:**
    - StudentService
    - InstructorService
    - ClassService
    - ProgressService
    - AuthService
    - ReportService
  - **Clientes de Base de Datos:**
    - SupabaseClient (con RLS)
    - SupabaseAdminClient (sin RLS)
- **Comunicación:** HTTPS con cliente, HTTPS con Supabase

---

#### **Nodo: Supabase Cloud**
- **Tipo:** Backend as a Service (BaaS)
- **Componentes:**
  - **Supabase API:**
    - REST API
    - Real-time Subscriptions
    - Row Level Security Engine
  - **PostgreSQL Database:**
    - Tablas: students, instructors, classes, student_progress
    - Índices en campos clave
    - Foreign Keys y Constraints
    - Políticas RLS
  - **Supabase Auth:**
    - Tabla auth.users
    - Gestión de sesiones
    - Tokens JWT
- **Comunicación:** HTTPS con servidor Next.js

---

### 4.3 Artefactos de Despliegue

#### **Artefacto: Frontend Build**
- **Ubicación:** Servidor de archivos estáticos
- **Contenido:**
  - HTML estático
  - JavaScript bundles
  - CSS compilado
  - Assets (imágenes, fuentes)

#### **Artefacto: API Routes**
- **Ubicación:** Servidor Next.js
- **Contenido:**
  - Código TypeScript compilado
  - Dependencias (node_modules)

#### **Artefacto: Base de Datos**
- **Ubicación:** Supabase Cloud (PostgreSQL)
- **Contenido:**
  - Esquema de base de datos
  - Datos de estudiantes, instructores, clases, progreso
  - Políticas RLS

---

### 4.4 Conexiones y Protocolos

1. **Cliente ↔ Servidor Next.js:**
   - Protocolo: HTTPS
   - Puerto: 443
   - Formato: JSON (API), HTML/JS/CSS (Frontend)

2. **Servidor Next.js ↔ Supabase:**
   - Protocolo: HTTPS
   - Puerto: 443
   - Formato: JSON (REST API)
   - Autenticación: API Keys (ANON_KEY, SERVICE_ROLE_KEY)

---

### 4.5 Variables de Entorno

#### **En Servidor (Next.js):**
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública anónima
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio (secreta)

#### **En Cliente (Browser):**
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública anónima

---

## 📝 NOTAS PARA CREAR LOS DIAGRAMAS

### Herramientas Recomendadas:
1. **Draw.io / diagrams.net** (gratis, online)
2. **Lucidchart** (pago, online)
3. **PlantUML** (gratis, código)
4. **Visual Paradigm** (pago, desktop)
5. **StarUML** (gratis/pago, desktop)

### Convenciones UML:
- **Clases:** Rectángulos con 3 secciones (nombre, atributos, métodos)
- **Relaciones:**
  - `1..*`: Uno a muchos
  - `1`: Uno a uno
  - `*`: Muchos
  - `0..1`: Cero o uno
- **Visibilidad:**
  - `+`: Público
  - `-`: Privado
  - `#`: Protegido
- **Secuencia:** Líneas de vida verticales, flechas horizontales
- **Actividades:** Rombos para decisiones, rectángulos para actividades
- **Despliegue:** Nodos (cajas 3D), artefactos (rectángulos con pestaña)

---

## ✅ CHECKLIST PARA COMPLETAR LOS DIAGRAMAS

### Diagrama de Clases:
- [ ] Todas las clases principales (Student, Instructor, Class, StudentProgress, AuthUser)
- [ ] Todas las clases de servicio (StudentService, InstructorService, ClassService, etc.)
- [ ] Componentes frontend principales
- [ ] Relaciones entre clases (asociaciones, composiciones, dependencias)
- [ ] Atributos y métodos principales
- [ ] Cardinalidades correctas

### Diagrama de Secuencia:
- [ ] Login de usuario
- [ ] Crear clase (con validaciones)
- [ ] Calificar clase
- [ ] Calificar examen final
- [ ] Agregar horas de penalización
- [ ] Actores correctos (Usuario, Frontend, API, Servicios, Supabase)
- [ ] Mensajes con nombres descriptivos
- [ ] Alternativas (alt) donde corresponda

### Diagrama de Actividades:
- [ ] Proceso de login
- [ ] Proceso de crear clase
- [ ] Proceso de calificar clase
- [ ] Proceso de habilitar y calificar examen
- [ ] Proceso de agregar horas de penalización
- [ ] Nodos de inicio y fin
- [ ] Decisiones (rombos) con condiciones claras
- [ ] Flujos de control correctos

### Diagrama de Despliegue:
- [ ] Nodo Cliente (Browser)
- [ ] Nodo Servidor (Vercel)
- [ ] Nodo Base de Datos (Supabase)
- [ ] Componentes dentro de cada nodo
- [ ] Conexiones entre nodos
- [ ] Protocolos de comunicación
- [ ] Artefactos de despliegue

---

**Versión del Documento:** 1.0  
**Fecha:** 2024  
**Autor:** Equipo de Desarrollo

