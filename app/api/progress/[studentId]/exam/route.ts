import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { updateStudentProgress } from "@/lib/services/progress-service"
import { getUserRole, getCurrentInstructorId } from "@/lib/services/auth-service"

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

    // Obtener progreso actual para validaciones
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

    // Validar que el examen no haya sido calificado previamente (solo si se está intentando cambiar)
    if (progress.nota_final !== null && progress.nota_final !== undefined && updates.nota_final !== null) {
      return NextResponse.json(
        { error: "El examen ya fue calificado y no se puede modificar" },
        { status: 400 },
      )
    }

    // Validar requisitos antes de permitir calificar (solo si es la primera vez)
    if (progress.nota_final === null || progress.nota_final === undefined) {
      // 1. Verificar horas completadas
      const horasPracticasRequeridasBase =
        progress.horas_practicas_requeridas ?? progress.clases_practicas_requeridas ?? 720
      const horasTeoricasRequeridasBase =
        progress.horas_teoricas_requeridas ?? progress.clases_teoricas_requeridas ?? 600

      const horasPenalizacionPracticas = progress.horas_penalizacion_practicas || 0
      const horasPenalizacionTeoricas = progress.horas_penalizacion_teoricas || 0

      const horasPracticasRequeridas = horasPracticasRequeridasBase + horasPenalizacionPracticas
      const horasTeoricasRequeridas = horasTeoricasRequeridasBase + horasPenalizacionTeoricas

      const horasPracticasCompletadas = progress.clases_practicas_realizadas >= horasPracticasRequeridas
      const horasTeoricasCompletadas = progress.clases_teoricas_realizadas >= horasTeoricasRequeridas

      if (!horasPracticasCompletadas || !horasTeoricasCompletadas) {
        return NextResponse.json(
          { error: "El estudiante debe completar todas sus horas requeridas antes de calificar el examen" },
          { status: 400 },
        )
      }

      // 2. Verificar promedios (>= 51)
      // Obtener clases calificadas del estudiante
      const { data: gradedClasses, error: classesError } = await supabase
        .from("classes")
        .select("tipo, nota")
        .eq("estudiante_id", studentId)
        .eq("estado", "cursado")
        .not("nota", "is", null)

      if (classesError) throw new Error(classesError.message)

      const clasesTeoricas = gradedClasses?.filter((c) => c.tipo === "teorica") || []
      const clasesPracticas = gradedClasses?.filter((c) => c.tipo === "practica") || []

      const promedioTeoricas =
        clasesTeoricas.length > 0
          ? clasesTeoricas.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesTeoricas.length
          : 0
      const promedioPracticas =
        clasesPracticas.length > 0
          ? clasesPracticas.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesPracticas.length
          : 0

      if (clasesTeoricas.length === 0 || promedioTeoricas < 51) {
        return NextResponse.json(
          { error: `El estudiante debe tener un promedio >= 51 en clases teóricas. Actual: ${promedioTeoricas.toFixed(1)}` },
          { status: 400 },
        )
      }

      if (clasesPracticas.length === 0 || promedioPracticas < 51) {
        return NextResponse.json(
          { error: `El estudiante debe tener un promedio >= 51 en clases prácticas. Actual: ${promedioPracticas.toFixed(1)}` },
          { status: 400 },
        )
      }
    }

    // Actualizar campos de examen en student_progress
    const { data, error } = await supabase
      .from("student_progress")
      .update({
        nota_final: updates.nota_final,
        aprobado: updates.aprobado,
        reintentos: updates.reintentos,
        horas_penalizacion_practicas: updates.horas_penalizacion_practicas || 0,
        horas_penalizacion_teoricas: updates.horas_penalizacion_teoricas || 0,
        actualizado_en: new Date().toISOString(),
      })
      .eq("estudiante_id", studentId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Recalcular progreso después de actualizar examen
    await updateStudentProgress(studentId)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando examen" },
      { status: 500 },
    )
  }
}











