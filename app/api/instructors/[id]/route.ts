import {
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  createInstructorAuthUser,
  updateInstructorPassword,
} from "@/lib/services/instructor-service"
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
