import { getInstructors, createInstructor, createInstructorAuthUser } from "@/lib/services/instructor-service"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const estado = searchParams.get("estado") || undefined

    const result = await getInstructors(page, limit, estado)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo instructores" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { password, ...instructorData } = data

    // Si se proporciona contraseña, crear usuario en auth.users primero
    let authUserId: string | null = null
    if (password) {
      try {
        authUserId = await createInstructorAuthUser(instructorData.email, password)
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Error al crear usuario de autenticación" },
          { status: 400 },
        )
      }
    }

    // Crear el instructor con el auth_user_id vinculado
    const newInstructor = await createInstructor({
      ...instructorData,
      auth_user_id: authUserId,
      estado: "activo",
    })

    return NextResponse.json(newInstructor, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creando instructor" },
      { status: 500 },
    )
  }
}
