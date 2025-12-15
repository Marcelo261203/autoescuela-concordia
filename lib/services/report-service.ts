import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getActiveStudentsReport() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("students").select("*").eq("estado", "activo").order("nombre")

  if (error) throw new Error(error.message)
  return data
}

export async function getStudentsByStateReport() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select("estado")
    .then((res) => {
      if (res.error) throw new Error(res.error.message)

      const grouped = res.data?.reduce(
        (acc, curr) => {
          const estado = curr.estado || "sin_estado"
          acc[estado] = (acc[estado] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      return grouped
    })

  return data
}

export async function getClassesReport(filters?: { dateFrom?: string; dateTo?: string; tipo?: string }) {
  const supabase = await createClient()

  let query = supabase.from("classes").select(
    `*,
    estudiante:students(id, nombre, apellido, ci, categoria_licencia_deseada),
    instructor:instructors(id, nombre, apellido, especialidad)`,
  )

  if (filters?.dateFrom) {
    query = query.gte("fecha", filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte("fecha", filters.dateTo)
  }
  if (filters?.tipo) {
    query = query.eq("tipo", filters.tipo)
  }

  const { data, error } = await query.order("fecha", { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getDashboardSummary() {
  // Usar adminClient para evitar problemas de RLS en el dashboard del admin
  const supabase = createAdminClient()

  // Obtener todos los estudiantes para contar por estado
  const { data: allStudents, error: studentsError } = await supabase
    .from("students")
    .select("estado, fecha_inscripcion")

  if (studentsError) throw new Error(studentsError.message)

  // Contar por estado
  const total = allStudents?.length || 0
  const activo = allStudents?.filter((s) => s.estado === "activo").length || 0
  const en_curso = allStudents?.filter((s) => s.estado === "en_curso").length || 0
  const graduado = allStudents?.filter((s) => s.estado === "graduado").length || 0
  const inactivo = allStudents?.filter((s) => s.estado === "inactivo").length || 0

  // Obtener total de clases
  const { count: totalClases } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })

  // Calcular tendencia de últimos 6 meses (para estudiantes)
  const trendData: Array<{ mes: string; estudiantes: number }> = []
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const ahora = new Date()

  for (let i = 5; i >= 0; i--) {
    // Calcular el mes objetivo (últimos 6 meses desde el mes actual)
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const mesIndex = fecha.getMonth() // 0-11
    const nombreMes = nombresMeses[mesIndex]

    // Fechas de inicio y fin del mes
    const fechaInicioMes = fecha.toISOString().split("T")[0]
    const fechaFinMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split("T")[0]

    // Contar estudiantes inscritos en ese mes
    const estudiantesMes = allStudents?.filter((s) => {
      if (!s.fecha_inscripcion) return false
      const fechaInscripcion = new Date(s.fecha_inscripcion).toISOString().split("T")[0]
      return fechaInscripcion >= fechaInicioMes && fechaInscripcion <= fechaFinMes
    }).length || 0

    trendData.push({
      mes: nombreMes,
      estudiantes: estudiantesMes,
    })
  }

  // Obtener estadísticas de clases
  const { data: allClasses, error: classesError } = await supabase
    .from("classes")
    .select("estado, nota, fecha")

  if (classesError) throw new Error(classesError.message)

  // Calcular tendencia de clases por mes (últimos 5 meses)
  const classesTrendData: Array<{ mes: string; clases: number }> = []
  for (let i = 4; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const mesIndex = fecha.getMonth()
    const nombreMes = nombresMeses[mesIndex]
    const fechaInicioMes = fecha.toISOString().split("T")[0]
    const fechaFinMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split("T")[0]

    // Contar clases realizadas en ese mes (basado en la fecha de la clase)
    const clasesMes = allClasses?.filter((c) => {
      if (!c.fecha) return false
      const fechaClase = new Date(c.fecha).toISOString().split("T")[0]
      return fechaClase >= fechaInicioMes && fechaClase <= fechaFinMes
    }).length || 0

    classesTrendData.push({
      mes: nombreMes,
      clases: clasesMes,
    })
  }

  const clasesCompletadas = allClasses?.filter((c) => c.estado === "cursado").length || 0
  const clasesAgendadas = allClasses?.filter((c) => c.estado === "agendado").length || 0
  const clasesPorCalificar = allClasses?.filter((c) => c.estado === "por_calificar").length || 0

  // Calcular estadísticas de notas
  const clasesConNota = allClasses?.filter((c) => c.nota !== null && c.nota !== undefined) || []
  const promedioNotas = clasesConNota.length > 0
    ? clasesConNota.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesConNota.length
    : 0

  // Distribución de notas
  const distribucionNotas = {
    excelente: clasesConNota.filter((c) => (c.nota || 0) >= 90).length,
    bueno: clasesConNota.filter((c) => (c.nota || 0) >= 75 && (c.nota || 0) < 90).length,
    regular: clasesConNota.filter((c) => (c.nota || 0) >= 60 && (c.nota || 0) < 75).length,
    bajo: clasesConNota.filter((c) => (c.nota || 0) < 60).length,
  }

  // Tendencia de notas promedio por mes (últimos 6 meses)
  const notasTrendData: Array<{ mes: string; promedio: number }> = []
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const mesIndex = fecha.getMonth()
    const nombreMes = nombresMeses[mesIndex]
    const fechaInicioMes = fecha.toISOString().split("T")[0]
    const fechaFinMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split("T")[0]

    const clasesDelMes = allClasses?.filter((c) => {
      if (!c.fecha) return false
      const fechaClase = new Date(c.fecha).toISOString().split("T")[0]
      return fechaClase >= fechaInicioMes && fechaClase <= fechaFinMes && c.nota !== null && c.nota !== undefined
    }) || []

    const promedioMes = clasesDelMes.length > 0
      ? clasesDelMes.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesDelMes.length
      : 0

    notasTrendData.push({
      mes: nombreMes,
      promedio: Math.round(promedioMes * 10) / 10,
    })
  }

  // Obtener estadísticas de progreso
  const { data: allProgress, error: progressError } = await supabase
    .from("student_progress")
    .select("porcentaje_avance, nota_final, aprobado")

  if (progressError && progressError.code !== "PGRST116") throw new Error(progressError.message)

  const progresoPromedio = allProgress && allProgress.length > 0
    ? allProgress.reduce((sum, p) => sum + (p.porcentaje_avance || 0), 0) / allProgress.length
    : 0

  const estudiantesAprobados = allProgress?.filter((p) => p.aprobado === true).length || 0
  const estudiantesReprobados = allProgress?.filter((p) => p.aprobado === false).length || 0
  const estudiantesPendientes = allProgress?.filter((p) => p.aprobado === null).length || 0

  // Promedio de nota final de exámenes
  const examenesConNota = allProgress?.filter((p) => p.nota_final !== null && p.nota_final !== undefined) || []
  const promedioNotaFinal = examenesConNota.length > 0
    ? examenesConNota.reduce((sum, p) => sum + (p.nota_final || 0), 0) / examenesConNota.length
    : 0

  // Top estudiantes por progreso (últimos 5)
  const { data: topStudents, error: topStudentsError } = await supabase
    .from("student_progress")
    .select(`
      porcentaje_avance,
      estudiante:students(id, nombre, apellido, ci)
    `)
    .order("porcentaje_avance", { ascending: false })
    .limit(5)

  if (topStudentsError && topStudentsError.code !== "PGRST116") throw new Error(topStudentsError.message)

  return {
    total,
    activo,
    en_curso,
    graduado,
    inactivo,
    totalClases: totalClases || 0,
    trendData,
    classesTrendData, // Tendencia de clases por mes (últimos 5 meses)
    // Nuevas estadísticas de clases
    clasesCompletadas,
    clasesAgendadas,
    clasesPorCalificar,
    // Estadísticas de notas
    promedioNotas: Math.round(promedioNotas * 10) / 10,
    distribucionNotas,
    notasTrendData,
    // Estadísticas de progreso
    progresoPromedio: Math.round(progresoPromedio * 10) / 10,
    estudiantesAprobados,
    estudiantesReprobados,
    estudiantesPendientes,
    promedioNotaFinal: Math.round(promedioNotaFinal * 10) / 10,
    topStudents: topStudents?.map((s) => ({
      nombre: `${s.estudiante?.nombre || ""} ${s.estudiante?.apellido || ""}`.trim() || "N/A",
      ci: s.estudiante?.ci || "N/A",
      progreso: Math.round((s.porcentaje_avance || 0) * 10) / 10,
    })) || [],
  }
}

/**
 * Obtiene el resumen del dashboard para un instructor específico
 * Solo muestra las clases asignadas a ese instructor
 */
export async function getInstructorDashboardSummary(instructorId: string) {
  const supabase = await createClient()

  // Obtener todas las clases del instructor
  const { data: allClasses, error: classesError } = await supabase
    .from("classes")
    .select("id, estado, nota, fecha, tipo, estudiante_id, estudiante:students(id, nombre, apellido, ci)")
    .eq("instructor_id", instructorId)

  if (classesError) throw new Error(classesError.message)

  // Estadísticas básicas
  const totalClases = allClasses?.length || 0
  const clasesCompletadas = allClasses?.filter((c) => c.estado === "cursado").length || 0
  const clasesAgendadas = allClasses?.filter((c) => c.estado === "agendado").length || 0
  const clasesPorCalificar = allClasses?.filter((c) => c.estado === "por_calificar").length || 0

  // Calcular promedio de notas
  const clasesConNota = allClasses?.filter((c) => c.nota !== null && c.nota !== undefined) || []
  const promedioNotas = clasesConNota.length > 0
    ? clasesConNota.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesConNota.length
    : 0

  // Distribución de notas
  const distribucionNotas = {
    excelente: clasesConNota.filter((c) => (c.nota || 0) >= 90).length,
    bueno: clasesConNota.filter((c) => (c.nota || 0) >= 75 && (c.nota || 0) < 90).length,
    regular: clasesConNota.filter((c) => (c.nota || 0) >= 60 && (c.nota || 0) < 75).length,
    bajo: clasesConNota.filter((c) => (c.nota || 0) < 60).length,
  }

  // Tendencia de clases por mes (últimos 5 meses)
  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]
  const ahora = new Date()
  const classesTrendData: Array<{ mes: string; clases: number }> = []

  for (let i = 4; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const mesIndex = fecha.getMonth()
    const nombreMes = nombresMeses[mesIndex]
    const fechaInicioMes = fecha.toISOString().split("T")[0]
    const fechaFinMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split("T")[0]

    const clasesMes = allClasses?.filter((c) => {
      if (!c.fecha) return false
      const fechaClase = new Date(c.fecha).toISOString().split("T")[0]
      return fechaClase >= fechaInicioMes && fechaClase <= fechaFinMes
    }).length || 0

    classesTrendData.push({
      mes: nombreMes,
      clases: clasesMes,
    })
  }

  // Clases por tipo
  const clasesPracticas = allClasses?.filter((c) => c.tipo === "practica").length || 0
  const clasesTeoricas = allClasses?.filter((c) => c.tipo === "teorica").length || 0

  // Estudiantes únicos que tiene asignados
  const estudiantesUnicos = new Set(allClasses?.map((c) => c.estudiante_id).filter(Boolean) || [])
  const totalEstudiantes = estudiantesUnicos.size

  // Próximas clases (próximas 5 clases agendadas)
  const hoy = new Date().toISOString().split("T")[0]
  const proximasClases = allClasses
    ?.filter((c) => c.estado === "agendado" && c.fecha >= hoy)
    .sort((a, b) => {
      if (!a.fecha || !b.fecha) return 0
      return a.fecha.localeCompare(b.fecha)
    })
    .slice(0, 5) || []

  return {
    totalClases,
    clasesCompletadas,
    clasesAgendadas,
    clasesPorCalificar,
    promedioNotas: Math.round(promedioNotas * 10) / 10,
    distribucionNotas,
    classesTrendData,
    clasesPracticas,
    clasesTeoricas,
    totalEstudiantes,
    proximasClases: proximasClases.map((c) => ({
      id: c.id,
      fecha: c.fecha,
      tipo: c.tipo,
      estudiante: c.estudiante,
    })),
  }
}
