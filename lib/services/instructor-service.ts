import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Instructor } from "@/lib/types"

export async function getInstructors(page = 1, limit = 10, estado?: string) {
  const supabase = await createClient()

  const offset = (page - 1) * limit
  let query = supabase.from("instructors").select("*", { count: "exact" })

  if (estado) {
    query = query.eq("estado", estado)
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .order("nombre")

  if (error) throw new Error(error.message)

  return {
    data: data as Instructor[],
    total: count || 0,
    page,
    limit,
  }
}

export async function getInstructorById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("instructors").select("*").eq("id", id).single()

  if (error) throw new Error(error.message)
  return data as Instructor
}

export async function createInstructor(instructor: Omit<Instructor, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("instructors").insert(instructor).select().single()

  if (error) throw new Error(error.message)
  return data as Instructor
}

export async function updateInstructor(id: string, updates: Partial<Instructor>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("instructors").update(updates).eq("id", id).select().single()

  if (error) throw new Error(error.message)
  return data as Instructor
}

export async function checkInstructorHasClasses(instructorId: string) {
  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("instructor_id", instructorId)
    .limit(1)

  if (error) throw new Error(error.message)
  return (count || 0) > 0
}

export async function getInstructorClassesCount(instructorId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("instructor_id", instructorId)

  if (error) throw new Error(error.message)
  return count || 0
}

export async function deleteInstructor(id: string) {
  const supabase = await createClient()
  
  // Verificar si tiene clases asociadas (ON DELETE RESTRICT en BD)
  const hasClasses = await checkInstructorHasClasses(id)
  if (hasClasses) {
    const count = await getInstructorClassesCount(id)
    throw new Error(
      `No se puede eliminar el instructor porque tiene ${count} clase${count > 1 ? "s" : ""} asociada${count > 1 ? "s" : ""}. Por favor, elimine o reasigne las clases primero.`,
    )
  }

  const { error } = await supabase.from("instructors").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

/**
 * Crea un usuario en Supabase Auth para un instructor
 * @param email Email del instructor
 * @param password Contraseña inicial
 * @returns El ID del usuario creado en auth.users
 */
export async function createInstructorAuthUser(email: string, password: string): Promise<string> {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar el email
  })

  if (error) {
    if (error.message.includes("already registered")) {
      throw new Error("Este email ya está registrado en el sistema")
    }
    throw new Error(`Error al crear usuario: ${error.message}`)
  }

  if (!data.user?.id) {
    throw new Error("No se pudo obtener el ID del usuario creado")
  }

  return data.user.id
}

/**
 * Obtiene el instructor asociado a un usuario de autenticación
 * @param authUserId ID del usuario en auth.users
 * @returns El instructor asociado o null si no existe
 */
export async function getInstructorByAuthUserId(authUserId: string): Promise<Instructor | null> {
  // Usar admin client para evitar problemas con RLS
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("instructors")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle()

  if (error) {
    if (error.code === "PGRST116") {
      // No se encontró ningún registro
      return null
    }
    throw new Error(error.message)
  }

  return data as Instructor | null
}

/**
 * Verifica si un instructor tiene usuario de autenticación activo
 * @param instructorId ID del instructor
 * @returns true si tiene auth_user_id, false en caso contrario
 */
export async function instructorHasAuthUser(instructorId: string): Promise<boolean> {
  const instructor = await getInstructorById(instructorId)
  return !!instructor.auth_user_id
}

/**
 * Actualiza la contraseña de un usuario existente en Supabase Auth
 * @param authUserId ID del usuario en auth.users
 * @param newPassword Nueva contraseña
 */
export async function updateInstructorPassword(authUserId: string, newPassword: string): Promise<void> {
  const adminClient = createAdminClient()
  
  const { error } = await adminClient.auth.admin.updateUserById(authUserId, {
    password: newPassword,
  })

  if (error) {
    throw new Error(`Error al actualizar contraseña: ${error.message}`)
  }
}
