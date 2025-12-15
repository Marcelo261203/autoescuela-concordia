"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { formatMinutesToHours } from "@/lib/utils/format-hours"
import type { StudentProgress } from "@/lib/types"

interface AdditionalHoursFormProps {
  studentId: string
  progress?: StudentProgress | null
  promedioTeoricas: number
  promedioPracticas: number
  totalTeoricas: number
  totalPracticas: number
  onUpdate?: () => void
}

export function AdditionalHoursForm({
  studentId,
  progress,
  promedioTeoricas,
  promedioPracticas,
  totalTeoricas,
  totalPracticas,
  onUpdate,
}: AdditionalHoursFormProps) {
  const [formData, setFormData] = useState({
    horas_adicionales_practicas: "",
    horas_adicionales_teoricas: "",
  })

  // Actualizar el formulario cuando cambie el progress
  useEffect(() => {
    setFormData({
      horas_adicionales_practicas: progress?.horas_penalizacion_practicas
        ? (progress.horas_penalizacion_practicas / 60).toString()
        : "",
      horas_adicionales_teoricas: progress?.horas_penalizacion_teoricas
        ? (progress.horas_penalizacion_teoricas / 60).toString()
        : "",
    })
  }, [progress])

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const necesitaHorasPracticas = promedioPracticas < 51 && totalPracticas > 0
  const necesitaHorasTeoricas = promedioTeoricas < 51 && totalTeoricas > 0
  
  // Mostrar campos si necesita horas O si ya tiene horas adicionales configuradas
  const tieneHorasPracticas = progress?.horas_penalizacion_practicas && progress.horas_penalizacion_practicas > 0
  const tieneHorasTeoricas = progress?.horas_penalizacion_teoricas && progress.horas_penalizacion_teoricas > 0
  
  const mostrarPracticas = necesitaHorasPracticas || tieneHorasPracticas
  const mostrarTeoricas = necesitaHorasTeoricas || tieneHorasTeoricas
  
  // Verificar si el examen final está calificado
  const examenCalificado = progress?.nota_final !== null && progress?.nota_final !== undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que el examen no esté calificado
    if (examenCalificado) {
      setError("No se pueden modificar las horas adicionales una vez que el examen final ha sido calificado")
      return
    }
    
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Convertir horas a minutos: si el campo está vacío o es 0, usar 0
      // Si tiene valor, convertir de horas a minutos (1 hora = 60 minutos)
      const horasAdicionalesPracticas = formData.horas_adicionales_practicas && formData.horas_adicionales_practicas.trim() !== ""
        ? Math.round(Number.parseFloat(formData.horas_adicionales_practicas) * 60)
        : 0
      const horasAdicionalesTeoricas = formData.horas_adicionales_teoricas && formData.horas_adicionales_teoricas.trim() !== ""
        ? Math.round(Number.parseFloat(formData.horas_adicionales_teoricas) * 60)
        : 0

      // Validar que al menos se agregue horas para el tipo que necesita (solo si no tiene horas ya configuradas)
      if (necesitaHorasPracticas && !tieneHorasPracticas && (!formData.horas_adicionales_practicas || Number.parseFloat(formData.horas_adicionales_practicas) <= 0)) {
        setError("Debes agregar horas adicionales para clases prácticas ya que el promedio no es de aprobación")
        setIsLoading(false)
        return
      }

      if (necesitaHorasTeoricas && !tieneHorasTeoricas && (!formData.horas_adicionales_teoricas || Number.parseFloat(formData.horas_adicionales_teoricas) <= 0)) {
        setError("Debes agregar horas adicionales para clases teóricas ya que el promedio no es de aprobación")
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/progress/${studentId}/additional-hours`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          horas_penalizacion_practicas: horasAdicionalesPracticas,
          horas_penalizacion_teoricas: horasAdicionalesTeoricas,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar horas adicionales")
      }

      setSuccess(true)
      if (onUpdate) {
        onUpdate()
      }

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar horas adicionales")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {examenCalificado && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            El examen final ya ha sido calificado. No se pueden modificar las horas adicionales.
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Horas adicionales guardadas exitosamente
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mostrarPracticas && (
          <div className="space-y-2">
            <Label htmlFor="horas_adicionales_practicas" className="text-orange-800 font-medium">
              Horas Adicionales Prácticas {necesitaHorasPracticas ? "*" : ""}
            </Label>
            <Input
              id="horas_adicionales_practicas"
              type="number"
              min="0"
              step="0.5"
              placeholder="Ej: 2 (horas)"
              value={formData.horas_adicionales_practicas}
              onChange={(e) =>
                setFormData({ ...formData, horas_adicionales_practicas: e.target.value })
              }
              disabled={isLoading || examenCalificado}
              required={necesitaHorasPracticas}
            />
            {totalPracticas > 0 && (
              <p className="text-xs text-muted-foreground">
                Promedio actual: {promedioPracticas.toFixed(1)} (requiere ≥ 51)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {tieneHorasPracticas 
                ? "Edita las horas adicionales que debe completar en clases prácticas"
                : "Horas adicionales que debe completar en clases prácticas para mejorar su promedio"}
            </p>
            {tieneHorasPracticas && (
              <p className="text-xs text-blue-600 font-medium">
                Actualmente configurado: {formatMinutesToHours(progress?.horas_penalizacion_practicas || 0)}
              </p>
            )}
          </div>
        )}

        {mostrarTeoricas && (
          <div className="space-y-2">
            <Label htmlFor="horas_adicionales_teoricas" className="text-orange-800 font-medium">
              Horas Adicionales Teóricas {necesitaHorasTeoricas ? "*" : ""}
            </Label>
            <Input
              id="horas_adicionales_teoricas"
              type="number"
              min="0"
              step="0.5"
              placeholder="Ej: 1 (horas)"
              value={formData.horas_adicionales_teoricas}
              onChange={(e) =>
                setFormData({ ...formData, horas_adicionales_teoricas: e.target.value })
              }
              disabled={isLoading || examenCalificado}
              required={necesitaHorasTeoricas}
            />
            {totalTeoricas > 0 && (
              <p className="text-xs text-muted-foreground">
                Promedio actual: {promedioTeoricas.toFixed(1)} (requiere ≥ 51)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {tieneHorasTeoricas
                ? "Edita las horas adicionales que debe completar en clases teóricas"
                : "Horas adicionales que debe completar en clases teóricas para mejorar su promedio"}
            </p>
            {tieneHorasTeoricas && (
              <p className="text-xs text-blue-600 font-medium">
                Actualmente configurado: {formatMinutesToHours(progress?.horas_penalizacion_teoricas || 0)}
              </p>
            )}
          </div>
        )}
      </div>

      {(mostrarPracticas || mostrarTeoricas) && (
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading || examenCalificado}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Horas Adicionales"
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

