import { createClient } from "@/lib/supabase/server"
import type { Student } from "@/lib/types"

export async function getStudents(page = 1, limit = 10, search?: string, estado?: string) {
  const supabase = await createClient()
  
  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("No autenticado")
  }
  let query = supabase.from("students").select("*", { count: "exact" })

  if (search) {
    query = query.or(
      `ci.ilike.%${search}%,email.ilike.%${search}%,nombre.ilike.%${search}%,apellido.ilike.%${search}%,telefono.ilike.%${search}%`,
    )
  }

  if (estado) {
    query = query.eq("estado", estado)
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false })

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    data: data as Student[],
    total: count || 0,
    page,
    limit,
  }
}

export async function getStudentById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single()

  if (error) throw new Error(error.message)
  return data as Student
}

export async function checkStudentExists(ci: string, email: string, excludeId?: string) {
  const supabase = await createClient()
  let query = supabase.from("students").select("id").or(`ci.eq.${ci},email.eq.${email}`)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query.limit(1)
  if (error) throw new Error(error.message)
  return (data?.length || 0) > 0
}

export async function createStudent(student: Omit<Student, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()
  
  // Asegurar que fecha_nacimiento se envíe como string YYYY-MM-DD sin conversión de zona horaria
  const studentData = {
    ...student,
    fecha_nacimiento: typeof student.fecha_nacimiento === 'string' 
      ? student.fecha_nacimiento.split('T')[0] // Si viene con hora, solo tomar la fecha
      : student.fecha_nacimiento,
  }
  
  const { data, error } = await supabase.from("students").insert(studentData).select().single()

  if (error) throw new Error(error.message)
  return data as Student
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  const supabase = await createClient()
  
  // Asegurar que fecha_nacimiento se envíe como string YYYY-MM-DD sin conversión de zona horaria
  const updateData: any = { ...updates }
  if (updateData.fecha_nacimiento && typeof updateData.fecha_nacimiento === 'string') {
    updateData.fecha_nacimiento = updateData.fecha_nacimiento.split('T')[0]
  }
  
  const { data, error } = await supabase.from("students").update(updateData).eq("id", id).select().single()

  if (error) throw new Error(error.message)
  return data as Student
}

export async function checkStudentHasClasses(studentId: string) {
  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("estudiante_id", studentId)
    .limit(1)

  if (error) throw new Error(error.message)
  return (count || 0) > 0
}

export async function deleteStudent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("students").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
