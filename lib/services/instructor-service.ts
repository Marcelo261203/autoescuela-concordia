import { createClient } from "@/lib/supabase/server"
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
