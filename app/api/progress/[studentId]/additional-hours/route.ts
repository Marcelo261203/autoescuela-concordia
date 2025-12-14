import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { updateStudentProgress } from "@/lib/services/progress-service"
import { getUserRole, getCurrentInstructorId } from "@/lib/services/auth-service"

/**
 * Actualiza las horas adicionales requeridas para un estudiante
 * Solo permite a instructores actualizar horas adicionales de sus propios estudiantes
 */
export async function PUT(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params
    const updates = await request.json()

    const supabase = await createClient()
    const userRole = await getUserRole()
    const instructorId = await getCurrentInstructorId()

    // Si es instructor, verificar que tenga acceso al estudiante
    if (userRole === "instructor" && instructorId) {
      // Verificar que el estudiante tenga clases con este instructor
      const { data: studentClasses, error: classesError } = await supabase
        .from("classes")
        .select("id")
        .eq("estudiante_id", studentId)
        .eq("instructor_id", instructorId)
        .limit(1)

      if (classesError) throw new Error(classesError.message)

      if (!studentClasses || studentClasses.length === 0) {
        return NextResponse.json(
          { error: "No tienes acceso a este estudiante" },
          { status: 403 },
        )
      }
    }

    // Obtener progreso actual
    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select("*")
      .eq("estudiante_id", studentId)
      .single()

    if (progressError) throw new Error(progressError.message)
    if (!progress) {
      return NextResponse.json(
        { error: "No se encontró progreso para este estudiante" },
        { status: 404 },
      )
    }

    // Validar que el estudiante no esté graduado
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("estado")
      .eq("id", studentId)
      .single()

    if (studentError) throw new Error(studentError.message)

    if (student?.estado === "graduado") {
      return NextResponse.json(
        { error: "No se pueden modificar horas adicionales de estudiantes graduados" },
        { status: 400 },
      )
    }

    // Validar que el examen final no esté calificado
    if (progress.nota_final !== null && progress.nota_final !== undefined) {
      return NextResponse.json(
        { error: "No se pueden modificar horas adicionales una vez que el examen final ha sido calificado" },
        { status: 400 },
      )
    }

    // Actualizar horas adicionales (penalización)
    // Los valores vienen en minutos desde el frontend (ya convertidos de horas a minutos)
    // Ejemplo: usuario ingresa 1 hora -> frontend convierte a 60 minutos -> backend recibe 60 minutos
    // Si se envía un valor, usarlo directamente; si no, mantener el valor actual
    const horasPenalizacionPracticas = updates.horas_penalizacion_practicas !== undefined && updates.horas_penalizacion_practicas !== null
      ? Math.round(Number(updates.horas_penalizacion_practicas))
      : progress.horas_penalizacion_practicas || 0

    const horasPenalizacionTeoricas = updates.horas_penalizacion_teoricas !== undefined && updates.horas_penalizacion_teoricas !== null
      ? Math.round(Number(updates.horas_penalizacion_teoricas))
      : progress.horas_penalizacion_teoricas || 0

    const { data, error } = await supabase
      .from("student_progress")
      .update({
        horas_penalizacion_practicas: horasPenalizacionPracticas,
        horas_penalizacion_teoricas: horasPenalizacionTeoricas,
        actualizado_en: new Date().toISOString(),
      })
      .eq("estudiante_id", studentId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Recalcular progreso después de actualizar horas adicionales
    await updateStudentProgress(studentId)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando horas adicionales" },
      { status: 500 },
    )
  }
}

