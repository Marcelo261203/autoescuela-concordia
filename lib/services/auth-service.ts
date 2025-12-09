import { createClient } from "@/lib/supabase/server"
import { getInstructorByAuthUserId } from "./instructor-service"

export type UserRole = "admin" | "instructor" | null

/**
 * Obtiene el rol del usuario actual basado en su autenticación
 * @returns "admin" si no está vinculado a ningún instructor, "instructor" si está vinculado, null si no está autenticado
 */
export async function getUserRole(): Promise<UserRole> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Verificar si el usuario está vinculado a un instructor
    const instructor = await getInstructorByAuthUserId(user.id)
    
    if (instructor) {
      return "instructor"
    }

    // Si no está vinculado a un instructor, es admin
    return "admin"
  } catch (error) {
    console.error("Error obteniendo rol de usuario:", error)
    return null
  }
}

/**
 * Obtiene el ID del instructor asociado al usuario actual
 * @returns ID del instructor o null si no es instructor o no está autenticado
 */
export async function getCurrentInstructorId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const instructor = await getInstructorByAuthUserId(user.id)
    return instructor?.id || null
  } catch (error) {
    console.error("Error obteniendo ID de instructor:", error)
    return null
  }
}
