"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Lock, Clock } from "lucide-react"
import type { Class } from "@/lib/types"
import type { Student } from "@/lib/types"
import type { Instructor } from "@/lib/types"

interface ClassFormProps {
  isEdit?: boolean
  classData?: Class
  instructorMode?: boolean // Si es true, solo muestra estudiantes del instructor y asigna instructor_id automáticamente
}

export function ClassForm({ isEdit = false, classData, instructorMode = false }: ClassFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    estudiante_id: classData?.estudiante_id || "",
    instructor_id: classData?.instructor_id || "",
    tipo: classData?.tipo || "practica",
    categoria_licencia: classData?.categoria_licencia || "",
    fecha: classData?.fecha ? classData.fecha.split("T")[0] : "",
    hora: classData?.hora || "",
    duracion_minutos: classData?.duracion_minutos || 60,
    observaciones: classData?.observaciones || "",
    estado: classData?.estado || "agendado",
    nota: classData?.nota?.toString() || "",
  })

  const [students, setStudents] = useState<Student[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [currentInstructorId, setCurrentInstructorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [canGrade, setCanGrade] = useState(false)
  const [isGraded, setIsGraded] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      if (instructorMode) {
        await fetchInstructorId()
      } else {
        fetchStudentsAndInstructors()
      }
    }
    fetchInitialData()
  }, [instructorMode])

  useEffect(() => {
    if (instructorMode && currentInstructorId) {
      // Asignar automáticamente el instructor_id si no está en modo edición o si no hay instructor_id en classData
      if (!isEdit || !classData?.instructor_id) {
        setFormData((prev) => ({ ...prev, instructor_id: currentInstructorId }))
      }
      fetchInstructorStudents()
    }
  }, [instructorMode, currentInstructorId, isEdit, classData])

  const fetchInstructorId = async () => {
    try {
      const response = await fetch("/api/auth/role", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setCurrentInstructorId(data.instructorId)
      }
    } catch (error) {
      console.error("Error obteniendo ID de instructor:", error)
    }
  }

  const fetchInstructorStudents = async () => {
    if (!currentInstructorId) return
    try {
      // Filtrar estudiantes graduados automáticamente
      const response = await fetch("/api/instructor/students", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        // Filtro adicional en el frontend para asegurar que no se muestren graduados
        const activeStudents = (data.data || []).filter(
          (student: Student) => student.estado !== "graduado"
        )
        setStudents(activeStudents)
        setIsLoadingData(false)
      }
    } catch (error) {
      console.error("Error fetching instructor students:", error)
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    // Verificar si la clase puede ser calificada
    if (isEdit && classData && formData.fecha && formData.hora && formData.duracion_minutos) {
      try {
        // Crear fecha/hora de inicio de la clase
        const fechaHoraInicio = new Date(`${formData.fecha}T${formData.hora}`)
        
        // Calcular fecha/hora de finalización (inicio + duración)
        const fechaHoraFin = new Date(fechaHoraInicio.getTime() + formData.duracion_minutos * 60 * 1000)
        
        // Verificar si la fecha/hora actual es posterior a la fecha/hora de finalización
        const ahora = new Date()
        const canGradeResult = ahora >= fechaHoraFin
        setCanGrade(canGradeResult)
        setIsGraded(classData.estado === "cursado")
      } catch (error) {
        console.error("Error verificando si clase puede ser calificada:", error)
        setCanGrade(false)
      }
    }
  }, [isEdit, classData, formData.fecha, formData.hora, formData.duracion_minutos])

  const fetchStudentsAndInstructors = async () => {
    try {
      const [studentsRes, instructorsRes] = await Promise.all([
        fetch("/api/students?limit=1000"),
        fetch("/api/instructors?limit=1000"),
      ])

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData.data || [])
      }

      if (instructorsRes.ok) {
        const instructorsData = await instructorsRes.json()
        setInstructors(instructorsData.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleStudentChange = async (studentId: string) => {
    setFormData({ ...formData, estudiante_id: studentId })

    // Si se selecciona un estudiante, cargar su duración estándar y categoría de licencia
    if (studentId) {
      try {
        // Cargar información del estudiante para obtener su categoría de licencia deseada
        const studentRes = await fetch(`/api/students/${studentId}`)
        if (studentRes.ok) {
          const studentData = await studentRes.json()
          
          // Validar que el estudiante no esté graduado (validación de seguridad)
          if (studentData?.estado === "graduado") {
            setErrors({ 
              general: `No se pueden agendar clases para estudiantes graduados. El estudiante ${studentData.nombre} ${studentData.apellido} ya está graduado.` 
            })
            setFormData((prev) => ({ ...prev, estudiante_id: "" }))
            return
          }
          
          if (studentData?.categoria_licencia_deseada) {
            setFormData((prev) => ({
              ...prev,
              categoria_licencia: studentData.categoria_licencia_deseada,
            }))
          }
        }

        // Cargar progreso para obtener duración estándar
        if (!isEdit) {
          const progressRes = await fetch(`/api/progress/${studentId}`)
          if (progressRes.ok) {
            const progressData = await progressRes.json()
            const progress = progressData.progress || progressData
            if (progress?.duracion_estandar_minutos) {
              setFormData((prev) => ({
                ...prev,
                duracion_minutos: progress.duracion_estandar_minutos,
              }))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validación
    const newErrors: Record<string, string> = {}
    if (!formData.estudiante_id) newErrors.estudiante_id = "El estudiante es requerido"
    if (!instructorMode && !formData.instructor_id) newErrors.instructor_id = "El instructor es requerido"
    if (instructorMode && !currentInstructorId) {
      newErrors.general = "No se pudo obtener tu información de instructor"
    }
    if (!formData.fecha) newErrors.fecha = "La fecha es requerida"
    if (!formData.hora) newErrors.hora = "La hora es requerida"
    if (!formData.duracion_minutos || formData.duracion_minutos < 1) {
      newErrors.duracion_minutos = "La duración debe ser mayor a 0"
    }

    // Si se está calificando la clase, validar que tenga nota y observaciones
    if (isEdit && canGrade && !isGraded && formData.nota) {
      const notaNum = Number.parseFloat(formData.nota)
      if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
        newErrors.nota = "La nota debe ser un número entre 0 y 100"
      }
      if (!formData.observaciones || formData.observaciones.trim() === "") {
        newErrors.observaciones = "Las observaciones son requeridas al calificar la clase"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      // Validar conflicto de fecha y hora y horas excedidas antes de crear/actualizar
      const conflictCheck = await fetch("/api/classes/check-conflict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha: formData.fecha,
          hora: formData.hora,
          estudiante_id: formData.estudiante_id,
          instructor_id: instructorMode ? currentInstructorId : formData.instructor_id,
          tipo: formData.tipo,
          duracion_minutos: formData.duracion_minutos,
          excludeId: isEdit && classData?.id ? classData.id : undefined,
        }),
      })

      if (conflictCheck.ok) {
        const conflictData = await conflictCheck.json()
        if (conflictData.conflict) {
          setErrors({ general: conflictData.message })
          setIsLoading(false)
          return
        }
        if (conflictData.exceeded) {
          setErrors({ general: conflictData.message })
          setIsLoading(false)
          return
        }
      }

      const url = isEdit && classData?.id ? `/api/classes/${classData.id}` : "/api/classes"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estudiante_id: formData.estudiante_id,
          instructor_id: instructorMode ? currentInstructorId : formData.instructor_id,
          tipo: formData.tipo,
          categoria_licencia: formData.categoria_licencia || null,
          // Asegurar que la fecha se envíe como YYYY-MM-DD sin conversión de zona horaria
          fecha: formData.fecha ? formData.fecha.split('T')[0] : formData.fecha,
          hora: formData.hora,
          duracion_minutos: formData.duracion_minutos,
          observaciones: formData.observaciones,
          estado: formData.estado,
          nota: formData.nota ? Number.parseFloat(formData.nota) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ general: errorData.error || "Error al guardar la clase" })
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        const redirectPath = instructorMode ? "/dashboard/instructor/classes" : "/dashboard/classes"
        router.push(redirectPath)
        router.refresh()
      }, 1500)
    } catch (error) {
      setErrors({ general: "Error al conectar con el servidor. Por favor, intenta nuevamente." })
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando datos...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Clase" : "Crear Nueva Clase"}</CardTitle>
        <CardDescription>
          {isEdit ? "Actualiza la información de la clase" : "Completa el formulario para programar una nueva clase"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {isEdit ? "Clase actualizada exitosamente" : "Clase creada exitosamente"}
              </AlertDescription>
            </Alert>
          )}

          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {Object.keys(errors).filter((key) => key !== "general").length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Por favor corrige los errores en el formulario</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estudiante_id">Estudiante *</Label>
              <Select
                value={formData.estudiante_id}
                onValueChange={handleStudentChange}
                disabled={isLoading}
              >
                <SelectTrigger id="estudiante_id">
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nombre} {student.apellido} - {student.ci}
                      {student.categoria_licencia_deseada && ` (${student.categoria_licencia_deseada})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estudiante_id && <p className="text-sm text-destructive">{errors.estudiante_id}</p>}
            </div>

            {!instructorMode && (
              <div className="space-y-2">
                <Label htmlFor="instructor_id">Instructor *</Label>
                <Select
                  value={formData.instructor_id}
                  onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="instructor_id">
                    <SelectValue placeholder="Selecciona un instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors
                      .filter((instructor) => instructor.estado === "activo")
                      .map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.nombre} {instructor.apellido} - {instructor.especialidad}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.instructor_id && <p className="text-sm text-destructive">{errors.instructor_id}</p>}
              </div>
            )}
            {instructorMode && (
              <div className="space-y-2">
                <Label htmlFor="instructor_id">Instructor</Label>
                <Input
                  id="instructor_id"
                  value="Tú (asignado automáticamente)"
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Clase *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value as "practica" | "teorica" })}
                disabled={isLoading}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practica">Práctica</SelectItem>
                  <SelectItem value="teorica">Teórica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria_licencia">Categoría de Licencia</Label>
              <Select
                value={formData.categoria_licencia || "all"}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoria_licencia: value === "all" ? "" : value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="categoria_licencia">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sin categoría</SelectItem>
                  <SelectItem value="M">M - Moto</SelectItem>
                  <SelectItem value="P">P - Particular (Auto)</SelectItem>
                  <SelectItem value="A">A - Autobús</SelectItem>
                  <SelectItem value="B">B - Bus/Camión</SelectItem>
                  <SelectItem value="C">C - Profesional (Top)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                disabled={isLoading}
              />
              {errors.fecha && <p className="text-sm text-destructive">{errors.fecha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                disabled={isLoading}
              />
              {errors.hora && <p className="text-sm text-destructive">{errors.hora}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion_minutos">Duración (minutos) *</Label>
              <Input
                id="duracion_minutos"
                type="number"
                min="1"
                value={formData.duracion_minutos}
                onChange={(e) => setFormData({ ...formData, duracion_minutos: Number.parseInt(e.target.value) || 0 })}
                disabled={isLoading}
              />
              {errors.duracion_minutos && <p className="text-sm text-destructive">{errors.duracion_minutos}</p>}
            </div>
          </div>

          {/* Estado de la clase */}
          {isEdit && (
            <div className="space-y-2">
              <Label>Estado de la Clase</Label>
              <div className="flex items-center gap-2">
                {formData.estado === "cursado" ? (
                  <Badge className="bg-green-100 text-green-800">CURSADO</Badge>
                ) : formData.estado === "por_calificar" ? (
                  <Badge className="bg-yellow-100 text-yellow-800">POR CALIFICAR</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">AGENDADO</Badge>
                )}
              </div>
            </div>
          )}

          {/* Sección de calificación (solo si está en "por_calificar" o puede ser calificada) */}
          {isEdit && (formData.estado === "por_calificar" || (canGrade && !isGraded)) && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Calificar Clase</h3>
              </div>
              <p className="text-sm text-blue-800 mb-4">
                La clase ya pasó su horario. Puedes calificar el desempeño del estudiante.
              </p>

              <div className="space-y-2">
                <Label htmlFor="nota">Nota (0-100) *</Label>
                <Input
                  id="nota"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Ej: 85.5"
                  value={formData.nota}
                  onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                  disabled={isLoading || isGraded}
                  className={isGraded ? "bg-gray-100 cursor-not-allowed" : ""}
                />
                {errors.nota && <p className="text-sm text-destructive">{errors.nota}</p>}
                <p className="text-xs text-muted-foreground">
                  Califica el desempeño del estudiante en esta clase
                </p>
              </div>
            </div>
          )}

          {/* Mostrar nota si ya está calificada */}
          {isEdit && isGraded && (
            <div className="space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Clase Calificada</h3>
              </div>
              {formData.nota && (
                <div className="space-y-1">
                  <Label>Nota:</Label>
                  <p className="text-lg font-semibold text-green-800">{formData.nota}/100</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">
              Observaciones {isEdit && canGrade && !isGraded ? "*" : ""}
            </Label>
            <Textarea
              id="observaciones"
              placeholder={
                isEdit && canGrade && !isGraded
                  ? "Observaciones sobre el desempeño del estudiante en la clase..."
                  : "Notas adicionales sobre la clase"
              }
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              disabled={isLoading || (isEdit && isGraded)}
              readOnly={isEdit && isGraded}
              className={isEdit && isGraded ? "bg-gray-100 cursor-not-allowed" : ""}
              rows={3}
            />
            {errors.observaciones && <p className="text-sm text-destructive">{errors.observaciones}</p>}
            {isEdit && isGraded && (
              <p className="text-xs text-blue-600 font-medium">
                La clase ya fue calificada. Las observaciones no se pueden modificar.
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isLoading} className="transition-all">
              {isLoading ? (isEdit ? "Actualizando..." : "Creando...") : isEdit ? "Actualizar" : "Crear"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

