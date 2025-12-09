import { getCurrentInstructorId } from "@/lib/services/auth-service"
import { getStudentsByInstructor } from "@/lib/services/student-service"
import { NextResponse } from "next/server"

/**
 * Obtiene los estudiantes asignados al instructor actual
 * Solo funciona si el usuario está autenticado como instructor
 */
export async function GET(request: Request) {
  try {
    // Obtener el ID del instructor actual
    const instructorId = await getCurrentInstructorId()

    if (!instructorId) {
      return NextResponse.json(
        { error: "No se encontró un instructor asociado a este usuario" },
        { status: 403 },
      )
    }

    // Obtener los estudiantes del instructor (excluyendo graduados por defecto)
    // Si se necesita incluir graduados, se puede agregar un parámetro de query
    const { searchParams } = new URL(request.url)
    const includeGraduated = searchParams.get("includeGraduated") === "true"
    
    const students = await getStudentsByInstructor(instructorId, !includeGraduated)

    return NextResponse.json({ data: students })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo estudiantes" },
      { status: 500 },
    )
  }
}

