import { createClient } from "@/lib/supabase/server"
import { getCurrentInstructorId } from "@/lib/services/auth-service"
import { getInstructorDashboardSummary } from "@/lib/services/report-service"
import { NextResponse } from "next/server"

/**
 * Obtiene el resumen del dashboard para el instructor actual
 * Solo funciona si el usuario está autenticado como instructor
 */
export async function GET() {
  try {
    // Obtener el usuario actual
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      )
    }

    // Obtener el ID del instructor actual
    const instructorId = await getCurrentInstructorId()

    if (!instructorId) {
      // Intentar obtener más información para debugging
      const { createAdminClient } = await import("@/lib/supabase/admin")
      const adminClient = createAdminClient()
      const { data: instructorCheck } = await adminClient
        .from("instructors")
        .select("id, nombre, apellido, email, auth_user_id")
        .eq("auth_user_id", user.id)
        .maybeSingle()

      return NextResponse.json(
        { 
          error: "No se encontró un instructor asociado a este usuario",
          debug: {
            userId: user.id,
            userEmail: user.email,
            instructorFound: instructorCheck ? {
              id: instructorCheck.id,
              nombre: instructorCheck.nombre,
              email: instructorCheck.email,
            } : null,
          },
        },
        { status: 403 },
      )
    }

    // Obtener el resumen del dashboard
    const summary = await getInstructorDashboardSummary(instructorId)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error en dashboard instructor:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo resumen del instructor" },
      { status: 500 },
    )
  }
}

