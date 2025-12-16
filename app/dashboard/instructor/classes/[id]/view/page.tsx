"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { ClassWithDetails } from "@/lib/types"
import { Loader2, ArrowLeft, Calendar, Clock, User, BookOpen, Award, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const tipoColors: Record<string, string> = {
  practica: "bg-blue-100 text-blue-800",
  teorica: "bg-purple-100 text-purple-800",
}

const estadoColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-800",
  por_calificar: "bg-yellow-100 text-yellow-800",
  cursado: "bg-green-100 text-green-800",
  suspendida: "bg-red-100 text-red-800",
}

const estadoLabels: Record<string, string> = {
  agendado: "Agendada",
  por_calificar: "Por Calificar",
  cursado: "Cursada",
  suspendida: "Suspendida",
}

export default function InstructorClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [classData, setClassData] = useState<ClassWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClass()
  }, [id])

  const fetchClass = async () => {
    try {
      const response = await fetch(`/api/classes/${id}`, {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 404) {
          setError("Clase no encontrada")
        } else if (response.status === 403) {
          setError("No tienes permiso para ver esta clase")
        } else {
          setError("Error al cargar la clase")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setClassData(data)
    } catch (error) {
      console.error("Error fetching class:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Detalles de la Clase</h1>
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/instructor/classes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive text-lg font-medium">{error || "Clase no encontrada"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/instructor/classes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Detalles de la Clase</h1>
          <p className="text-muted-foreground mt-2">Información completa de la clase</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={tipoColors[classData.tipo]}>
            {classData.tipo === "practica" ? "PRÁCTICA" : "TEÓRICA"}
          </Badge>
          <Badge className={estadoColors[classData.estado || "agendado"]}>
            {estadoLabels[classData.estado || "agendado"]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Información Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Fecha:</span>
              </div>
              <p className="text-lg font-semibold">{formatDate(classData.fecha)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Hora:</span>
              </div>
              <p className="text-lg font-semibold">{classData.hora}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Duración:</span>
              </div>
              <p className="text-lg font-semibold">{classData.duracion_minutos} minutos</p>
            </div>

            {classData.categoria_licencia && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">Categoría de Licencia:</span>
                </div>
                <Badge variant="outline" className="font-mono text-lg">
                  {classData.categoria_licencia}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Estudiante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classData.estudiante ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Nombre:</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {classData.estudiante.nombre} {classData.estudiante.apellido}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">CI:</span>
                  </div>
                  <p className="text-lg font-semibold">{classData.estudiante.ci}</p>
                </div>

                <div className="pt-4 border-t">
                  <Link href={`/dashboard/instructor/students/${classData.estudiante.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Perfil del Estudiante
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Información del estudiante no disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calificación y Observaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Calificación
            </CardTitle>
            <CardDescription>
              {classData.estado === "cursado" && classData.nota !== null && classData.nota !== undefined
                ? "Clase ya calificada"
                : classData.estado === "por_calificar"
                  ? "Pendiente de calificación"
                  : "Aún no calificable"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classData.estado === "cursado" && classData.nota !== null && classData.nota !== undefined ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="text-6xl font-bold text-blue-600">{classData.nota}%</div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-muted-foreground">Calificación registrada</span>
                </div>
              </div>
            ) : classData.estado === "por_calificar" ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <AlertCircle className="h-12 w-12 text-yellow-600" />
                <p className="text-center text-muted-foreground">
                  Esta clase está pendiente de calificación
                </p>
                <Link href={`/dashboard/instructor/classes/${id}`}>
                  <Button>Calificar Clase</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Clock className="h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  Esta clase aún no se ha realizado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classData.observaciones ? (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{classData.observaciones}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay observaciones registradas</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      {classData.estado !== "cursado" && classData.estado !== "suspendida" && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>Gestiona esta clase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href={`/dashboard/instructor/classes/${id}`}>
                <Button>Editar Clase</Button>
              </Link>
              <Link href="/dashboard/instructor/classes">
                <Button variant="outline">Volver a Mis Clases</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




