"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Calendar, BookOpen, User, Trash2, Edit, Clock, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ClassWithDetails } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function InstructorClassesPage() {
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instructorId, setInstructorId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  useEffect(() => {
    fetchInstructorId()
  }, [])

  useEffect(() => {
    if (instructorId) {
      fetchClasses()
    }
  }, [instructorId])

  const fetchInstructorId = async () => {
    try {
      const response = await fetch("/api/auth/role", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setInstructorId(data.instructorId)
      }
    } catch (error) {
      console.error("Error obteniendo ID de instructor:", error)
      setError("Error al obtener información del instructor")
      setIsLoading(false)
    }
  }

  const fetchClasses = async () => {
    if (!instructorId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/classes?instructor_id=${instructorId}`, {
        credentials: "include",
      })
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

  const getEstadoBadge = (estado?: string) => {
    const estados: Record<string, { label: string; className: string }> = {
      agendado: { label: "Agendado", className: "bg-yellow-100 text-yellow-800" },
      por_calificar: { label: "Por Calificar", className: "bg-orange-100 text-orange-800" },
      cursado: { label: "Cursado", className: "bg-green-100 text-green-800" },
      suspendida: { label: "Suspendida", className: "bg-red-100 text-red-800" },
    }
    const estadoInfo = estados[estado || ""] || { label: "Sin estado", className: "bg-gray-100 text-gray-800" }
    return <Badge className={estadoInfo.className}>{estadoInfo.label}</Badge>
  }

  // Verificar si una clase está calificada (no se puede editar ni eliminar)
  const isClassGraded = (clase: ClassWithDetails) => {
    return clase.estado === "cursado" || (clase.nota !== null && clase.nota !== undefined)
  }

  // Verificar si una clase está suspendida (no se puede editar ni eliminar)
  const isClassSuspended = (clase: ClassWithDetails) => {
    return clase.estado === "suspendida"
  }

  // Verificar si una clase puede ser editada o eliminada
  const canEditOrDelete = (clase: ClassWithDetails) => {
    return !isClassGraded(clase) && !isClassSuspended(clase)
  }

  // Verificar si una clase puede ser calificada (ya pasó su horario)
  const canGradeClass = (clase: ClassWithDetails) => {
    try {
      const fechaHoraInicio = new Date(`${clase.fecha}T${clase.hora}`)
      const fechaHoraFin = new Date(fechaHoraInicio.getTime() + (clase.duracion_minutos || 0) * 60 * 1000)
      const ahora = new Date()
      return ahora >= fechaHoraFin
    } catch {
      return false
    }
  }

  // Obtener clases pendientes de calificar (excluyendo suspendidas)
  const pendingClasses = classes.filter((clase) => {
    // Excluir clases suspendidas
    if (clase.estado === "suspendida") {
      return false
    }
    
    const estadoPendiente = clase.estado === "por_calificar"
    const puedeCalificar = canGradeClass(clase) && !isClassGraded(clase)
    return estadoPendiente || puedeCalificar
  })

  const getTipoBadge = (tipo: string) => {
    return (
      <Badge className={tipo === "practica" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
        {tipo === "practica" ? "Práctica" : "Teórica"}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    // La fecha viene como "YYYY-MM-DD" desde la BD
    if (!dateString) return ""
    const parts = dateString.split("T")[0].split("-") // Tomar solo la parte de fecha, ignorar hora si existe
    if (parts.length === 3) {
      const [year, month, day] = parts
      // Crear fecha en hora local para formatear correctamente
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
    // Fallback si el formato no es el esperado
    return dateString
  }

  const handleDelete = async () => {
    if (!selectedClassId) return

    try {
      const response = await fetch(`/api/classes/${selectedClassId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || "Error al eliminar la clase")
        setDeleteDialogOpen(false)
        return
      }

      setDeleteDialogOpen(false)
      fetchClasses()
    } catch (error) {
      console.error("Error deleting class:", error)
      alert("Error al eliminar la clase")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mis Clases</h1>
          <p className="text-muted-foreground mt-2">Clases asignadas a ti</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mis Clases</h1>
          <p className="text-muted-foreground mt-2">Clases asignadas a ti</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Mis Clases</h1>
        <p className="text-muted-foreground mt-2">Clases asignadas a ti</p>
      </div>

      {/* Alerta de clases pendientes de calificar */}
      {pendingClasses.length > 0 && (
        <Link 
          href={`/dashboard/instructor/classes/${pendingClasses[0].id}`} 
          className="block"
        >
          <Alert className="bg-orange-50 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900 font-semibold">
              Tienes {pendingClasses.length} clase{pendingClasses.length !== 1 ? "s" : ""} pendiente{pendingClasses.length !== 1 ? "s" : ""} de calificar
            </AlertTitle>
            <AlertDescription className="text-orange-800 flex items-center gap-2">
              <span>
                {pendingClasses.length === 1 
                  ? "Haz clic aquí para calificar la clase pendiente"
                  : `Haz clic aquí para calificar la primera clase pendiente (${pendingClasses[0].estudiante ? `${pendingClasses[0].estudiante.nombre} ${pendingClasses[0].estudiante.apellido}` : "Clase"} - ${formatDate(pendingClasses[0].fecha)})`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </AlertDescription>
          </Alert>
        </Link>
      )}

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No tienes clases asignadas</p>
              <p className="text-sm text-muted-foreground mt-2">
                Las clases que te asignen aparecerán aquí
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clases</CardTitle>
            <CardDescription>Total: {classes.length} clase{classes.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((clase) => (
                    <TableRow key={clase.id}>
                      <TableCell>
                        {clase.estudiante
                          ? `${clase.estudiante.nombre} ${clase.estudiante.apellido}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getTipoBadge(clase.tipo)}</TableCell>
                      <TableCell>
                        {formatDate(clase.fecha)}
                      </TableCell>
                      <TableCell>{clase.hora}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {clase.duracion_minutos ? `${clase.duracion_minutos} min` : "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(clase.estado)}</TableCell>
                      <TableCell>
                        {clase.nota !== null && clase.nota !== undefined ? (
                          <span className="font-medium">{clase.nota}%</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {clase.observaciones ? (
                          <span className="text-sm text-muted-foreground max-w-xs truncate block" title={clase.observaciones}>
                            {clase.observaciones}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/instructor/classes/${clase.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!canEditOrDelete(clase)}
                              title={
                                isClassGraded(clase) 
                                  ? "No se pueden editar clases calificadas" 
                                  : isClassSuspended(clase)
                                  ? "No se pueden editar clases suspendidas"
                                  : "Editar clase"
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedClassId(clase.id)
                              setDeleteDialogOpen(true)
                            }}
                            disabled={!canEditOrDelete(clase)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              isClassGraded(clase) 
                                ? "No se pueden eliminar clases calificadas" 
                                : isClassSuspended(clase)
                                ? "No se pueden eliminar clases suspendidas"
                                : "Suspender clase"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmación de suspensión */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>¿Suspender clase?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción cambiará el estado de la clase a "Suspendida". La clase no se eliminará del sistema, pero quedará marcada como suspendida.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-red-600">
              Suspender
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

