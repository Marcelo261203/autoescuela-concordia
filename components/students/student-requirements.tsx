"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Settings, Lock, BookOpen } from "lucide-react"
import type { StudentProgress } from "@/lib/types"

interface StudentRequirementsProps {
  studentId: string
  progress?: StudentProgress | null
  onUpdate?: () => void
}

export function StudentRequirements({ studentId, progress, onUpdate }: StudentRequirementsProps) {
  const [formData, setFormData] = useState({
    horas_practicas_requeridas: "",
    horas_teoricas_requeridas: "",
    duracion_estandar_minutos: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [examApproved, setExamApproved] = useState(false)

  useEffect(() => {
    if (progress) {
      // Verificar si el estudiante aprobó el examen
      const approved = progress.aprobado === true
      setExamApproved(approved)

      // Solo usar valores si están configurados, no usar defaults
      setFormData({
        horas_practicas_requeridas: progress.horas_practicas_requeridas
          ? (progress.horas_practicas_requeridas / 60).toString()
          : progress.clases_practicas_requeridas
            ? (progress.clases_practicas_requeridas / 60).toString()
            : "",
        horas_teoricas_requeridas: progress.horas_teoricas_requeridas
          ? (progress.horas_teoricas_requeridas / 60).toString()
          : progress.clases_teoricas_requeridas
            ? (progress.clases_teoricas_requeridas / 60).toString()
            : "",
        duracion_estandar_minutos: progress.duracion_estandar_minutos?.toString() || "",
      })
    }
  }, [progress])

  // Verificar si el curso está configurado
  const isCourseConfigured = (): boolean => {
    if (!progress) return false
    
    const hasPracticas = !!(progress.horas_practicas_requeridas || progress.clases_practicas_requeridas)
    const hasTeoricas = !!(progress.horas_teoricas_requeridas || progress.clases_teoricas_requeridas)
    const hasDuracion = !!progress.duracion_estandar_minutos
    
    return hasPracticas && hasTeoricas && hasDuracion
  }

  const courseConfigured = isCourseConfigured()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar si el estudiante aprobó el examen
    if (examApproved) {
      setError("No se pueden modificar los requisitos porque el estudiante ya aprobó el examen.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const horasPracticas = Number.parseFloat(formData.horas_practicas_requeridas)
      const horasTeoricas = Number.parseFloat(formData.horas_teoricas_requeridas)
      const duracionEstandar = Number.parseInt(formData.duracion_estandar_minutos)

      if (isNaN(horasPracticas) || horasPracticas < 0) {
        throw new Error("Las horas prácticas deben ser un número válido")
      }
      if (isNaN(horasTeoricas) || horasTeoricas < 0) {
        throw new Error("Las horas teóricas deben ser un número válido")
      }
      if (isNaN(duracionEstandar) || duracionEstandar < 1) {
        throw new Error("La duración estándar debe ser mayor a 0")
      }

      const response = await fetch(`/api/progress/${studentId}/requirements`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          horas_practicas_requeridas: horasPracticas,
          horas_teoricas_requeridas: horasTeoricas,
          duracion_estandar_minutos: duracionEstandar,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar los requisitos")
      }

      setSuccess(true)
      setIsEditing(false)
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los requisitos")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditing) {
    // Si el curso no está configurado, mostrar opción para configurarlo
    if (!courseConfigured) {
      return (
        <Card className="animate-fade-in border-2 border-dashed border-yellow-300 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-yellow-600" />
              Configurar Curso
            </CardTitle>
            <CardDescription>
              Configura los requisitos del curso para este estudiante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                El curso aún no ha sido configurado. Debes establecer las horas requeridas y la duración estándar de las clases.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => setIsEditing(true)}
              disabled={examApproved}
              className="w-full"
              size="lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Curso
            </Button>
            {examApproved && (
              <p className="text-xs text-center text-muted-foreground">
                No se puede configurar porque el estudiante ya aprobó el examen
              </p>
            )}
          </CardContent>
        </Card>
      )
    }

    // Si el curso está configurado, mostrar la información
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Requisitos del Curso</CardTitle>
              <CardDescription>Configuración del curso para este estudiante</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={examApproved}
            >
              <Settings className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardHeader>
        {examApproved && (
          <CardContent>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                El estudiante ya aprobó el examen. Los requisitos no se pueden modificar.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horas Prácticas Requeridas:</span>
              <span className="font-semibold">
                {progress?.horas_practicas_requeridas
                  ? Math.round((progress.horas_practicas_requeridas / 60) * 10) / 10
                  : progress?.clases_practicas_requeridas
                    ? Math.round((progress.clases_practicas_requeridas / 60) * 10) / 10
                    : "No configurado"}
                {progress?.horas_practicas_requeridas || progress?.clases_practicas_requeridas ? "h" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horas Teóricas Requeridas:</span>
              <span className="font-semibold">
                {progress?.horas_teoricas_requeridas
                  ? Math.round((progress.horas_teoricas_requeridas / 60) * 10) / 10
                  : progress?.clases_teoricas_requeridas
                    ? Math.round((progress.clases_teoricas_requeridas / 60) * 10) / 10
                    : "No configurado"}
                {progress?.horas_teoricas_requeridas || progress?.clases_teoricas_requeridas ? "h" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duración Estándar de Clases:</span>
              <span className="font-semibold">
                {progress?.duracion_estandar_minutos ? `${progress.duracion_estandar_minutos} min` : "No configurado"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{courseConfigured ? "Editar Requisitos del Curso" : "Configurar Curso"}</CardTitle>
        <CardDescription>
          {courseConfigured
            ? "Modifica los requisitos específicos para este estudiante"
            : "Establece los requisitos del curso para este estudiante"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {examApproved && (
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              El estudiante ya aprobó el examen. Los requisitos no se pueden modificar.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Requisitos actualizados exitosamente</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="horas_practicas_requeridas">Horas Prácticas Requeridas</Label>
            <Input
              id="horas_practicas_requeridas"
              type="number"
              min="0"
              step="0.5"
              placeholder="Ej: 12"
              value={formData.horas_practicas_requeridas}
              onChange={(e) => setFormData({ ...formData, horas_practicas_requeridas: e.target.value })}
              disabled={isLoading || examApproved}
              readOnly={examApproved}
              className={examApproved ? "bg-gray-100 cursor-not-allowed" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Total de horas prácticas que debe completar este estudiante
            </p>
            {examApproved && (
              <p className="text-xs text-blue-600 font-medium">
                No se puede modificar porque el estudiante ya aprobó el examen
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="horas_teoricas_requeridas">Horas Teóricas Requeridas</Label>
            <Input
              id="horas_teoricas_requeridas"
              type="number"
              min="0"
              step="0.5"
              placeholder="Ej: 10"
              value={formData.horas_teoricas_requeridas}
              onChange={(e) => setFormData({ ...formData, horas_teoricas_requeridas: e.target.value })}
              disabled={isLoading || examApproved}
              readOnly={examApproved}
              className={examApproved ? "bg-gray-100 cursor-not-allowed" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Total de horas teóricas que debe completar este estudiante
            </p>
            {examApproved && (
              <p className="text-xs text-blue-600 font-medium">
                No se puede modificar porque el estudiante ya aprobó el examen
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion_estandar_minutos">Duración Estándar de Clases (minutos)</Label>
            <Input
              id="duracion_estandar_minutos"
              type="number"
              min="1"
              placeholder="Ej: 60"
              value={formData.duracion_estandar_minutos}
              onChange={(e) => setFormData({ ...formData, duracion_estandar_minutos: e.target.value })}
              disabled={isLoading || examApproved}
              readOnly={examApproved}
              className={examApproved ? "bg-gray-100 cursor-not-allowed" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Duración por defecto para todas las clases de este estudiante (se puede sobrescribir al crear clase)
            </p>
            {examApproved && (
              <p className="text-xs text-blue-600 font-medium">
                No se puede modificar porque el estudiante ya aprobó el examen
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || examApproved} className="flex-1">
              {isLoading
                ? "Guardando..."
                : examApproved
                  ? "No se puede modificar"
                  : courseConfigured
                    ? "Guardar Cambios"
                    : "Configurar Curso"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setError("")
                setSuccess(false)
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

