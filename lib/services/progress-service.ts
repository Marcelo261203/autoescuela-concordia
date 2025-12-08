import { createClient } from "@/lib/supabase/server"
import type { StudentProgress } from "@/lib/types"

export async function getStudentProgress(studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("student_progress").select("*").eq("estudiante_id", studentId).single()

  if (error && error.code !== "PGRST116") throw new Error(error.message)
  return data as StudentProgress | null
}

export async function updateStudentProgress(studentId: string) {
  const supabase = await createClient()

  // Obtener progreso actual para usar requisitos personalizados
  const { data: progressActual } = await supabase
    .from("student_progress")
    .select("*")
    .eq("estudiante_id", studentId)
    .single()

  // Obtener todas las clases con su duración
  const { data: classes, error: classError } = await supabase
    .from("classes")
    .select("tipo, duracion_minutos")
    .eq("estudiante_id", studentId)

  if (classError) throw new Error(classError.message)

  // Calcular horas totales por tipo (en minutos)
  const horasPracticas = classes
    ?.filter((c) => c.tipo === "practica")
    .reduce((total, c) => total + (c.duracion_minutos || 0), 0) || 0

  const horasTeoricas = classes
    ?.filter((c) => c.tipo === "teorica")
    .reduce((total, c) => total + (c.duracion_minutos || 0), 0) || 0

  // Usar requisitos personalizados si existen (NO usar defaults)
  const horasPracticasRequeridasBase =
    progressActual?.horas_practicas_requeridas ?? progressActual?.clases_practicas_requeridas ?? 0
  const horasTeoricasRequeridasBase =
    progressActual?.horas_teoricas_requeridas ?? progressActual?.clases_teoricas_requeridas ?? 0

  // Agregar penalización si existe
  const horasPenalizacionPracticas = progressActual?.horas_penalizacion_practicas || 0
  const horasPenalizacionTeoricas = progressActual?.horas_penalizacion_teoricas || 0

  // Requisitos totales = base + penalización
  const horasPracticasRequeridas = horasPracticasRequeridasBase + horasPenalizacionPracticas
  const horasTeoricasRequeridas = horasTeoricasRequeridasBase + horasPenalizacionTeoricas

  // Calcular porcentaje de avance basado en horas
  // Si no hay requisitos configurados, el porcentaje es 0
  const totalHorasRequeridas = horasPracticasRequeridas + horasTeoricasRequeridas
  const totalHorasRealizadas = horasPracticas + horasTeoricas
  const porcentajeAvance = totalHorasRequeridas > 0 
    ? Math.round((totalHorasRealizadas / totalHorasRequeridas) * 100)
    : 0

  // Guardar progreso actualizado
  const updateData: any = {
    estudiante_id: studentId,
    clases_practicas_realizadas: horasPracticas, // Almacena minutos
    clases_teoricas_realizadas: horasTeoricas, // Almacena minutos
    clases_practicas_requeridas: horasPracticasRequeridasBase, // Mantener compatibilidad
    clases_teoricas_requeridas: horasTeoricasRequeridasBase, // Mantener compatibilidad
    porcentaje_avance: porcentajeAvance,
    actualizado_en: new Date().toISOString(),
  }

  // NO establecer valores por defecto automáticamente
  // Los requisitos personalizados solo se establecen cuando el usuario los configura manualmente
  // Si ya existen, mantenerlos; si no existen, no establecer defaults

  const { data, error } = await supabase
    .from("student_progress")
    .upsert(updateData, { onConflict: "estudiante_id" })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Verificar si el estudiante completó todos los requisitos Y tiene examen aprobado
  // Solo verificar si hay requisitos configurados
  const completadoPracticas = horasPracticasRequeridas > 0 ? horasPracticas >= horasPracticasRequeridas : false
  const completadoTeoricas = horasTeoricasRequeridas > 0 ? horasTeoricas >= horasTeoricasRequeridas : false
  const examenAprobado = progressActual?.aprobado === true

  // Solo graduar si completó horas Y aprobó el examen (si ya se registró examen)
  // Y solo si hay requisitos configurados
  const puedeGraduar = horasPracticasRequeridas > 0 && horasTeoricasRequeridas > 0 && 
    completadoPracticas && completadoTeoricas && (examenAprobado || progressActual?.aprobado === null)

  if (puedeGraduar && progressActual?.aprobado !== false) {
    // Actualizar estado del estudiante a "graduado" automáticamente
    const { error: updateError } = await supabase
      .from("students")
      .update({ estado: "graduado" })
      .eq("id", studentId)
      .in("estado", ["activo", "en_curso"]) // Solo actualizar si está activo o en curso

    if (updateError) {
      console.error("Error actualizando estado del estudiante:", updateError)
      // No lanzamos error para no interrumpir el proceso de actualización de progreso
    }
  }

  return data as StudentProgress
}

export async function getStudentProgressReport(studentId: string) {
  const supabase = await createClient()

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single()

  if (studentError) throw new Error(studentError.message)

  const progress = await getStudentProgress(studentId)

  return {
    student,
    progress,
  }
}
