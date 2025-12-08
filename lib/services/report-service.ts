import { createClient } from "@/lib/supabase/server"

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
    estudiante:students(id, nombre, apellido, ci),
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
  const supabase = await createClient()

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

  // Calcular tendencia de últimos 6 meses
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

  return {
    total,
    activo,
    en_curso,
    graduado,
    inactivo,
    totalClases: totalClases || 0,
    trendData,
  }
}
