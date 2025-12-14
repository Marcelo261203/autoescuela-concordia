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

    // Obtener los estudiantes del instructor
    // Incluir todos los estudiantes que tienen clases con el instructor, incluso si completaron todas sus clases
    // Esto permite que el instructor pueda calificar el examen final
    const students = await getStudentsByInstructor(instructorId, false)

    return NextResponse.json({ data: students })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo estudiantes" },
      { status: 500 },
    )
  }
}

