import {
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  createInstructorAuthUser,
  updateInstructorPassword,
} from "@/lib/services/instructor-service"
import { getStudentsByInstructor } from "@/lib/services/student-service"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const instructor = await getInstructorById(id)
    return NextResponse.json(instructor)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instructor no encontrado" },
      { status: 404 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const { password, ...updates } = data

    // Obtener el instructor actual para verificar si tiene auth_user_id
    const currentInstructor = await getInstructorById(id)

    // Validar que no se pueda cambiar el estado a "inactivo" si tiene estudiantes no graduados
    if (updates.estado === "inactivo") {
      const studentsNotGraduated = await getStudentsByInstructor(id, true)
      
      if (studentsNotGraduated.length > 0) {
        return NextResponse.json(
          { 
            error: `No se puede cambiar el estado del instructor a inactivo porque tiene ${studentsNotGraduated.length} estudiante${studentsNotGraduated.length > 1 ? "s" : ""} no graduado${studentsNotGraduated.length > 1 ? "s" : ""}. Por favor, asegúrese de que todos los estudiantes estén graduados antes de desactivar al instructor.` 
          },
          { status: 400 }
        )
      }
    }

    // Si se proporciona contraseña
    if (password) {
      if (currentInstructor.auth_user_id) {
        // Si ya tiene usuario, actualizar la contraseña
        try {
          await updateInstructorPassword(currentInstructor.auth_user_id, password)
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error al actualizar contraseña" },
            { status: 400 },
          )
        }
      } else {
        // Si no tiene usuario, crear uno nuevo
        try {
          const authUserId = await createInstructorAuthUser(currentInstructor.email, password)
          updates.auth_user_id = authUserId
        } catch (error) {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error al crear usuario de autenticación" },
            { status: 400 },
          )
        }
      }
    }

    // Actualizar el instructor
    const updated = await updateInstructor(id, updates)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando instructor" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteInstructor(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    // El error ya viene con el mensaje apropiado desde deleteInstructor
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error eliminando instructor" },
      { status: 500 },
    )
  }
}
