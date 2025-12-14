import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateStudentProgress } from "@/lib/services/progress-service"

export async function POST(request: Request) {
  try {
    const { 
      estudiante_id, 
      instructor_id, 
      horas_practicas_requeridas, 
      horas_teoricas_requeridas,
      fecha_clase_inicial,
      hora_clase_inicial
    } = await request.json()

    // Validaciones
    if (!estudiante_id || !instructor_id) {
      return NextResponse.json({ error: "Estudiante e instructor son requeridos" }, { status: 400 })
    }

    if (horas_practicas_requeridas === undefined || horas_teoricas_requeridas === undefined) {
      return NextResponse.json({ error: "Las horas requeridas son obligatorias" }, { status: 400 })
    }

    if (!fecha_clase_inicial || !hora_clase_inicial) {
      return NextResponse.json({ error: "La fecha y hora de la clase inicial son requeridas" }, { status: 400 })
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verificar que el estudiante existe y no está graduado
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, nombre, apellido, estado")
      .eq("id", estudiante_id)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Validar que el estudiante esté en estado "activo" para poder matricular
    if (student.estado !== "activo") {
      return NextResponse.json(
        { error: `Solo se pueden matricular estudiantes con estado "Activo". El estudiante ${student.nombre} ${student.apellido} tiene estado "${student.estado}".` },
        { status: 400 },
      )
    }

    // Verificar que el instructor existe y está activo
    const { data: instructor, error: instructorError } = await supabase
      .from("instructors")
      .select("id, nombre, apellido, estado")
      .eq("id", instructor_id)
      .single()

    if (instructorError || !instructor) {
      return NextResponse.json({ error: "Instructor no encontrado" }, { status: 404 })
    }

    if (instructor.estado !== "activo") {
      return NextResponse.json({ error: "El instructor seleccionado no está activo" }, { status: 400 })
    }

    // Crear o actualizar el registro de progreso con los requisitos configurados
    const { data: existingProgress } = await adminClient
      .from("student_progress")
      .select("id")
      .eq("estudiante_id", estudiante_id)
      .single()

    const progressData = {
      estudiante_id,
      clases_practicas_requeridas: horas_practicas_requeridas, // Mantener compatibilidad
      clases_teoricas_requeridas: horas_teoricas_requeridas, // Mantener compatibilidad
      horas_practicas_requeridas: horas_practicas_requeridas,
      horas_teoricas_requeridas: horas_teoricas_requeridas,
      clases_practicas_realizadas: 0,
      clases_teoricas_realizadas: 0,
      porcentaje_avance: 0,
      actualizado_en: new Date().toISOString(),
    }

    if (existingProgress) {
      // Actualizar progreso existente
      const { error: updateError } = await adminClient
        .from("student_progress")
        .update(progressData)
        .eq("id", existingProgress.id)

      if (updateError) {
        return NextResponse.json({ error: `Error al actualizar progreso: ${updateError.message}` }, { status: 500 })
      }
    } else {
      // Crear nuevo progreso
      const { error: insertError } = await adminClient.from("student_progress").insert(progressData)

      if (insertError) {
        return NextResponse.json({ error: `Error al crear progreso: ${insertError.message}` }, { status: 500 })
      }
    }

    // Crear una clase inicial para que el estudiante aparezca en el panel del instructor
    // Esta clase será de tipo "teorica" y con fecha/hora seleccionada por el admin
    const claseInicial = {
      estudiante_id,
      instructor_id,
      tipo: "teorica",
      fecha: fecha_clase_inicial,
      hora: hora_clase_inicial,
      duracion_minutos: 60,
      observaciones: "Clase introductoria",
      estado: "agendado",
    }

    const { error: classError } = await adminClient.from("classes").insert(claseInicial)

    if (classError) {
      // Si falla la creación de la clase, no es crítico, pero lo registramos
      console.error("Error al crear clase inicial:", classError)
      // Continuamos de todas formas
    }

    // Actualizar estado del estudiante a "en_curso" si está "activo"
    if (student.estado === "activo") {
      const { error: updateStudentError } = await adminClient
        .from("students")
        .update({ estado: "en_curso" })
        .eq("id", estudiante_id)

      if (updateStudentError) {
        console.error("Error al actualizar estado del estudiante:", updateStudentError)
        // No es crítico, continuamos
      }
    }

    // Recalcular progreso
    await updateStudentProgress(estudiante_id)

    return NextResponse.json({
      success: true,
      message: `Estudiante ${student.nombre} ${student.apellido} matriculado exitosamente. Asignado al instructor ${instructor.nombre} ${instructor.apellido}.`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al matricular el estudiante" },
      { status: 500 },
    )
  }
}

