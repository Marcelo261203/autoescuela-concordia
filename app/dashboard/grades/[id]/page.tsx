"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Clock, ArrowLeft, Loader2, Award, XCircle } from "lucide-react"
import Link from "next/link"
import type { Student, ClassWithDetails, StudentProgress } from "@/lib/types"

const tipoColors: Record<string, string> = {
  practica: "bg-blue-100 text-blue-800",
  teorica: "bg-purple-100 text-purple-800",
}

export default function StudentGradesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ nota: string; observaciones: string }>({ nota: "", observaciones: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchStudentAndClasses()
  }, [id])

  const fetchStudentAndClasses = async () => {
    try {
      setIsLoading(true)
      const [studentRes, classesRes, progressRes] = await Promise.all([
        fetch(`/api/students/${id}`),
        fetch(`/api/classes?estudiante_id=${id}&limit=1000`),
        fetch(`/api/progress/${id}`),
      ])

      if (!studentRes.ok) {
        if (studentRes.status === 404) {
          setError("Estudiante no encontrado")
        } else {
          setError("Error al cargar el estudiante")
        }
        setIsLoading(false)
        return
      }
      const studentData = await studentRes.json()
      setStudent(studentData)

      if (classesRes.ok) {
        const classesData = await classesRes.json()
        // Ordenar clases: más recientes primero, y separar por estado
        const sortedClasses = (classesData.data || []).sort((a: ClassWithDetails, b: ClassWithDetails) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`)
          const dateB = new Date(`${b.fecha}T${b.hora}`)
          return dateB.getTime() - dateA.getTime()
        })
        setClasses(sortedClasses)
      } else {
        setClasses([])
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgress(progressData.progress || progressData)
      } else {
        setProgress(null)
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

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const parts = dateString.split("T")[0].split("-")
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`
    }
    return dateString
  }

  const handleStartEdit = (clase: ClassWithDetails) => {
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
      // Validación
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
      
      // Recargar clases
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
          <h1 className="text-3xl font-bold">Calificaciones</h1>
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">{error || "Estudiante no encontrado"}</p>
        </div>
      </div>
    )
  }

  const pendingClasses = classes.filter((c) => c.estado === "por_calificar")
  const gradedClasses = classes.filter((c) => c.estado === "cursado")
  const upcomingClasses = classes.filter((c) => c.estado === "agendado")

  // Calcular promedio de notas por tipo
  const calculateAverages = (): {
    promedioTeoricas: number
    promedioPracticas: number
    totalTeoricas: number
    totalPracticas: number
    promedioGeneral: number
    totalClases: number
  } => {
    const clasesConNota = gradedClasses.filter((c) => c.nota !== null && c.nota !== undefined)
    
    if (clasesConNota.length === 0) {
      return {
        promedioTeoricas: 0,
        promedioPracticas: 0,
        totalTeoricas: 0,
        totalPracticas: 0,
        promedioGeneral: 0,
        totalClases: 0,
      }
    }

    const clasesTeoricas = clasesConNota.filter((c) => c.tipo === "teorica")
    const clasesPracticas = clasesConNota.filter((c) => c.tipo === "practica")

    const sumaTeoricas = clasesTeoricas.reduce((sum, c) => sum + (c.nota || 0), 0)
    const sumaPracticas = clasesPracticas.reduce((sum, c) => sum + (c.nota || 0), 0)
    const sumaTotal = sumaTeoricas + sumaPracticas

    const promedioTeoricas =
      clasesTeoricas.length > 0 ? Math.round((sumaTeoricas / clasesTeoricas.length) * 10) / 10 : 0
    const promedioPracticas =
      clasesPracticas.length > 0 ? Math.round((sumaPracticas / clasesPracticas.length) * 10) / 10 : 0
    const promedioGeneral = Math.round((sumaTotal / clasesConNota.length) * 10) / 10

    return {
      promedioTeoricas,
      promedioPracticas,
      totalTeoricas: clasesTeoricas.length,
      totalPracticas: clasesPracticas.length,
      promedioGeneral,
      totalClases: clasesConNota.length,
    }
  }

  const {
    promedioTeoricas,
    promedioPracticas,
    totalTeoricas,
    totalPracticas,
    promedioGeneral,
    totalClases,
  } = calculateAverages()

  // Verificar si puede rendir el examen final
  // Requisitos: 1) Completar todas las horas, 2) Promedio teóricas >= 51, 3) Promedio prácticas >= 51
  const canTakeFinalExam = (): { canTake: boolean; message: string; reasons: string[] } => {
    if (!progress) {
      return {
        canTake: false,
        message: "No hay información de progreso disponible",
        reasons: ["No hay información de progreso"],
      }
    }

    const reasons: string[] = []

    // 1. Verificar horas completadas
    const horasPracticasRequeridasBase =
      progress.horas_practicas_requeridas ?? progress.clases_practicas_requeridas ?? 720
    const horasTeoricasRequeridasBase =
      progress.horas_teoricas_requeridas ?? progress.clases_teoricas_requeridas ?? 600

    const horasPenalizacionPracticas = progress.horas_penalizacion_practicas || 0
    const horasPenalizacionTeoricas = progress.horas_penalizacion_teoricas || 0

    const horasPracticasRequeridas = horasPracticasRequeridasBase + horasPenalizacionPracticas
    const horasTeoricasRequeridas = horasTeoricasRequeridasBase + horasPenalizacionTeoricas

    const horasPracticasCompletadas = progress.clases_practicas_realizadas >= horasPracticasRequeridas
    const horasTeoricasCompletadas = progress.clases_teoricas_realizadas >= horasTeoricasRequeridas

    if (!horasPracticasCompletadas) {
      const horasFaltantes = Math.round(
        ((horasPracticasRequeridas - progress.clases_practicas_realizadas) / 60) * 10,
      ) / 10
      reasons.push(`Faltan ${horasFaltantes}h de clases prácticas`)
    }

    if (!horasTeoricasCompletadas) {
      const horasFaltantes = Math.round(
        ((horasTeoricasRequeridas - progress.clases_teoricas_realizadas) / 60) * 10,
      ) / 10
      reasons.push(`Faltan ${horasFaltantes}h de clases teóricas`)
    }

    // 2. Verificar promedios de aprobación (>= 51)
    const teoricasAprobadas = totalTeoricas > 0 && promedioTeoricas >= 51
    const practicasAprobadas = totalPracticas > 0 && promedioPracticas >= 51

    if (totalTeoricas === 0) {
      reasons.push("No tiene clases teóricas calificadas")
    } else if (!teoricasAprobadas) {
      reasons.push(`Promedio de teóricas (${promedioTeoricas}) es menor a 51. Necesita más sesiones.`)
    }

    if (totalPracticas === 0) {
      reasons.push("No tiene clases prácticas calificadas")
    } else if (!practicasAprobadas) {
      reasons.push(`Promedio de prácticas (${promedioPracticas}) es menor a 51. Necesita más sesiones.`)
    }

    const canTake = horasPracticasCompletadas && horasTeoricasCompletadas && teoricasAprobadas && practicasAprobadas

    let message = ""
    if (canTake) {
      message = "El estudiante cumple todos los requisitos y puede rendir el examen final."
    } else {
      message = "El estudiante no puede rendir el examen final:\n\n" + reasons.join("\n")
    }

    return { canTake, message, reasons }
  }

  const examStatus = canTakeFinalExam()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/grades">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Calificaciones de {student.nombre} {student.apellido}</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las calificaciones de las clases de este estudiante
          </p>
        </div>
      </div>

      {/* Promedio y Examen Final */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Promedio y Examen Final
              </CardTitle>
              <CardDescription>Promedio de clases y calificación del examen final</CardDescription>
            </div>
            {student?.categoria_licencia_deseada && (
              <div className="flex flex-col items-center justify-center bg-white rounded-lg p-4 shadow-md border-2 border-blue-300">
                <Label className="text-xs font-medium text-muted-foreground mb-1">Categoría</Label>
                <div className="text-6xl font-bold text-blue-600 leading-none">
                  {student.categoria_licencia_deseada}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Promedio de Clases Teóricas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Promedio Clases Teóricas</Label>
              {totalTeoricas > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${promedioTeoricas >= 51 ? "text-green-600" : "text-red-600"}`}>
                      {promedioTeoricas}
                    </span>
                    <span className="text-xl text-muted-foreground">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {promedioTeoricas >= 51 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">APROBADO</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-semibold text-red-600">REPROBADO</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Basado en {totalTeoricas} {totalTeoricas === 1 ? "clase" : "clases"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg text-muted-foreground">Sin calificaciones</p>
                  <p className="text-xs text-muted-foreground">Aún no hay clases teóricas calificadas</p>
                </div>
              )}
            </div>

            {/* Promedio de Clases Prácticas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Promedio Clases Prácticas</Label>
              {totalPracticas > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${promedioPracticas >= 51 ? "text-green-600" : "text-red-600"}`}>
                      {promedioPracticas}
                    </span>
                    <span className="text-xl text-muted-foreground">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {promedioPracticas >= 51 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">APROBADO</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-semibold text-red-600">REPROBADO</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Basado en {totalPracticas} {totalPracticas === 1 ? "clase" : "clases"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg text-muted-foreground">Sin calificaciones</p>
                  <p className="text-xs text-muted-foreground">Aún no hay clases prácticas calificadas</p>
                </div>
              )}
            </div>

            {/* Examen Final */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Examen Final</Label>
              {progress?.nota_final !== null && progress?.nota_final !== undefined ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-purple-600">{progress.nota_final}</span>
                    <span className="text-xl text-muted-foreground">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {progress.aprobado === true ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">APROBADO</span>
                      </>
                    ) : progress.aprobado === false ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">REPROBADO</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Pendiente</span>
                    )}
                  </div>
                  {progress.reintentos !== undefined && progress.reintentos > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Reintentos: {progress.reintentos}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">Sin calificar</p>
                  {examStatus.canTake ? (
                    <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                      ✓ Puede rendir el examen
                    </p>
                  ) : (
                    <p className="text-xs text-red-700 bg-red-50 p-2 rounded whitespace-pre-line">
                      {examStatus.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Estado para Examen Final */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Habilitado para Examen Final</Label>
              {progress?.aprobado === true ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">Graduado</span>
                  </div>
                  <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    El estudiante ha completado todas las horas, aprobado los promedios y el examen final.
                  </p>
                </div>
              ) : progress?.nota_final !== null && progress?.nota_final !== undefined ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-lg font-semibold text-yellow-600">Examen Calificado</span>
                  </div>
                  <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                    {progress.aprobado === false
                      ? "Reprobó el examen. Debe completar horas adicionales."
                      : "Examen aprobado. Pendiente graduación."}
                  </p>
                </div>
              ) : examStatus.canTake ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">Habilitado</span>
                  </div>
                  <p className="text-xs text-green-700 bg-green-50 p-2 rounded whitespace-pre-line">
                    {examStatus.message}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-lg font-semibold text-red-600">No Habilitado</span>
                  </div>
                  <div className="text-xs text-red-700 bg-red-50 p-2 rounded space-y-1">
                    <p className="font-semibold mb-1">Requisitos faltantes:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {examStatus.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Promedio teóricas:</span>
                <span className="ml-2 font-semibold">
                  {totalTeoricas > 0 ? `${promedioTeoricas}/100` : "N/A"}
                  {totalTeoricas > 0 && (
                    <span className={`ml-1 ${promedioTeoricas >= 51 ? "text-green-600" : "text-red-600"}`}>
                      {promedioTeoricas >= 51 ? "✓" : "✗"}
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Promedio prácticas:</span>
                <span className="ml-2 font-semibold">
                  {totalPracticas > 0 ? `${promedioPracticas}/100` : "N/A"}
                  {totalPracticas > 0 && (
                    <span className={`ml-1 ${promedioPracticas >= 51 ? "text-green-600" : "text-red-600"}`}>
                      {promedioPracticas >= 51 ? "✓" : "✗"}
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Examen final:</span>
                <span className="ml-2 font-semibold">
                  {progress?.nota_final !== null && progress?.nota_final !== undefined
                    ? `${progress.nota_final}/100`
                    : "Sin calificar"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total clases:</span>
                <span className="ml-2 font-semibold">
                  {totalClases} ({totalTeoricas} teóricas, {totalPracticas} prácticas)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clases Pendientes de Calificar */}
      {pendingClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Clases Pendientes de Calificar ({pendingClasses.length})
            </CardTitle>
            <CardDescription>
              Clases que ya pasaron su horario y están listas para calificar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingClasses.map((clase) => (
              <Card key={clase.id} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-6">
                  {editingClassId === clase.id ? (
                    <div className="space-y-4">
                      {saveError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{saveError}</AlertDescription>
                        </Alert>
                      )}
                      {saveSuccess && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Calificación guardada exitosamente
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">
                            {formatDate(clase.fecha)} - {clase.hora}
                          </p>
                          <Badge className={tipoColors[clase.tipo]}>
                            {clase.tipo === "practica" ? "PRÁCTICA" : "TEÓRICA"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            Duración: {clase.duracion_minutos} min
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`nota-${clase.id}`}>Nota (0-100) *</Label>
                            <Input
                              id={`nota-${clase.id}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="Ej: 85.5"
                              value={formData.nota}
                              onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                              disabled={isSaving}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`obs-${clase.id}`}>Observaciones *</Label>
                            <Textarea
                              id={`obs-${clase.id}`}
                              placeholder="Observaciones sobre el desempeño del estudiante..."
                              value={formData.observaciones}
                              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                              disabled={isSaving}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveGrade(clase.id)}
                              disabled={isSaving}
                              className="flex-1"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                "Guardar Calificación"
                              )}
                            </Button>
                            <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">
                            {formatDate(clase.fecha)} - {clase.hora}
                          </p>
                          <Badge className={tipoColors[clase.tipo]}>
                            {clase.tipo === "practica" ? "PRÁCTICA" : "TEÓRICA"}
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            POR CALIFICAR
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Duración: {clase.duracion_minutos} min | Instructor:{" "}
                          {clase.instructor
                            ? `${clase.instructor.nombre} ${clase.instructor.apellido}`
                            : "N/A"}
                        </p>
                      </div>
                      <Button onClick={() => handleStartEdit(clase)} variant="outline" size="sm">
                        Calificar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Clases Calificadas */}
      {gradedClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Clases Calificadas ({gradedClasses.length})
            </CardTitle>
            <CardDescription>Clases que ya fueron calificadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gradedClasses.map((clase) => (
                <div
                  key={clase.id}
                  className="flex items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">
                        {formatDate(clase.fecha)} - {clase.hora}
                      </p>
                      <Badge className={tipoColors[clase.tipo]}>
                        {clase.tipo === "practica" ? "PRÁCTICA" : "TEÓRICA"}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">CURSADO</Badge>
                      {clase.nota !== null && clase.nota !== undefined && (
                        <Badge variant="outline" className="font-semibold">
                          Nota: {clase.nota}/100
                        </Badge>
                      )}
                    </div>
                    {clase.observaciones && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Observaciones:</span> {clase.observaciones}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Duración: {clase.duracion_minutos} min | Instructor:{" "}
                      {clase.instructor
                        ? `${clase.instructor.nombre} ${clase.instructor.apellido}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clases Futuras */}
      {upcomingClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clases Programadas ({upcomingClasses.length})</CardTitle>
            <CardDescription>Clases que aún no han sido realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.map((clase) => (
                <div
                  key={clase.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">
                        {formatDate(clase.fecha)} - {clase.hora}
                      </p>
                      <Badge className={tipoColors[clase.tipo]}>
                        {clase.tipo === "practica" ? "PRÁCTICA" : "TEÓRICA"}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        AGENDADO
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duración: {clase.duracion_minutos} min | Instructor:{" "}
                      {clase.instructor
                        ? `${clase.instructor.nombre} ${clase.instructor.apellido}`
                        : "N/A"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    Pendiente
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sin clases */}
      {classes.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Este estudiante no tiene clases registradas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

