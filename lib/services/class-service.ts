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
  // Usar admin client para evitar problemas con RLS al insertar
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const adminClient = createAdminClient()
  
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
  
  // Insertar la clase usando admin client
  const { data: insertedData, error: insertError } = await adminClient
    .from("classes")
    .insert(claseData)
    .select()
    .maybeSingle()

  if (insertError) throw new Error(insertError.message)
  if (!insertedData) throw new Error("No se pudo crear la clase. No se devolvió ningún resultado.")

  // Obtener la clase completa con relaciones usando admin client para evitar problemas con RLS
  const { data, error } = await adminClient
    .from("classes")
    .select(
      `*,
      estudiante:students(id, nombre, apellido),
      instructor:instructors(id, nombre, apellido)`,
    )
    .eq("id", insertedData.id)
    .maybeSingle()

  if (error) {
    // Si falla al obtener con relaciones, devolver al menos los datos básicos
    console.warn("Error obteniendo relaciones de la clase:", error)
    return insertedData as ClassWithDetails
  }

  if (!data) {
    // Si no se puede obtener con relaciones, devolver al menos los datos básicos
    return insertedData as ClassWithDetails
  }

  // Verificar si el estudiante tiene clases y actualizar su estado
  // Usar admin client para verificar y actualizar
  const { data: studentClasses, error: classesError } = await adminClient
    .from("classes")
    .select("id")
    .eq("estudiante_id", clase.estudiante_id)

  if (!classesError && studentClasses && studentClasses.length > 0) {
    // Si el estudiante tiene al menos una clase, cambiar de "activo" a "en_curso"
    const { data: student } = await adminClient
      .from("students")
      .select("estado")
      .eq("id", clase.estudiante_id)
      .maybeSingle()

    if (student && student.estado === "activo") {
      await adminClient
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
      .maybeSingle()
    
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
  
  const { data, error } = await supabase.from("classes").update(updateData).eq("id", id).select().maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error("No se encontró la clase para actualizar")
  return data as Class
}


export async function deleteClass(id: string) {
  const supabase = await createClient()
  
  // Obtener el estudiante_id antes de suspender la clase
  const { data: claseToDelete } = await supabase
    .from("classes")
    .select("estudiante_id")
    .eq("id", id)
    .maybeSingle()

  if (!claseToDelete) {
    throw new Error("No se encontró la clase para eliminar")
  }

  const estudianteId = claseToDelete.estudiante_id

  // En lugar de eliminar, cambiar el estado a "suspendida"
  const { error } = await supabase
    .from("classes")
    .update({ estado: "suspendida" })
    .eq("id", id)
  
  if (error) throw new Error(error.message)

  // Si se suspendió la clase, verificar si el estudiante aún tiene clases activas
  if (estudianteId) {
    const { data: remainingClasses, error: classesError } = await supabase
      .from("classes")
      .select("id")
      .eq("estudiante_id", estudianteId)
      .in("estado", ["agendado", "por_calificar", "cursado"]) // Solo contar clases activas
      .limit(1)

    // Si no tiene más clases activas y está en "en_curso", volver a "activo"
    if (!classesError && (!remainingClasses || remainingClasses.length === 0)) {
      const { data: student } = await supabase
        .from("students")
        .select("estado")
        .eq("id", estudianteId)
        .maybeSingle()

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
  duracion_minutos: number,
  estudiante_id?: string,
  instructor_id?: string,
  excludeId?: string,
) {
  const supabase = await createClient()
  
  // Obtener todas las clases en la misma fecha (para verificar superposiciones)
  let query = supabase
    .from("classes")
    .select("id, hora, duracion_minutos, estudiante_id, instructor_id")
    .eq("fecha", fecha)
    .neq("estado", "suspendida") // Excluir clases suspendidas

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

  const { data: existingClasses, error } = await query

  if (error) throw new Error(error.message)

  if (!existingClasses || existingClasses.length === 0) {
    return { conflict: false }
  }

  // Calcular el rango de tiempo de la nueva clase
  const [horaH, horaM] = hora.split(":").map(Number)
  const inicioNuevaClase = horaH * 60 + horaM // En minutos desde medianoche
  const finNuevaClase = inicioNuevaClase + (duracion_minutos || 60)

  // Verificar superposiciones con clases existentes
  for (const existingClass of existingClasses) {
    const [horaExistenteH, horaExistenteM] = existingClass.hora.split(":").map(Number)
    const inicioExistente = horaExistenteH * 60 + horaExistenteM
    const finExistente = inicioExistente + (existingClass.duracion_minutos || 60)

    // Verificar si hay superposición: las clases se superponen si una empieza antes de que termine la otra
    const haySuperposicion = 
      (inicioNuevaClase < finExistente && finNuevaClase > inicioExistente)

    if (haySuperposicion) {
      // Verificar si es el mismo estudiante o instructor
      if (estudiante_id && instructor_id && existingClass.estudiante_id === estudiante_id && existingClass.instructor_id === instructor_id) {
        return {
          conflict: true,
          message: "Ya existe una clase para este estudiante e instructor que se superpone con el horario seleccionado",
        }
      } else if (estudiante_id && existingClass.estudiante_id === estudiante_id) {
        return {
          conflict: true,
          message: "Ya existe una clase para este estudiante que se superpone con el horario seleccionado",
        }
      } else if (instructor_id && existingClass.instructor_id === instructor_id) {
        return {
          conflict: true,
          message: "Ya existe una clase para este instructor que se superpone con el horario seleccionado",
        }
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
    .maybeSingle()

  if (progressError && progressError.code !== "PGRST116") {
    throw new Error(progressError.message)
  }

  if (!progress) {
    // Si no hay progreso, no hay problema
    return { exceeded: false }
  }

  // Obtener todas las clases del estudiante (excepto la que se está editando y las suspendidas)
  let classesQuery = supabase
    .from("classes")
    .select("tipo, duracion_minutos")
    .eq("estudiante_id", estudiante_id)
    .neq("estado", "suspendida") // Excluir clases suspendidas

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

  // Verificar si la nueva clase excedería los requisitos o si ya está al 100%
  if (tipo === "practica") {
    // Verificar si ya está al 100% o más
    if (horasPracticasRequeridas > 0 && horasPracticasActuales >= horasPracticasRequeridas) {
      const horasActuales = Math.round((horasPracticasActuales / 60) * 10) / 10
      const horasRequeridas = Math.round((horasPracticasRequeridas / 60) * 10) / 10
      return {
        exceeded: true,
        message: `El estudiante ya completó el 100% de sus ${horasRequeridas}h de clases prácticas requeridas (tiene ${horasActuales}h). No se pueden crear más clases prácticas.`,
      }
    }
    
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
    // Verificar si ya está al 100% o más
    if (horasTeoricasRequeridas > 0 && horasTeoricasActuales >= horasTeoricasRequeridas) {
      const horasActuales = Math.round((horasTeoricasActuales / 60) * 10) / 10
      const horasRequeridas = Math.round((horasTeoricasRequeridas / 60) * 10) / 10
      return {
        exceeded: true,
        message: `El estudiante ya completó el 100% de sus ${horasRequeridas}h de clases teóricas requeridas (tiene ${horasActuales}h). No se pueden crear más clases teóricas.`,
      }
    }
    
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
 * También verifica que la clase no termine después del horario de fin
 */
export async function checkInstructorAvailability(
  instructor_id: string,
  hora: string,
  duracion_minutos: number = 60,
): Promise<{ available: boolean; message?: string }> {
  // Usar admin client para evitar problemas con RLS
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const adminClient = createAdminClient()

  // Obtener información del instructor
  const { data: instructor, error } = await adminClient
    .from("instructors")
    .select("hora_inicio, hora_fin, nombre, apellido")
    .eq("id", instructor_id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!instructor) {
    throw new Error("No se encontró el instructor")
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
  const horaClaseFinMinutos = horaClaseMinutos + duracion_minutos

  // Verificar si la hora de inicio de la clase está dentro del rango
  if (horaClaseMinutos < horaInicioMinutos || horaClaseMinutos >= horaFinMinutos) {
    return {
      available: false,
      message: `Tu horario disponible es de ${instructor.hora_inicio} a ${instructor.hora_fin}. La clase programada a las ${hora} está fuera de este horario.`,
    }
  }

  // Verificar que la clase no termine después del horario de fin
  if (horaClaseFinMinutos > horaFinMinutos) {
    const horaFinClase = new Date(0, 0, 0, Math.floor(horaClaseFinMinutos / 60), horaClaseFinMinutos % 60)
    const horaFinFormateada = `${String(Math.floor(horaClaseFinMinutos / 60)).padStart(2, "0")}:${String(horaClaseFinMinutos % 60).padStart(2, "0")}`
    return {
      available: false,
      message: `Tu horario disponible es de ${instructor.hora_inicio} a ${instructor.hora_fin}. La clase terminaría a las ${horaFinFormateada}, que está fuera de tu horario disponible.`,
    }
  }

  return { available: true }
}
