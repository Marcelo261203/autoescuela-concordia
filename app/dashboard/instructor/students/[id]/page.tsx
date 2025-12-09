"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Clock, ArrowLeft, Loader2, Award } from "lucide-react"
import Link from "next/link"
import type { Student, ClassWithDetails, StudentProgress } from "@/lib/types"
import { StudentProgressCard } from "@/components/students/student-progress"

const tipoColors: Record<string, string> = {
  practica: "bg-blue-100 text-blue-800",
  teorica: "bg-purple-100 text-purple-800",
}

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  graduado: "bg-purple-100 text-purple-800",
  inactivo: "bg-gray-100 text-gray-800",
}

export default function InstructorStudentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instructorId, setInstructorId] = useState<string | null>(null)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ nota: string; observaciones: string }>({ nota: "", observaciones: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchInstructorId()
  }, [])

  useEffect(() => {
    if (instructorId) {
      fetchStudentAndClasses()
    }
  }, [id, instructorId])

  const fetchInstructorId = async () => {
    try {
      const response = await fetch("/api/auth/role", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setInstructorId(data.instructorId)
      }
    } catch (error) {
      console.error("Error obteniendo ID de instructor:", error)
    }
  }

  const fetchStudentAndClasses = async () => {
    if (!instructorId) return

    try {
      setIsLoading(true)
      // Obtener estudiante (solo si tiene clases con este instructor)
      const studentsRes = await fetch("/api/instructor/students", { credentials: "include" })
      if (!studentsRes.ok) {
        setError("Error al cargar estudiantes")
        setIsLoading(false)
        return
      }
      const studentsData = await studentsRes.json()
      const studentFound = studentsData.data?.find((s: Student) => s.id === id)

      if (!studentFound) {
        setError("Estudiante no encontrado o no asignado a tus clases")
        setIsLoading(false)
        return
      }

      setStudent(studentFound)

      // Obtener clases del estudiante (solo las del instructor actual)
      const classesRes = await fetch(`/api/classes?estudiante_id=${id}&instructor_id=${instructorId}&limit=1000`, {
        credentials: "include",
      })
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        const sortedClasses = (classesData.data || []).sort((a: ClassWithDetails, b: ClassWithDetails) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`)
          const dateB = new Date(`${b.fecha}T${b.hora}`)
          return dateB.getTime() - dateA.getTime()
        })
        setClasses(sortedClasses)
      }

      // Obtener progreso
      const progressRes = await fetch(`/api/progress/${id}`, { credentials: "include" })
      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgress(progressData.progress || progressData)
      }
    } catch (err) {
      console.error("Error fetching student or classes:", err)
      setError(err instanceof Error ? err.message : "Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const canGradeClass = (clase: ClassWithDetails): boolean => {
    try {
      const fechaHoraInicio = new Date(`${clase.fecha}T${clase.hora}`)
      const fechaHoraFin = new Date(fechaHoraInicio.getTime() + clase.duracion_minutos * 60 * 1000)
      const ahora = new Date()
      return ahora >= fechaHoraFin
    } catch {
      return false
    }
  }

  const handleStartEdit = (clase: ClassWithDetails) => {
    // Validar que el estudiante no esté graduado
    if (student?.estado === "graduado") {
      setSaveError("No se pueden editar calificaciones de estudiantes graduados")
      return
    }
    
    setEditingClassId(clase.id)
    setFormData({
      nota: clase.nota?.toString() || "",
      observaciones: clase.observaciones || "",
    })
    setSaveError("")
    setSaveSuccess(false)
  }

  const handleCancelEdit = () => {
    setEditingClassId(null)
    setFormData({ nota: "", observaciones: "" })
    setSaveError("")
    setSaveSuccess(false)
  }

  const handleSaveGrade = async (classId: string) => {
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      // Validar que el estudiante no esté graduado
      if (student?.estado === "graduado") {
        setSaveError("No se pueden editar calificaciones de estudiantes graduados")
        setIsSaving(false)
        return
      }

      if (!formData.nota || !formData.observaciones.trim()) {
        setSaveError("La nota y las observaciones son requeridas para calificar")
        setIsSaving(false)
        return
      }

      const notaNum = Number.parseFloat(formData.nota)
      if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
        setSaveError("La nota debe ser un número entre 0 y 100")
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nota: notaNum,
          observaciones: formData.observaciones,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar la calificación")
      }

      setSaveSuccess(true)
      setEditingClassId(null)
      setFormData({ nota: "", observaciones: "" })

      setTimeout(() => {
        fetchStudentAndClasses()
      }, 500)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar la calificación")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Estudiante</h1>
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <Link href="/dashboard/instructor/students">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">{error || "Estudiante no encontrado"}</p>
        </div>
      </div>
    )
  }

  const pendingClasses = classes.filter((c) => c.estado === "por_calificar")
  const gradedClasses = classes.filter((c) => c.estado === "cursado")
  const upcomingClasses = classes.filter((c) => c.estado === "agendado")

  // Calcular promedios
  const calculateAverages = () => {
    const clasesConNota = gradedClasses.filter((c) => c.nota !== null && c.nota !== undefined)
    if (clasesConNota.length === 0) {
      return {
        promedioTeoricas: 0,
        promedioPracticas: 0,
        promedioGeneral: 0,
        totalTeoricas: 0,
        totalPracticas: 0,
      }
    }

    const clasesTeoricas = clasesConNota.filter((c) => c.tipo === "teorica")
    const clasesPracticas = clasesConNota.filter((c) => c.tipo === "practica")

    const promedioTeoricas =
      clasesTeoricas.length > 0
        ? Math.round((clasesTeoricas.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesTeoricas.length) * 10) / 10
        : 0
    const promedioPracticas =
      clasesPracticas.length > 0
        ? Math.round((clasesPracticas.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesPracticas.length) * 10) / 10
        : 0
    const promedioGeneral = Math.round((clasesConNota.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesConNota.length) * 10) / 10

    return {
      promedioTeoricas,
      promedioPracticas,
      promedioGeneral,
      totalTeoricas: clasesTeoricas.length,
      totalPracticas: clasesPracticas.length,
    }
  }

  const { promedioTeoricas, promedioPracticas, promedioGeneral, totalTeoricas, totalPracticas } = calculateAverages()

  const formatDate = (dateString: string, options?: { weekday?: boolean }) => {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    // La fecha viene como "YYYY-MM-DD" desde la BD
    if (!dateString) return ""
    const parts = dateString.split("T")[0].split("-") // Tomar solo la parte de fecha, ignorar hora si existe
    if (parts.length === 3) {
      const [year, month, day] = parts
      // Crear fecha en hora local para formatear correctamente
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      const formatOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      if (options?.weekday) {
        formatOptions.weekday = "long"
      }
      return date.toLocaleDateString("es-ES", formatOptions)
    }
    // Fallback si el formato no es el esperado
    return dateString
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/instructor/students">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {student.nombre} {student.apellido}
          </h1>
          <p className="text-muted-foreground mt-2">Información del estudiante y calificaciones</p>
        </div>
      </div>

      {/* Información del Estudiante */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Estudiante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">CI</Label>
              <p className="font-medium">{student.ci}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{student.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Teléfono</Label>
              <p className="font-medium">{student.telefono}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Estado</Label>
              <Badge className={statusColors[student.estado] || "bg-gray-100 text-gray-800"}>
                {student.estado.toUpperCase()}
              </Badge>
            </div>
            {student.categoria_licencia_deseada && (
              <div>
                <Label className="text-muted-foreground">Categoría de Licencia</Label>
                <p className="font-medium text-2xl text-blue-600">{student.categoria_licencia_deseada}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progreso del Estudiante */}
      {progress && <StudentProgressCard studentId={id} />}

      {/* Promedios */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Promedios de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground">Teóricas</p>
              <p className="text-3xl font-bold text-blue-600">
                {promedioTeoricas > 0 ? promedioTeoricas.toFixed(1) : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{totalTeoricas} clase{totalTeoricas !== 1 ? "s" : ""}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground">Prácticas</p>
              <p className="text-3xl font-bold text-blue-600">
                {promedioPracticas > 0 ? promedioPracticas.toFixed(1) : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{totalPracticas} clase{totalPracticas !== 1 ? "s" : ""}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground">General</p>
              <p className="text-3xl font-bold text-blue-600">
                {promedioGeneral > 0 ? promedioGeneral.toFixed(1) : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalTeoricas + totalPracticas} clase{totalTeoricas + totalPracticas !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clases por Calificar */}
      {pendingClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Clases por Calificar ({pendingClasses.length})
            </CardTitle>
            <CardDescription>
              Clases que requieren calificación
              {student?.estado === "graduado" && (
                <span className="block mt-1 text-amber-600 font-medium">
                  ⚠️ Este estudiante está graduado. No se pueden calificar nuevas clases.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingClasses.map((clase) => (
              <div key={clase.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={tipoColors[clase.tipo]}>
                      {clase.tipo === "practica" ? "Práctica" : "Teórica"}
                    </Badge>
                    <span className="font-medium">
                        {formatDate(clase.fecha, { weekday: true })}
                    </span>
                    <span className="text-muted-foreground">{clase.hora}</span>
                  </div>
                  {editingClassId === clase.id ? (
                    <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                      Cancelar
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStartEdit(clase)}
                      disabled={!canGradeClass(clase) || student?.estado === "graduado"}
                      title={student?.estado === "graduado" ? "No se pueden calificar clases de estudiantes graduados" : !canGradeClass(clase) ? "Aún no se puede calificar" : ""}
                    >
                      {student?.estado === "graduado" 
                        ? "Estudiante graduado" 
                        : canGradeClass(clase) 
                        ? "Calificar" 
                        : "Aún no se puede calificar"}
                    </Button>
                  )}
                </div>

                {editingClassId === clase.id && (
                  <div className="space-y-3 pt-3 border-t">
                    {saveError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{saveError}</AlertDescription>
                      </Alert>
                    )}
                    {saveSuccess && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">Calificación guardada exitosamente</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`nota-${clase.id}`}>Nota (0-100) *</Label>
                        <Input
                          id={`nota-${clase.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.nota}
                          onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                          disabled={isSaving}
                          placeholder="Ej: 85"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`observaciones-${clase.id}`}>Observaciones *</Label>
                        <Textarea
                          id={`observaciones-${clase.id}`}
                          value={formData.observaciones}
                          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                          disabled={isSaving}
                          placeholder="Observaciones sobre la clase..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancelar
                      </Button>
                      <Button onClick={() => handleSaveGrade(clase.id)} disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar Calificación"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Clases Calificadas */}
      {gradedClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clases Calificadas ({gradedClasses.length})</CardTitle>
            <CardDescription>
              Historial de clases ya calificadas
              {student?.estado === "graduado" && (
                <span className="block mt-1 text-amber-600 font-medium">
                  ⚠️ Este estudiante está graduado. No se pueden editar las calificaciones.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gradedClasses.map((clase) => (
                <div key={clase.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={tipoColors[clase.tipo]}>
                        {clase.tipo === "practica" ? "Práctica" : "Teórica"}
                      </Badge>
                      <span className="text-sm">
                        {formatDate(clase.fecha)} - {clase.hora}
                      </span>
                      <span className="font-medium text-blue-600">{clase.nota}%</span>
                    </div>
                    {editingClassId === clase.id ? (
                      <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancelar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(clase)}
                        disabled={editingClassId !== null || student?.estado === "graduado"}
                        title={student?.estado === "graduado" ? "No se pueden editar calificaciones de estudiantes graduados" : ""}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                  {!editingClassId || editingClassId !== clase.id ? (
                    clase.observaciones && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Observaciones:</span> {clase.observaciones}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3 pt-3 border-t">
                      {saveError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{saveError}</AlertDescription>
                        </Alert>
                      )}
                      {saveSuccess && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">Calificación actualizada exitosamente</AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`nota-edit-${clase.id}`}>Nota (0-100) *</Label>
                          <Input
                            id={`nota-edit-${clase.id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.nota}
                            onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                            disabled={isSaving}
                            placeholder="Ej: 85"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`observaciones-edit-${clase.id}`}>Observaciones *</Label>
                          <Textarea
                            id={`observaciones-edit-${clase.id}`}
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            disabled={isSaving}
                            placeholder="Observaciones sobre la clase..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                          Cancelar
                        </Button>
                        <Button onClick={() => handleSaveGrade(clase.id)} disabled={isSaving}>
                          {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clases Agendadas */}
      {upcomingClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clases Agendadas ({upcomingClasses.length})</CardTitle>
            <CardDescription>Próximas clases programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingClasses.map((clase) => (
                <div key={clase.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={tipoColors[clase.tipo]}>
                      {clase.tipo === "practica" ? "Práctica" : "Teórica"}
                    </Badge>
                    <span className="text-sm">
                        {formatDate(clase.fecha, { weekday: true })}
                    </span>
                    <span className="text-muted-foreground">{clase.hora}</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Agendada</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {classes.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No hay clases asignadas</p>
              <p className="text-sm text-muted-foreground mt-2">
                Este estudiante aún no tiene clases asignadas contigo
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

