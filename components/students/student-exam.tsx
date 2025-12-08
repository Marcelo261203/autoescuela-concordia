"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle, Lock } from "lucide-react"
import type { StudentProgress } from "@/lib/types"

interface StudentExamProps {
  studentId: string
  progress?: StudentProgress | null
  onUpdate?: () => void
}

export function StudentExam({ studentId, progress, onUpdate }: StudentExamProps) {
  const [formData, setFormData] = useState({
    nota_final: progress?.nota_final?.toString() || "",
    aprobado: progress?.aprobado ?? null,
    horas_penalizacion_practicas: progress?.horas_penalizacion_practicas
      ? (progress.horas_penalizacion_practicas / 60).toString()
      : "",
    horas_penalizacion_teoricas: progress?.horas_penalizacion_teoricas
      ? (progress.horas_penalizacion_teoricas / 60).toString()
      : "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [canTakeExam, setCanTakeExam] = useState(false)
  const [examMessage, setExamMessage] = useState("")
  const [isExamGraded, setIsExamGraded] = useState(false)

  useEffect(() => {
    if (progress) {
      // Verificar si el examen ya fue calificado
      const graded = progress.nota_final !== null && progress.nota_final !== undefined
      setIsExamGraded(graded)

      setFormData({
        nota_final: progress.nota_final?.toString() || "",
        aprobado: progress.aprobado ?? null,
        horas_penalizacion_practicas: progress.horas_penalizacion_practicas
          ? (progress.horas_penalizacion_practicas / 60).toString()
          : "",
        horas_penalizacion_teoricas: progress.horas_penalizacion_teoricas
          ? (progress.horas_penalizacion_teoricas / 60).toString()
          : "",
      })

      // Verificar si el estudiante completó todas sus horas requeridas
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

      const completado = horasPracticasCompletadas && horasTeoricasCompletadas

      setCanTakeExam(completado)

      if (!completado) {
        const horasPracticasFaltantes = Math.max(0, horasPracticasRequeridas - progress.clases_practicas_realizadas)
        const horasTeoricasFaltantes = Math.max(0, horasTeoricasRequeridas - progress.clases_teoricas_realizadas)
        const horasPracticasFaltantesDisplay = Math.round((horasPracticasFaltantes / 60) * 10) / 10
        const horasTeoricasFaltantesDisplay = Math.round((horasTeoricasFaltantes / 60) * 10) / 10

        let mensaje = "El estudiante debe completar todas sus horas requeridas antes de poder calificar el examen.\n\n"
        if (horasPracticasFaltantes > 0) {
          mensaje += `Faltan ${horasPracticasFaltantesDisplay}h de clases prácticas. `
        }
        if (horasTeoricasFaltantes > 0) {
          mensaje += `Faltan ${horasTeoricasFaltantesDisplay}h de clases teóricas.`
        }
        setExamMessage(mensaje.trim())
      } else {
        setExamMessage("")
      }
    }
  }, [progress])

  const handleNotaChange = (nota: string) => {
    const notaNum = Number.parseFloat(nota)
    let aprobado: boolean | null = null

    if (!isNaN(notaNum)) {
      if (notaNum >= 51) {
        aprobado = true
      } else if (notaNum <= 50 && notaNum >= 0) {
        aprobado = false
      }
    }

    setFormData({
      ...formData,
      nota_final: nota,
      aprobado,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar si el examen ya fue calificado
    if (isExamGraded) {
      setError("El examen ya fue calificado y no se puede modificar la nota.")
      return
    }
    
    // Verificar si puede tomar el examen
    if (!canTakeExam) {
      setError("No se puede calificar el examen hasta que el estudiante complete todas sus horas requeridas.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const notaNum = formData.nota_final ? Number.parseFloat(formData.nota_final) : null
      const horasPenalizacionPracticas = formData.horas_penalizacion_practicas
        ? Math.round(Number.parseFloat(formData.horas_penalizacion_practicas) * 60)
        : 0
      const horasPenalizacionTeoricas = formData.horas_penalizacion_teoricas
        ? Math.round(Number.parseFloat(formData.horas_penalizacion_teoricas) * 60)
        : 0

      // Determinar aprobado basado en nota
      let aprobado: boolean | null = null
      if (notaNum !== null) {
        if (notaNum >= 51) {
          aprobado = true
        } else if (notaNum <= 50) {
          aprobado = false
        }
      }

      // Calcular reintentos (si reprobó y ya tenía reintentos, incrementar)
      const reintentos = progress?.reintentos || 0
      const nuevosReintentos = aprobado === false ? reintentos + 1 : reintentos

      const response = await fetch(`/api/progress/${studentId}/exam`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nota_final: notaNum,
          aprobado,
          reintentos: nuevosReintentos,
          horas_penalizacion_practicas: horasPenalizacionPracticas,
          horas_penalizacion_teoricas: horasPenalizacionTeoricas,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar el examen")
      }

      setSuccess(true)
      if (onUpdate) {
        onUpdate()
      }

      // Actualizar progreso después de guardar examen
      await fetch(`/api/progress/${studentId}/update`, { method: "POST" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el examen")
    } finally {
      setIsLoading(false)
    }
  }

  const getAprobadoStatus = () => {
    if (formData.aprobado === null) return null
    if (formData.aprobado === true) return "aprobado"
    return "reprobado"
  }

  const status = getAprobadoStatus()

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Examen Final</CardTitle>
        <CardDescription>Registra la nota del examen y aplica penalización si es necesario</CardDescription>
      </CardHeader>
      <CardContent>
        {isExamGraded && (
          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              El examen ya fue calificado. La nota no se puede modificar.
            </AlertDescription>
          </Alert>
        )}

        {!canTakeExam && examMessage && !isExamGraded && (
          <Alert className="bg-yellow-50 border-yellow-200 mb-6">
            <Lock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 whitespace-pre-line">{examMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Examen guardado exitosamente</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Nota del Examen */}
          <div className="space-y-2">
            <Label htmlFor="nota_final">Nota del Examen (0-100)</Label>
            <Input
              id="nota_final"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Ej: 75.5"
              value={formData.nota_final}
              onChange={(e) => handleNotaChange(e.target.value)}
              disabled={isLoading || !canTakeExam || isExamGraded}
              readOnly={isExamGraded}
              className={isExamGraded ? "bg-gray-100 cursor-not-allowed" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Nota mínima para aprobar: 51 puntos. 50 o menos = reprobado
            </p>
            {!canTakeExam && !isExamGraded && (
              <p className="text-xs text-yellow-600 font-medium">
                Complete todas las horas requeridas para habilitar el examen
              </p>
            )}
            {isExamGraded && (
              <p className="text-xs text-blue-600 font-medium">
                El examen ya fue calificado. No se puede modificar la nota.
              </p>
            )}
          </div>

          {/* Estado de Aprobación */}
          {status && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex items-center gap-2">
                {status === "aprobado" ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-semibold">APROBADO</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-semibold">REPROBADO</span>
                  </>
                )}
              </div>
              {progress?.reintentos !== undefined && progress.reintentos > 0 && (
                <p className="text-xs text-muted-foreground">Reintentos: {progress.reintentos}</p>
              )}
            </div>
          )}

          {/* Penalización (solo si reprobó) */}
          {status === "reprobado" && !isExamGraded && (
            <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="horas_penalizacion_practicas" className="text-red-800">
                  Horas Extra Prácticas (por reprobar)
                </Label>
                <Input
                  id="horas_penalizacion_practicas"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Ej: 2 (horas)"
                  value={formData.horas_penalizacion_practicas}
                  onChange={(e) =>
                    setFormData({ ...formData, horas_penalizacion_practicas: e.target.value })
                  }
                  disabled={isLoading || !canTakeExam || isExamGraded}
                />
                <p className="text-xs text-muted-foreground">
                  Horas adicionales que debe completar en clases prácticas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horas_penalizacion_teoricas" className="text-red-800">
                  Horas Extra Teóricas (por reprobar)
                </Label>
                <Input
                  id="horas_penalizacion_teoricas"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Ej: 1 (horas)"
                  value={formData.horas_penalizacion_teoricas}
                  onChange={(e) =>
                    setFormData({ ...formData, horas_penalizacion_teoricas: e.target.value })
                  }
                  disabled={isLoading || !canTakeExam || isExamGraded}
                />
                <p className="text-xs text-muted-foreground">
                  Horas adicionales que debe completar en clases teóricas
                </p>
              </div>
            </div>
          )}

          {/* Mostrar penalización si ya fue calificado */}
          {isExamGraded && status === "reprobado" && (
            <div className="space-y-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Penalización aplicada:</p>
              {formData.horas_penalizacion_practicas && Number.parseFloat(formData.horas_penalizacion_practicas) > 0 && (
                <p className="text-sm text-gray-600">
                  Horas extra prácticas: {formData.horas_penalizacion_practicas}h
                </p>
              )}
              {formData.horas_penalizacion_teoricas && Number.parseFloat(formData.horas_penalizacion_teoricas) > 0 && (
                <p className="text-sm text-gray-600">
                  Horas extra teóricas: {formData.horas_penalizacion_teoricas}h
                </p>
              )}
            </div>
          )}

          <Button type="submit" disabled={isLoading || !canTakeExam || isExamGraded} className="w-full">
            {isLoading
              ? "Guardando..."
              : isExamGraded
                ? "Examen ya calificado"
                : canTakeExam
                  ? "Guardar Examen"
                  : "Complete las horas requeridas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

