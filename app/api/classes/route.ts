import { getClasses, createClass } from "@/lib/services/class-service"
import { updateStudentProgress } from "@/lib/services/progress-service"
import { NextResponse } from "next/server"

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
    const newClass = await createClass(clase)

    // Actualizar progreso del estudiante
    await updateStudentProgress(clase.estudiante_id)

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error creando clase" }, { status: 500 })
  }
}
