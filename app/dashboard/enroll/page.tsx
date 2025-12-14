"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, UserPlus, Plus, Search } from "lucide-react"
import { StudentForm } from "@/components/students/student-form"
import type { Student, Instructor } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function EnrollPage() {
  const router = useRouter()
  const [step, setStep] = useState<"select" | "configure">("select")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createStudentDialogOpen, setCreateStudentDialogOpen] = useState(false)

  // Datos de configuración del curso
  const [formData, setFormData] = useState({
    instructor_id: "",
    horas_practicas_requeridas: 12, // Horas directas
    horas_teoricas_requeridas: 10, // Horas directas
    fecha_clase_inicial: "",
    hora_clase_inicial: "",
  })

  useEffect(() => {
    fetchStudentsAndInstructors()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId)
      setSelectedStudent(student || null)
    } else {
      setSelectedStudent(null)
    }
  }, [selectedStudentId, students])

  const fetchStudentsAndInstructors = async () => {
    try {
      setIsLoadingData(true)
      const [studentsRes, instructorsRes] = await Promise.all([
        fetch("/api/students?limit=1000&estado=activo"), // Solo estudiantes activos
        fetch("/api/instructors?limit=1000&estado=activo"),
      ])

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        // Filtrar solo estudiantes activos (doble filtro por seguridad)
        const activeStudents = (studentsData.data || []).filter((s: Student) => s.estado === "activo")
        setStudents(activeStudents)
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

  const handleStudentCreated = async (newStudentId: string) => {
    // Recargar estudiantes y seleccionar el nuevo
    await fetchStudentsAndInstructors()
    setSelectedStudentId(newStudentId)
    setCreateStudentDialogOpen(false)
  }

  const handleNext = () => {
    if (!selectedStudentId) {
      setErrors({ student: "Debes seleccionar un estudiante" })
      return
    }

    // Verificar que el estudiante esté en estado "activo"
    if (selectedStudent?.estado !== "activo") {
      setErrors({ 
        student: `Solo se pueden matricular estudiantes con estado "Activo". El estudiante seleccionado tiene estado "${selectedStudent?.estado || "desconocido"}".` 
      })
      return
    }

    setErrors({})
    setStep("configure")
  }

  const handleBack = () => {
    setStep("select")
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validación
    const newErrors: Record<string, string> = {}
    if (!formData.instructor_id) newErrors.instructor_id = "Debes seleccionar un instructor"
    if (!formData.horas_practicas_requeridas || formData.horas_practicas_requeridas < 0) {
      newErrors.horas_practicas_requeridas = "Las horas prácticas deben ser mayor o igual a 0"
    }
    if (!formData.horas_teoricas_requeridas || formData.horas_teoricas_requeridas < 0) {
      newErrors.horas_teoricas_requeridas = "Las horas teóricas deben ser mayor o igual a 0"
    }
    if (!formData.fecha_clase_inicial) {
      newErrors.fecha_clase_inicial = "Debes seleccionar la fecha de la clase inicial"
    }
    if (!formData.hora_clase_inicial) {
      newErrors.hora_clase_inicial = "Debes seleccionar la hora de la clase inicial"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estudiante_id: selectedStudentId,
          instructor_id: formData.instructor_id,
          horas_practicas_requeridas: formData.horas_practicas_requeridas * 60, // Convertir horas a minutos
          horas_teoricas_requeridas: formData.horas_teoricas_requeridas * 60, // Convertir horas a minutos
          fecha_clase_inicial: formData.fecha_clase_inicial,
          hora_clase_inicial: formData.hora_clase_inicial,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ general: errorData.error || "Error al matricular el estudiante" })
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/students")
        router.refresh()
      }, 2000)
    } catch (error) {
      setErrors({ general: "Error al conectar con el servidor. Por favor, intenta nuevamente." })
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.ci.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoadingData) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Matricular Estudiante</h1>
          <p className="text-muted-foreground mt-2">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Matricular Estudiante</h1>
        <p className="text-muted-foreground mt-2">
          {step === "select"
            ? "Selecciona un estudiante para matricular"
            : `Configurar curso para ${selectedStudent?.nombre} ${selectedStudent?.apellido}`}
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Estudiante matriculado exitosamente. El instructor ya puede verlo en su panel.
          </AlertDescription>
        </Alert>
      )}

      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {step === "select" ? (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Seleccionar Estudiante</CardTitle>
            <CardDescription>Busca y selecciona un estudiante o crea uno nuevo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, CI o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Dialog open={createStudentDialogOpen} onOpenChange={setCreateStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Estudiante
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Estudiante</DialogTitle>
                    <DialogDescription>
                      Completa el formulario para crear un nuevo estudiante. Después podrás configurar su matrícula.
                    </DialogDescription>
                  </DialogHeader>
                  <EnrollStudentForm
                    onStudentCreated={handleStudentCreated}
                    onCancel={() => setCreateStudentDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {errors.student && <p className="text-sm text-destructive">{errors.student}</p>}

            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchTerm ? "No se encontraron estudiantes" : "No hay estudiantes disponibles"}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                        selectedStudentId === student.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {student.nombre} {student.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            CI: {student.ci} | Email: {student.email}
                          </p>
                          {student.categoria_licencia_deseada && (
                            <p className="text-xs text-blue-600 mt-1">
                              Categoría: {student.categoria_licencia_deseada}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">{student.estado}</p>
                          {student.estado === "graduado" && (
                            <p className="text-xs text-amber-600">No se puede matricular</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!selectedStudentId || selectedStudent?.estado !== "activo"}>
                Siguiente: Configurar Curso
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Paso 2: Configurar Curso</CardTitle>
            <CardDescription>
              Establece los requisitos del curso y asigna un instructor para {selectedStudent?.nombre}{" "}
              {selectedStudent?.apellido}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="instructor_id">Instructor Asignado *</Label>
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
                          {instructor.tipos_licencias && ` (${instructor.tipos_licencias})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.instructor_id && <p className="text-sm text-destructive">{errors.instructor_id}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horas_practicas_requeridas">Horas Prácticas Requeridas *</Label>
                  <Input
                    id="horas_practicas_requeridas"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.horas_practicas_requeridas}
                    onChange={(e) =>
                      setFormData({ ...formData, horas_practicas_requeridas: Number.parseInt(e.target.value) || 0 })
                    }
                    disabled={isLoading}
                    placeholder="Ej: 12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa la cantidad de horas prácticas requeridas para el curso
                  </p>
                  {errors.horas_practicas_requeridas && (
                    <p className="text-sm text-destructive">{errors.horas_practicas_requeridas}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas_teoricas_requeridas">Horas Teóricas Requeridas *</Label>
                  <Input
                    id="horas_teoricas_requeridas"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.horas_teoricas_requeridas}
                    onChange={(e) =>
                      setFormData({ ...formData, horas_teoricas_requeridas: Number.parseInt(e.target.value) || 0 })
                    }
                    disabled={isLoading}
                    placeholder="Ej: 10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa la cantidad de horas teóricas requeridas para el curso
                  </p>
                  {errors.horas_teoricas_requeridas && (
                    <p className="text-sm text-destructive">{errors.horas_teoricas_requeridas}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_clase_inicial">Fecha de la Clase Inicial *</Label>
                  <Input
                    id="fecha_clase_inicial"
                    type="date"
                    value={formData.fecha_clase_inicial}
                    onChange={(e) => setFormData({ ...formData, fecha_clase_inicial: e.target.value })}
                    disabled={isLoading}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecciona la fecha para la clase introductoria
                  </p>
                  {errors.fecha_clase_inicial && (
                    <p className="text-sm text-destructive">{errors.fecha_clase_inicial}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_clase_inicial">Hora de la Clase Inicial *</Label>
                  <Input
                    id="hora_clase_inicial"
                    type="time"
                    value={formData.hora_clase_inicial}
                    onChange={(e) => setFormData({ ...formData, hora_clase_inicial: e.target.value })}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecciona la hora para la clase introductoria
                  </p>
                  {errors.hora_clase_inicial && (
                    <p className="text-sm text-destructive">{errors.hora_clase_inicial}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                  Volver
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Matriculando..." : "Matricular Estudiante"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente para crear estudiante dentro del diálogo
function EnrollStudentForm({
  onStudentCreated,
  onCancel,
}: {
  onStudentCreated: (studentId: string) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    ci: "",
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    categoria_licencia_deseada: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!formData.ci) newErrors.ci = "La cédula es requerida"
    if (!formData.email) newErrors.email = "El email es requerido"
    if (!formData.nombre) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido) newErrors.apellido = "El apellido es requerido"
    if (!formData.telefono) newErrors.telefono = "El teléfono es requerido"
    if (!formData.direccion) newErrors.direccion = "La dirección es requerida"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          estado: "activo",
          categoria_licencia_deseada: formData.categoria_licencia_deseada || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ general: errorData.error || "Error al crear el estudiante" })
        setIsLoading(false)
        return
      }

      const newStudent = await response.json()
      onStudentCreated(newStudent.id)
    } catch (error) {
      setErrors({ general: "Error al conectar con el servidor. Por favor, intenta nuevamente." })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ci">Cédula de Identidad *</Label>
          <Input
            id="ci"
            value={formData.ci}
            onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
            disabled={isLoading}
          />
          {errors.ci && <p className="text-sm text-destructive">{errors.ci}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            disabled={isLoading}
          />
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input
            id="apellido"
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            disabled={isLoading}
          />
          {errors.apellido && <p className="text-sm text-destructive">{errors.apellido}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            disabled={isLoading}
          />
          {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            disabled={isLoading}
          />
          {errors.fecha_nacimiento && <p className="text-sm text-destructive">{errors.fecha_nacimiento}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="direccion">Dirección *</Label>
          <Input
            id="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            disabled={isLoading}
          />
          {errors.direccion && <p className="text-sm text-destructive">{errors.direccion}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="categoria_licencia_deseada">Categoría de Licencia Deseada</Label>
          <Select
            value={formData.categoria_licencia_deseada || "all"}
            onValueChange={(value) =>
              setFormData({ ...formData, categoria_licencia_deseada: value === "all" ? "" : value })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="categoria_licencia_deseada">
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
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear Estudiante"}
        </Button>
      </div>
    </form>
  )
}

