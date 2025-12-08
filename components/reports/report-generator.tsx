"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, BarChart3, Loader2, Calendar, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Student, ClassWithDetails } from "@/lib/types"

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  graduado: "bg-purple-100 text-purple-800",
  inactivo: "bg-gray-100 text-gray-800",
}

const tipoColors: Record<string, string> = {
  practica: "bg-blue-100 text-blue-800",
  teorica: "bg-purple-100 text-purple-800",
}

export function ReportGenerator() {
  const [reportType, setReportType] = useState<"students" | "classes">("students")
  const [status, setStatus] = useState<string>("all")
  const [classTipo, setClassTipo] = useState<string>("all")
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (reportType === "students") {
      fetchStudents()
    } else {
      fetchClasses()
    }
  }, [reportType])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/students?limit=1000")
      if (!response.ok) {
        throw new Error("Error al cargar estudiantes")
      }
      const data = await response.json()
      setStudents(data.data || [])
    } catch (err) {
      console.error("Error fetching students:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/classes?limit=1000")
      if (!response.ok) {
        throw new Error("Error al cargar clases")
      }
      const data = await response.json()
      setClasses(data.data || [])
    } catch (err) {
      console.error("Error fetching classes:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const studentsSummary = {
    total: students.length,
    activo: students.filter((s) => s.estado === "activo").length,
    en_curso: students.filter((s) => s.estado === "en_curso").length,
    graduado: students.filter((s) => s.estado === "graduado").length,
    inactivo: students.filter((s) => s.estado === "inactivo").length,
  }

  const classesSummary = {
    total: classes.length,
    practica: classes.filter((c) => c.tipo === "practica").length,
    teorica: classes.filter((c) => c.tipo === "teorica").length,
  }

  const filteredStudents =
    status === "all" ? students : students.filter((s) => s.estado === status)

  const filteredClasses =
    classTipo === "all" ? classes : classes.filter((c) => c.tipo === classTipo)

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const parts = dateString.split("T")[0].split("-")
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`
    }
    return dateString
  }

  const handleExportStudents = () => {
    if (filteredStudents.length === 0) {
      alert("No hay estudiantes para exportar")
      return
    }

    let content = ""
    let filename = ""

    if (exportFormat === "csv") {
      const headers = ["CI", "Nombre", "Apellido", "Email", "Teléfono", "Estado", "Fecha Inscripción"]
      const rows = filteredStudents.map((s) => [
        s.ci,
        s.nombre,
        s.apellido,
        s.email,
        s.telefono,
        s.estado,
        s.fecha_inscripcion ? new Date(s.fecha_inscripcion).toLocaleDateString("es-ES") : "",
      ])
      content = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
      filename = `reporte-estudiantes-${status !== "all" ? status + "-" : ""}${new Date().toISOString().split("T")[0]}.csv`
    } else {
      const exportData = filteredStudents.map((s) => ({
        ci: s.ci,
        nombre: s.nombre,
        apellido: s.apellido,
        email: s.email,
        telefono: s.telefono,
        estado: s.estado,
        fecha_inscripcion: s.fecha_inscripcion,
        direccion: s.direccion,
        fecha_nacimiento: s.fecha_nacimiento,
      }))
      content = JSON.stringify(exportData, null, 2)
      filename = `reporte-estudiantes-${status !== "all" ? status + "-" : ""}${new Date().toISOString().split("T")[0]}.json`
    }

    const blob = new Blob([content], { type: exportFormat === "csv" ? "text/csv" : "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleExportClasses = () => {
    if (filteredClasses.length === 0) {
      alert("No hay clases para exportar")
      return
    }

    let content = ""
    let filename = ""

    if (exportFormat === "csv") {
      const headers = [
        "Fecha",
        "Hora",
        "Estudiante",
        "CI Estudiante",
        "Instructor",
        "Tipo",
        "Categoría",
        "Duración (min)",
        "Observaciones",
      ]
      const rows = filteredClasses.map((c) => [
        formatDate(c.fecha),
        c.hora,
        c.estudiante ? `${c.estudiante.nombre} ${c.estudiante.apellido}` : "N/A",
        c.estudiante?.ci || "N/A",
        c.instructor ? `${c.instructor.nombre} ${c.instructor.apellido}` : "N/A",
        c.tipo === "practica" ? "Práctica" : "Teórica",
        c.categoria_licencia || "N/A",
        c.duracion_minutos,
        c.observaciones || "",
      ])
      content = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
      filename = `reporte-clases-${classTipo !== "all" ? classTipo + "-" : ""}${new Date().toISOString().split("T")[0]}.csv`
    } else {
      const exportData = filteredClasses.map((c) => ({
        fecha: c.fecha,
        hora: c.hora,
        estudiante: c.estudiante ? `${c.estudiante.nombre} ${c.estudiante.apellido}` : null,
        ci_estudiante: c.estudiante?.ci || null,
        instructor: c.instructor ? `${c.instructor.nombre} ${c.instructor.apellido}` : null,
        tipo: c.tipo,
        categoria_licencia: c.categoria_licencia,
        duracion_minutos: c.duracion_minutos,
        observaciones: c.observaciones,
      }))
      content = JSON.stringify(exportData, null, 2)
      filename = `reporte-clases-${classTipo !== "all" ? classTipo + "-" : ""}${new Date().toISOString().split("T")[0]}.json`
    }

    const blob = new Blob([content], { type: exportFormat === "csv" ? "text/csv" : "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">{error}</p>
            <div className="flex justify-center mt-4">
              <Button
                onClick={reportType === "students" ? fetchStudents : fetchClasses}
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={reportType} onValueChange={(v) => setReportType(v as "students" | "classes")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Calendar className="h-4 w-4 mr-2" />
            Clases
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Estudiantes */}
        <TabsContent value="students" className="space-y-6">
          {/* Controles de Exportación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Reportes de Estudiantes
              </CardTitle>
              <CardDescription>Descarga datos de estudiantes en diferentes formatos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Filtrar por estado</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estudiantes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estudiantes</SelectItem>
                      <SelectItem value="activo">Activos</SelectItem>
                      <SelectItem value="en_curso">En Curso</SelectItem>
                      <SelectItem value="graduado">Graduados</SelectItem>
                      <SelectItem value="inactivo">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Formato de exportación</label>
                  <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "csv" | "json")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleExportStudents}
                  disabled={filteredStudents.length === 0}
                  className="gap-2 transition-all hover:shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Reportes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumen del Reporte
              </CardTitle>
              <CardDescription>
                {status !== "all" ? `Estudiantes con estado: ${status}` : "Resumen general de todos los estudiantes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-muted-foreground font-medium">Total</p>
                  <p className="text-3xl font-bold text-blue-600">{studentsSummary.total}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs text-muted-foreground font-medium">Activos</p>
                  <p className="text-3xl font-bold text-green-600">{studentsSummary.activo}</p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-xs text-muted-foreground font-medium">En Curso</p>
                  <p className="text-3xl font-bold text-yellow-600">{studentsSummary.en_curso}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-xs text-muted-foreground font-medium">Graduados</p>
                  <p className="text-3xl font-bold text-purple-600">{studentsSummary.graduado}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estudiantes Reportados
              </CardTitle>
              <CardDescription>
                {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? "s" : ""} coinciden con los
                criterios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Cédula</TableHead>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No se encontraron estudiantes con los criterios seleccionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-mono text-sm">{student.ci}</TableCell>
                          <TableCell className="font-medium">
                            {student.nombre} {student.apellido}
                          </TableCell>
                          <TableCell className="text-sm">{student.email}</TableCell>
                          <TableCell className="text-sm">{student.telefono}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[student.estado]}>
                              {student.estado.replace("_", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Clases */}
        <TabsContent value="classes" className="space-y-6">
          {/* Controles de Exportación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Reportes de Clases
              </CardTitle>
              <CardDescription>Descarga datos de clases programadas en diferentes formatos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Filtrar por tipo</label>
                  <Select value={classTipo} onValueChange={setClassTipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las clases</SelectItem>
                      <SelectItem value="practica">Prácticas</SelectItem>
                      <SelectItem value="teorica">Teóricas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Formato de exportación</label>
                  <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "csv" | "json")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleExportClasses}
                  disabled={filteredClasses.length === 0}
                  className="gap-2 transition-all hover:shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Reportes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumen del Reporte
              </CardTitle>
              <CardDescription>
                {classTipo !== "all"
                  ? `Clases de tipo: ${classTipo === "practica" ? "Prácticas" : "Teóricas"}`
                  : "Resumen general de todas las clases"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-muted-foreground font-medium">Total</p>
                  <p className="text-3xl font-bold text-blue-600">{classesSummary.total}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-muted-foreground font-medium">Prácticas</p>
                  <p className="text-3xl font-bold text-blue-600">{classesSummary.practica}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-xs text-muted-foreground font-medium">Teóricas</p>
                  <p className="text-3xl font-bold text-purple-600">{classesSummary.teorica}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Clases Reportadas
              </CardTitle>
              <CardDescription>
                {filteredClasses.length} clase{filteredClasses.length !== 1 ? "s" : ""} coinciden con los criterios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Duración</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron clases con los criterios seleccionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClasses.map((classItem) => (
                        <TableRow key={classItem.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium">{formatDate(classItem.fecha)}</TableCell>
                          <TableCell className="text-sm">{classItem.hora}</TableCell>
                          <TableCell className="text-sm">
                            {classItem.estudiante
                              ? `${classItem.estudiante.nombre} ${classItem.estudiante.apellido}`
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {classItem.instructor
                              ? `${classItem.instructor.nombre} ${classItem.instructor.apellido}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge className={tipoColors[classItem.tipo]}>
                              {classItem.tipo === "practica" ? "PRÁCTICA" : "TEÓRICA"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {classItem.categoria_licencia ? (
                              <Badge variant="outline" className="font-mono">
                                {classItem.categoria_licencia}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{classItem.duracion_minutos} min</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
