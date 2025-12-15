import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getInstructorByAuthUserId } from "@/lib/services/instructor-service"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Verificar si el usuario es instructor y su estado
    if (data.user) {
      const instructor = await getInstructorByAuthUserId(data.user.id)
      
      if (instructor && instructor.estado === "inactivo") {
        // Cerrar sesión si el instructor está inactivo
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: "Su cuenta de instructor está inactiva. Por favor, contacte al administrador." },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error en login" }, { status: 500 })
  }
}
