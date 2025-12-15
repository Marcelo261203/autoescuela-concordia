import { createClient } from "@/lib/supabase/server"
import { getUserRole, getCurrentInstructorId } from "@/lib/services/auth-service"
import { NextResponse } from "next/server"

/**
 * Ruta de API para verificar el rol del usuario actual
 * Útil para debugging y verificación
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ role: null, authenticated: false, user: null })
    }

    const role = await getUserRole()
    const instructorId = await getCurrentInstructorId()

    return NextResponse.json({
      role,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      instructorId,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo rol" },
      { status: 500 },
    )
  }
}




