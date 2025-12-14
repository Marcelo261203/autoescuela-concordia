import { createClient } from "@/lib/supabase/server"
import { getCurrentInstructorId } from "@/lib/services/auth-service"
import { getInstructorById, updateInstructor, getInstructorByAuthUserId } from "@/lib/services/instructor-service"
import { NextResponse } from "next/server"

/**
 * Obtiene el perfil del instructor actual
 */
export async function GET() {
  try {
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

    // Obtener el instructor directamente por auth_user_id para evitar problemas
    const { getInstructorByAuthUserId } = await import("@/lib/services/instructor-service")
    const instructor = await getInstructorByAuthUserId(user.id)

    if (!instructor) {
      return NextResponse.json(
        { 
          error: "No se encontró un instructor asociado a este usuario. Por favor, contacta al administrador para vincular tu cuenta.",
          debug: {
            userId: user.id,
            userEmail: user.email,
          },
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ instructor })
  } catch (error) {
    console.error("Error en GET /api/instructor/profile:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo perfil" },
      { status: 500 },
    )
  }
}

/**
 * Actualiza el perfil del instructor actual
 */
export async function PUT(request: Request) {
  try {
    const instructorId = await getCurrentInstructorId()

    if (!instructorId) {
      return NextResponse.json(
        { error: "No se encontró un instructor asociado a este usuario" },
        { status: 403 },
      )
    }

    const updates = await request.json()

    // Validar que hora_fin sea posterior a hora_inicio si ambos están presentes
    if (updates.hora_inicio && updates.hora_fin) {
      const [horaInicioH, horaInicioM] = updates.hora_inicio.split(":").map(Number)
      const [horaFinH, horaFinM] = updates.hora_fin.split(":").map(Number)
      const horaInicioMinutos = horaInicioH * 60 + horaInicioM
      const horaFinMinutos = horaFinH * 60 + horaFinM

      if (horaFinMinutos <= horaInicioMinutos) {
        return NextResponse.json(
          { error: "La hora de fin debe ser posterior a la hora de inicio" },
          { status: 400 },
        )
      }
    }

    // Validar que si uno está presente, el otro también lo esté
    if ((updates.hora_inicio && !updates.hora_fin) || (!updates.hora_inicio && updates.hora_fin)) {
      return NextResponse.json(
        { error: "Debe especificar tanto la hora de inicio como la hora de fin, o dejar ambos vacíos" },
        { status: 400 },
      )
    }

    // Solo permitir actualizar ciertos campos (no permitir cambiar auth_user_id, estado, etc.)
    const allowedUpdates = {
      nombre: updates.nombre,
      apellido: updates.apellido,
      email: updates.email,
      telefono: updates.telefono,
      especialidad: updates.especialidad,
      hora_inicio: updates.hora_inicio || null,
      hora_fin: updates.hora_fin || null,
      updated_at: new Date().toISOString(),
    }

    // Usar admin client para evitar problemas con RLS
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminClient = createAdminClient()
    
    const { data: updatedInstructor, error: updateError } = await adminClient
      .from("instructors")
      .update(allowedUpdates)
      .eq("id", instructorId)
      .select()
      .maybeSingle()

    if (updateError) {
      throw new Error(updateError.message)
    }

    if (!updatedInstructor) {
      throw new Error("No se encontró el instructor para actualizar")
    }

    return NextResponse.json({ instructor: updatedInstructor })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando perfil" },
      { status: 500 },
    )
  }
}

