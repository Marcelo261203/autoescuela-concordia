"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { StudentProgress } from "@/lib/types"
import { formatMinutesToHours } from "@/lib/utils/format-hours"

interface StudentProgressProps {
  studentId: string
}

export function StudentProgressCard({ studentId }: StudentProgressProps) {
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [studentId])

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress || data)
      }
    } catch (error) {
      console.error("Error fetching progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando progreso...</p>
        </CardContent>
      </Card>
    )
  }

  if (!progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Estudiante</CardTitle>
          <CardDescription>No hay progreso registrado aún</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Verificar si el curso está configurado
  const isCourseConfigured = (): boolean => {
    const hasPracticas = !!(progress.horas_practicas_requeridas || progress.clases_practicas_requeridas)
    const hasTeoricas = !!(progress.horas_teoricas_requeridas || progress.clases_teoricas_requeridas)
    return hasPracticas && hasTeoricas
  }

  const courseConfigured = isCourseConfigured()

  // Si el curso no está configurado, mostrar mensaje
  if (!courseConfigured) {
    return (
      <Card className="animate-fade-in border-2 border-dashed border-yellow-300 bg-yellow-50/50">
        <CardHeader>
          <CardTitle>Progreso del Estudiante</CardTitle>
          <CardDescription>El curso aún no ha sido configurado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-3">
            <p className="text-muted-foreground">
              Para ver el progreso, primero debes configurar los requisitos del curso en la sección "Requisitos del Curso".
            </p>
            <p className="text-sm text-muted-foreground">
              Horas realizadas: {formatMinutesToHours(progress.clases_practicas_realizadas + progress.clases_teoricas_realizadas)}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Usar requisitos personalizados si existen, sino usar los legacy (sin defaults)
  const horasPracticasRequeridasBase =
    progress.horas_practicas_requeridas ?? progress.clases_practicas_requeridas ?? 0
  const horasTeoricasRequeridasBase =
    progress.horas_teoricas_requeridas ?? progress.clases_teoricas_requeridas ?? 0

  // Agregar penalización
  const horasPenalizacionPracticas = progress.horas_penalizacion_practicas || 0
  const horasPenalizacionTeoricas = progress.horas_penalizacion_teoricas || 0

  // Requisitos totales = base + penalización
  const horasPracticasRequeridas = horasPracticasRequeridasBase + horasPenalizacionPracticas
  const horasTeoricasRequeridas = horasTeoricasRequeridasBase + horasPenalizacionTeoricas

  // Formatear minutos a formato legible (Xh Ymin)
  const horasPracticasRealizadasDisplay = formatMinutesToHours(progress.clases_practicas_realizadas)
  const horasTeoricasRealizadasDisplay = formatMinutesToHours(progress.clases_teoricas_realizadas)
  const horasPracticasRequeridasDisplay = formatMinutesToHours(horasPracticasRequeridas)
  const horasTeoricasRequeridasDisplay = formatMinutesToHours(horasTeoricasRequeridas)

  const practicasPorcentaje =
    horasPracticasRequeridas > 0
      ? Math.round((progress.clases_practicas_realizadas / horasPracticasRequeridas) * 100)
      : 0
  const teoricasPorcentaje =
    horasTeoricasRequeridas > 0
      ? Math.round((progress.clases_teoricas_realizadas / horasTeoricasRequeridas) * 100)
      : 0

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Progreso del Estudiante</CardTitle>
        <CardDescription>
          Avance en horas requeridas
          {(horasPenalizacionPracticas > 0 || horasPenalizacionTeoricas > 0) && (
            <span className="text-red-600 ml-1">(Incluye penalización)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progreso General */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progreso General</span>
            <span className="text-muted-foreground">{progress.porcentaje_avance}%</span>
          </div>
          <Progress value={progress.porcentaje_avance} className="h-3" />
        </div>

        {/* Clases Prácticas */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Horas Prácticas</span>
            <span className="text-muted-foreground">
              {horasPracticasRealizadasDisplay} / {horasPracticasRequeridasDisplay}
              {horasPenalizacionPracticas > 0 && (
                <span className="text-red-600 ml-1">
                  (+{formatMinutesToHours(horasPenalizacionPracticas)} penalización)
                </span>
              )}
            </span>
          </div>
          <Progress value={Math.min(practicasPorcentaje, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {practicasPorcentaje}% completado
            {progress.clases_practicas_realizadas >= horasPracticasRequeridas && (
              <span className="ml-2 text-green-600 font-semibold">✓ Completado</span>
            )}
          </p>
        </div>

        {/* Clases Teóricas */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Horas Teóricas</span>
            <span className="text-muted-foreground">
              {horasTeoricasRealizadasDisplay} / {horasTeoricasRequeridasDisplay}
              {horasPenalizacionTeoricas > 0 && (
                <span className="text-red-600 ml-1">
                  (+{formatMinutesToHours(horasPenalizacionTeoricas)} penalización)
                </span>
              )}
            </span>
          </div>
          <Progress value={Math.min(teoricasPorcentaje, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {teoricasPorcentaje}% completado
            {progress.clases_teoricas_realizadas >= horasTeoricasRequeridas && (
              <span className="ml-2 text-green-600 font-semibold">✓ Completado</span>
            )}
          </p>
        </div>

        {/* Información de Examen */}
        {progress.nota_final !== null && progress.nota_final !== undefined && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Examen Final</span>
              {progress.aprobado === true ? (
                <span className="text-green-600 font-semibold text-sm">✓ Aprobado</span>
              ) : progress.aprobado === false ? (
                <span className="text-red-600 font-semibold text-sm">✗ Reprobado</span>
              ) : (
                <span className="text-muted-foreground text-sm">Pendiente</span>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nota:</span>
              <span className="font-semibold">{progress.nota_final}/100</span>
            </div>
            {progress.reintentos !== undefined && progress.reintentos > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reintentos:</span>
                <span className="font-semibold">{progress.reintentos}</span>
              </div>
            )}
          </div>
        )}

        {/* Resumen */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Horas Realizadas</p>
              <p className="text-lg font-semibold">
                {formatMinutesToHours(progress.clases_practicas_realizadas + progress.clases_teoricas_realizadas)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Horas Requeridas</p>
              <p className="text-lg font-semibold">
                {formatMinutesToHours(horasPracticasRequeridas + horasTeoricasRequeridas)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

