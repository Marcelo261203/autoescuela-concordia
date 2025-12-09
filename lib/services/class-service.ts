import { createClient } from "@/lib/supabase/server"
import type { Class, ClassWithDetails } from "@/lib/types"

/**
 * Actualiza automáticamente el estado de clases que ya pasaron su horario
 * de "agendado" a "por_calificar"
 */
async function updateClassStatuses() {
  const supabase = await createClient()
  
  // Obtener todas las clases que están en "agendado" y ya pasaron su horario
  const { data: classesToUpdate, error: fetchError } = await supabase
    .from("classes")
    .select("id, fecha, hora, duracion_minutos")
    .eq("estado", "agendado")
    .is("nota", null)

  if (fetchError) {
    console.error("Error fetching classes to update:", fetchError)
    return
  }

  if (!classesToUpdate || classesToUpdate.length === 0) {
    return
  }

  const ahora = new Date()
  const classesIdsToUpdate: string[] = []

  for (const clase of classesToUpdate) {
    try {
      const fechaHoraInicio = new Date(`${clase.fecha}T${clase.hora}`)
      const fechaHoraFin = new Date(fechaHoraInicio.getTime() + (clase.duracion_minutos || 0) * 60 * 1000)
      
      if (ahora >= fechaHoraFin) {
        classesIdsToUpdate.push(clase.id)
      }
    } catch (error) {
      console.error(`Error processing class ${clase.id}:`, error)
    }
  }

  // Actualizar todas las clases que deben cambiar de estado
  if (classesIdsToUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from("classes")
      .update({ estado: "por_calificar" })
      .in("id", classesIdsToUpdate)

    if (updateError) {
      console.error("Error updating class statuses:", updateError)
    }
  }
}

export async function getClasses(
  page = 1,
  limit = 10,
  filters?: { estudiante_id?: string; instructor_id?: string; tipo?: string; fechaInicio?: string; fechaFin?: string },
) {
  const supabase = await createClient()
  
  // Actualizar estados automáticamente antes de obtener las clases
  await updateClassStatuses()
  
  let query = supabase.from("classes").select(
    `*,
      estudiante:students(id, nombre, apellido, ci),
      instructor:instructors(id, nombre, apellido, especialidad)`,
    { count: "exact" },
  )

  if (filters?.estudiante_id) {
    query = query.eq("estudiante_id", filters.estudiante_id)
  }
  if (filters?.instructor_id) {
    query = query.eq("instructor_id", filters.instructor_id)
  }
  if (filters?.tipo) {
    query = query.eq("tipo", filters.tipo)
  }
  if (filters?.fechaInicio) {
    query = query.gte("fecha", filters.fechaInicio)
  }
  if (filters?.fechaFin) {
    query = query.lte("fecha", filters.fechaFin)
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1).order("fecha", { ascending: false })

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    data: data as ClassWithDetails[],
    total: count || 0,
    page,
    limit,
  }
}

export async function getClassesByStudent(studentId: string) {
  const supabase = await createClient()
  
  // Actualizar estados automáticamente antes de obtener las clases
  await updateClassStatuses()
  
  const { data, error } = await supabase
    .from("classes")
    .select(
      `*,
      instructor:instructors(id, nombre, apellido, especialidad)`,
    )
    .eq("estudiante_id", studentId)
    .order("fecha", { ascending: false })

  if (error) throw new Error(error.message)
  return data as ClassWithDetails[]
}

export async function createClass(clase: Omit<Class, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()
  
  // Asegurar que fecha se envíe como string YYYY-MM-DD sin conversión de zona horaria
  // Si viene como Date object, convertirlo a string YYYY-MM-DD
  let fechaString: string
  if (typeof clase.fecha === 'string') {
    fechaString = clase.fecha.split('T')[0] // Si viene con hora, solo tomar la fecha
  } else if (clase.fecha instanceof Date) {
    // Convertir Date a YYYY-MM-DD en hora local (no UTC)
    const year = clase.fecha.getFullYear()
    const month = String(clase.fecha.getMonth() + 1).padStart(2, '0')
    const day = String(clase.fecha.getDate()).padStart(2, '0')
    fechaString = `${year}-${month}-${day}`
  } else {
    fechaString = clase.fecha as string
  }
  
  const claseData = {
    ...clase,
    fecha: fechaString,
    estado: clase.estado || "agendado", // Por defecto "agendado"
  }
  
  const { data, error } = await supabase
    .from("classes")
    .insert(claseData)
    .select(
      `*,
      estudiante:students(id, nombre, apellido),
      instructor:instructors(id, nombre, apellido)`,
    )
    .single()

  if (error) throw new Error(error.message)

  // Verificar si el estudiante tiene clases y actualizar su estado
  const { data: studentClasses, error: classesError } = await supabase
    .from("classes")
    .select("id")
    .eq("estudiante_id", clase.estudiante_id)

  if (!classesError && studentClasses && studentClasses.length > 0) {
    // Si el estudiante tiene al menos una clase, cambiar de "activo" a "en_curso"
    const { data: student } = await supabase
      .from("students")
      .select("estado")
      .eq("id", clase.estudiante_id)
      .single()

    if (student && student.estado === "activo") {
      await supabase
        .from("students")
        .update({ estado: "en_curso" })
        .eq("id", clase.estudiante_id)
    }
  }

  return data as ClassWithDetails
}

export async function updateClass(id: string, updates: Partial<Class>) {
  const supabase = await createClient()
  
  // Asegurar que fecha se envíe como string YYYY-MM-DD sin conversión de zona horaria
  const updateData: any = { ...updates }
  if (updateData.fecha && typeof updateData.fecha === 'string') {
    updateData.fecha = updateData.fecha.split('T')[0]
  }
  
  // Si se está calificando la clase (se llena nota y observaciones), cambiar estado a "cursado"
  if (updateData.nota !== undefined && updateData.nota !== null && updateData.observaciones) {
    updateData.estado = "cursado"
  } else if (updateData.estado === undefined) {
    // Si no se especifica estado y la clase tiene nota, mantener estado "cursado"
    // Si no tiene nota, verificar si debe estar en "por_calificar"
    const { data: currentClass } = await supabase
      .from("classes")
      .select("fecha, hora, duracion_minutos, nota")
      .eq("id", id)
      .single()
    
    if (currentClass && !currentClass.nota) {
      try {
        const fechaHoraInicio = new Date(`${currentClass.fecha}T${currentClass.hora}`)
        const fechaHoraFin = new Date(fechaHoraInicio.getTime() + (currentClass.duracion_minutos || 0) * 60 * 1000)
        const ahora = new Date()
        
        if (ahora >= fechaHoraFin) {
          updateData.estado = "por_calificar"
        }
      } catch (error) {
        console.error("Error checking class time:", error)
      }
    }
  }
  
  const { data, error } = await supabase.from("classes").update(updateData).eq("id", id).select().single()

  if (error) throw new Error(error.message)
  return data as Class
}


export async function deleteClass(id: string) {
  const supabase = await createClient()
  
  // Obtener el estudiante_id antes de eliminar la clase
  const { data: claseToDelete } = await supabase
    .from("classes")
    .select("estudiante_id")
    .eq("id", id)
    .single()

  const estudianteId = claseToDelete?.estudiante_id

  // Eliminar la clase
  const { error } = await supabase.from("classes").delete().eq("id", id)
  if (error) throw new Error(error.message)

  // Si se eliminó la clase, verificar si el estudiante aún tiene clases
  if (estudianteId) {
    const { data: remainingClasses, error: classesError } = await supabase
      .from("classes")
      .select("id")
      .eq("estudiante_id", estudianteId)
      .limit(1)

    // Si no tiene más clases y está en "en_curso", volver a "activo"
    if (!classesError && (!remainingClasses || remainingClasses.length === 0)) {
      const { data: student } = await supabase
        .from("students")
        .select("estado")
        .eq("id", estudianteId)
        .single()

      if (student && student.estado === "en_curso") {
        await supabase
          .from("students")
          .update({ estado: "activo" })
          .eq("id", estudianteId)
      }
    }
  }
}

export async function checkClassConflict(
  fecha: string,
  hora: string,
  estudiante_id?: string,
  instructor_id?: string,
  excludeId?: string,
) {
  const supabase = await createClient()
  let query = supabase.from("classes").select("id").eq("fecha", fecha).eq("hora", hora)

  // Si se proporciona estudiante_id, verificar conflicto con ese estudiante
  if (estudiante_id) {
    query = query.eq("estudiante_id", estudiante_id)
  }

  // Si se proporciona instructor_id, verificar conflicto con ese instructor
  if (instructor_id) {
    query = query.eq("instructor_id", instructor_id)
  }

  // Excluir la clase actual si se está editando
  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query.limit(1)

  if (error) throw new Error(error.message)

  if (data && data.length > 0) {
    if (estudiante_id && instructor_id) {
      return {
        conflict: true,
        message: "Ya existe una clase para este estudiante e instructor en esta fecha y hora",
      }
    } else if (estudiante_id) {
      return {
        conflict: true,
        message: "Ya existe una clase para este estudiante en esta fecha y hora",
      }
    } else if (instructor_id) {
      return {
        conflict: true,
        message: "Ya existe una clase para este instructor en esta fecha y hora",
      }
    } else {
      return {
        conflict: true,
        message: "Ya existe una clase en esta fecha y hora",
      }
    }
  }

  return { conflict: false }
}

export async function checkHoursExceeded(
  estudiante_id: string,
  tipo: "practica" | "teorica",
  duracion_minutos: number,
  excludeClassId?: string,
) {
  const supabase = await createClient()

  // Obtener progreso del estudiante
  const { data: progress, error: progressError } = await supabase
    .from("student_progress")
    .select("*")
    .eq("estudiante_id", estudiante_id)
    .single()

  if (progressError && progressError.code !== "PGRST116") {
    throw new Error(progressError.message)
  }

  if (!progress) {
    // Si no hay progreso, no hay problema
    return { exceeded: false }
  }

  // Obtener todas las clases del estudiante (excepto la que se está editando)
  let classesQuery = supabase
    .from("classes")
    .select("tipo, duracion_minutos")
    .eq("estudiante_id", estudiante_id)

  if (excludeClassId) {
    classesQuery = classesQuery.neq("id", excludeClassId)
  }

  const { data: classes, error: classesError } = await classesQuery

  if (classesError) throw new Error(classesError.message)

  // Calcular horas actuales por tipo
  const horasPracticasActuales =
    classes
      ?.filter((c) => c.tipo === "practica")
      .reduce((total, c) => total + (c.duracion_minutos || 0), 0) || 0

  const horasTeoricasActuales =
    classes
      ?.filter((c) => c.tipo === "teorica")
      .reduce((total, c) => total + (c.duracion_minutos || 0), 0) || 0

  // Obtener requisitos (con penalización si existe)
  const horasPracticasRequeridasBase =
    progress.horas_practicas_requeridas || progress.clases_practicas_requeridas || 720
  const horasTeoricasRequeridasBase =
    progress.horas_teoricas_requeridas || progress.clases_teoricas_requeridas || 600

  const horasPenalizacionPracticas = progress.horas_penalizacion_practicas || 0
  const horasPenalizacionTeoricas = progress.horas_penalizacion_teoricas || 0

  const horasPracticasRequeridas = horasPracticasRequeridasBase + horasPenalizacionPracticas
  const horasTeoricasRequeridas = horasTeoricasRequeridasBase + horasPenalizacionTeoricas

  // Verificar si la nueva clase excedería los requisitos
  if (tipo === "practica") {
    const horasPracticasNuevas = horasPracticasActuales + duracion_minutos
    if (horasPracticasNuevas > horasPracticasRequeridas) {
      const horasActuales = Math.round((horasPracticasActuales / 60) * 10) / 10
      const horasRequeridas = Math.round((horasPracticasRequeridas / 60) * 10) / 10
      const horasNuevas = Math.round((horasPracticasNuevas / 60) * 10) / 10
      return {
        exceeded: true,
        message: `El estudiante ya completó sus ${horasRequeridas}h de clases prácticas requeridas (tiene ${horasActuales}h). Agregar esta clase resultaría en ${horasNuevas}h, excediendo el límite.`,
      }
    }
  } else if (tipo === "teorica") {
    const horasTeoricasNuevas = horasTeoricasActuales + duracion_minutos
    if (horasTeoricasNuevas > horasTeoricasRequeridas) {
      const horasActuales = Math.round((horasTeoricasActuales / 60) * 10) / 10
      const horasRequeridas = Math.round((horasTeoricasRequeridas / 60) * 10) / 10
      const horasNuevas = Math.round((horasTeoricasNuevas / 60) * 10) / 10
      return {
        exceeded: true,
        message: `El estudiante ya completó sus ${horasRequeridas}h de clases teóricas requeridas (tiene ${horasActuales}h). Agregar esta clase resultaría en ${horasNuevas}h, excediendo el límite.`,
      }
    }
  }

  return { exceeded: false }
}

/**
 * Verificar si la hora de la clase está dentro del horario disponible del instructor
 */
export async function checkInstructorAvailability(
  instructor_id: string,
  hora: string,
): Promise<{ available: boolean; message?: string }> {
  const supabase = await createClient()

  // Obtener información del instructor
  const { data: instructor, error } = await supabase
    .from("instructors")
    .select("hora_inicio, hora_fin, nombre, apellido")
    .eq("id", instructor_id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Si el instructor no tiene horario definido (ambos NULL), permitir cualquier hora
  if (!instructor.hora_inicio || !instructor.hora_fin) {
    return { available: true }
  }

  // Convertir horas a minutos para comparar
  const [horaInicioH, horaInicioM] = instructor.hora_inicio.split(":").map(Number)
  const [horaFinH, horaFinM] = instructor.hora_fin.split(":").map(Number)
  const [horaClaseH, horaClaseM] = hora.split(":").map(Number)

  const horaInicioMinutos = horaInicioH * 60 + horaInicioM
  const horaFinMinutos = horaFinH * 60 + horaFinM
  const horaClaseMinutos = horaClaseH * 60 + horaClaseM

  // Verificar si la hora de la clase está dentro del rango
  if (horaClaseMinutos < horaInicioMinutos || horaClaseMinutos >= horaFinMinutos) {
    return {
      available: false,
      message: `El instructor ${instructor.nombre} ${instructor.apellido} solo está disponible entre las ${instructor.hora_inicio} y las ${instructor.hora_fin}. La clase programada a las ${hora} está fuera de este horario.`,
    }
  }

  return { available: true }
}
