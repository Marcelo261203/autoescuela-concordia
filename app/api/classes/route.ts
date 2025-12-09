import { getClasses, createClass } from "@/lib/services/class-service"
import { updateStudentProgress } from "@/lib/services/progress-service"
import { getUserRole, getCurrentInstructorId } from "@/lib/services/auth-service"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const estudiante_id = searchParams.get("estudiante_id") || undefined
    const instructor_id = searchParams.get("instructor_id") || undefined
    const tipo = searchParams.get("tipo") || undefined
    const fechaInicio = searchParams.get("fechaInicio") || undefined
    const fechaFin = searchParams.get("fechaFin") || undefined

    const result = await getClasses(page, limit, {
      estudiante_id,
      instructor_id,
      tipo,
      fechaInicio,
      fechaFin,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo clases" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const clase = await request.json()
    const userRole = await getUserRole()

    // Validar que el estudiante no esté graduado
    const supabase = await createClient()
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("estado, nombre, apellido")
      .eq("id", clase.estudiante_id)
      .single()

    if (studentError) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    if (student.estado === "graduado") {
      return NextResponse.json(
        { error: `No se pueden agendar clases para estudiantes graduados. El estudiante ${student.nombre} ${student.apellido} ya está graduado.` },
        { status: 400 },
      )
    }

    // Si es instructor, validar que solo pueda crear clases para él mismo
    if (userRole === "instructor") {
      const instructorId = await getCurrentInstructorId()
      if (!instructorId) {
        return NextResponse.json({ error: "No se encontró el instructor" }, { status: 403 })
      }

      // Verificar que el instructor_id de la clase sea el del instructor actual
      if (clase.instructor_id !== instructorId) {
        return NextResponse.json(
          { error: "No puedes crear clases para otros instructores" },
          { status: 403 },
        )
      }

      // Permitir crear la clase para cualquier estudiante
      // (la política RLS validará que el instructor_id sea correcto)
    }

    const newClass = await createClass(clase)

    // Actualizar progreso del estudiante
    await updateStudentProgress(clase.estudiante_id)

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error creando clase" }, { status: 500 })
  }
}
