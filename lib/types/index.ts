// Estudiantes
export interface Student {
  id: string
  ci: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  estado: "activo" | "en_curso" | "graduado" | "inactivo"
  fecha_inscripcion: string
  categoria_licencia_deseada?: "M" | "P" | "A" | "B" | "C" | null
  created_at: string
  updated_at: string
}

// Instructores
export interface Instructor {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  especialidad: string
  disponibilidad?: string | null // Campo legacy, mantener por compatibilidad
  hora_inicio?: string | null // Hora de inicio del horario disponible (formato HH:MM)
  hora_fin?: string | null // Hora de fin del horario disponible (formato HH:MM)
  estado: "activo" | "inactivo"
  created_at: string
  updated_at: string
}

// Clases
export interface Class {
  id: string
  estudiante_id: string
  instructor_id: string
  tipo: "practica" | "teorica"
  categoria_licencia?: "M" | "P" | "A" | "B" | "C" | null
  fecha: string
  hora: string
  duracion_minutos: number
  observaciones: string
  estado?: "agendado" | "por_calificar" | "cursado"
  nota?: number | null
  created_at: string
  updated_at: string
}

// Avance del Estudiante
export interface StudentProgress {
  id: string
  estudiante_id: string
  clases_practicas_realizadas: number // Almacena minutos
  clases_teoricas_realizadas: number // Almacena minutos
  clases_practicas_requeridas: number // Almacena minutos (legacy, mantener compatibilidad)
  clases_teoricas_requeridas: number // Almacena minutos (legacy, mantener compatibilidad)
  horas_practicas_requeridas?: number // Requisitos personalizados en minutos
  horas_teoricas_requeridas?: number // Requisitos personalizados en minutos
  duracion_estandar_minutos?: number // Duración estándar de clases para este estudiante
  nota_final?: number | null // Nota del examen (0-100)
  aprobado?: boolean | null // NULL = pendiente, true = aprobado, false = reprobado
  reintentos?: number // Número de veces que ha reprobado
  horas_penalizacion_practicas?: number // Horas extra por reprobar (en minutos)
  horas_penalizacion_teoricas?: number // Horas extra por reprobar (en minutos)
  porcentaje_avance: number
  actualizado_en: string
}

// Vistas relacionadas
export interface StudentWithProgress extends Student {
  progress?: StudentProgress
}

export interface ClassWithDetails extends Class {
  estudiante?: Student
  instructor?: Instructor
}
