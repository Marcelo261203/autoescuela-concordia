import { getInstructorById, updateInstructor, deleteInstructor } from "@/lib/services/instructor-service"
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
    const updates = await request.json()
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
