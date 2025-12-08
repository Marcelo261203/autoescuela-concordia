import { getStudentById, updateStudent, deleteStudent, checkStudentExists } from "@/lib/services/student-service"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const student = await getStudentById(id)
    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Estudiante no encontrado" },
      { status: 404 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()

    // Si se actualiza CI o email, verificar duplicados
    if (updates.ci || updates.email) {
      const exists = await checkStudentExists(updates.ci || "", updates.email || "", id)
      if (exists) {
        return NextResponse.json({ error: "Ya existe un estudiante con ese CI o email" }, { status: 400 })
      }
    }

    const updated = await updateStudent(id, updates)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando estudiante" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const force = searchParams.get("force") === "true"
    const { checkStudentHasClasses } = await import("@/lib/services/student-service")
    
    // Verificar si tiene clases asociadas (aunque se eliminarán en cascada, es bueno advertir)
    if (!force) {
      const hasClasses = await checkStudentHasClasses(id)
      if (hasClasses) {
        return NextResponse.json(
          {
            error:
              "Este estudiante tiene clases asociadas. Al eliminarlo, todas sus clases también se eliminarán automáticamente.",
            hasClasses: true,
          },
          { status: 400 },
        )
      }
    }

    await deleteStudent(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error eliminando estudiante" },
      { status: 500 },
    )
  }
}
