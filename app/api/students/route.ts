import { getStudents, createStudent, checkStudentExists } from "@/lib/services/student-service"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined
    const estado = searchParams.get("estado") || undefined

    const result = await getStudents(page, limit, search, estado)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error en GET /api/students:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo estudiantes" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const student = await request.json()

    // Verificar duplicados
    const exists = await checkStudentExists(student.ci, student.email)
    if (exists) {
      return NextResponse.json({ error: "Ya existe un estudiante con ese CI o email" }, { status: 400 })
    }

    const newStudent = await createStudent({
      ...student,
      fecha_inscripcion: new Date().toISOString(),
      estado: "activo", // SIEMPRE forzar estado "activo" al crear
    })

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creando estudiante" },
      { status: 500 },
    )
  }
}
