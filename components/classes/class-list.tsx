"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus } from "lucide-react"
import type { ClassWithDetails, Student } from "@/lib/types"

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

const ITEMS_PER_PAGE = 10

export function ClassList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [tipo, setTipo] = useState<string>("")
  const [estudianteId, setEstudianteId] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>("")
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    fetchClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tipo, estudianteId])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchClasses = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      })
      if (tipo) params.append("tipo", tipo)
      if (estudianteId) params.append("estudiante_id", estudianteId)

      const response = await fetch(`/api/classes?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al cargar clases")
      }

      const data = await response.json()
      setClasses(data.data || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching classes:", error)
      setError(error instanceof Error ? error.message : "Error al cargar clases")
      setClasses([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/classes/${selectedId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar clase")
      }

      setDeleteDialogOpen(false)
      fetchClasses()
      router.refresh()
    } catch (error) {
      console.error("Error deleting class:", error)
      alert("Error al eliminar la clase")
    }
  }

  const formatDate = (dateString: string) => {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    // La fecha viene como "YYYY-MM-DD" desde la BD
    if (!dateString) return ""
    const parts = dateString.split("T")[0].split("-") // Tomar solo la parte de fecha, ignorar hora si existe
    if (parts.length === 3) {
      const [year, month, day] = parts
      // Formatear como DD-MM-YYYY
      return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`
    }
    // Fallback si el formato no es el esperado
    const date = new Date(dateString + "T12:00:00") // Usar mediodía para evitar problemas de zona horaria
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filtros */}
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:gap-4 flex-1">
            <Select
              value={estudianteId || "all"}
              onValueChange={(value) => {
                setEstudianteId(value === "all" ? "" : value)
                setPage(1) // Resetear a primera página al cambiar filtro
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos los estudiantes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estudiantes</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.nombre} {student.apellido} - {student.ci}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={tipo || "all"}
              onValueChange={(value) => {
                setTipo(value === "all" ? "" : value)
                setPage(1) // Resetear a primera página al cambiar filtro
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="practica">Práctica</SelectItem>
                <SelectItem value="teorica">Teórica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/dashboard/classes/create">
            <Button className="w-full md:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Nueva Clase
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold">Hora</TableHead>
              <TableHead className="font-semibold">Estudiante</TableHead>
              <TableHead className="font-semibold">Instructor</TableHead>
              <TableHead className="font-semibold">Categoría</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Duración</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Cargando clases...
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No se encontraron clases
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <TableRow key={classItem.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium">{formatDate(classItem.fecha)}</TableCell>
                  <TableCell className="text-sm">{classItem.hora}</TableCell>
                  <TableCell className="text-sm">
                    {classItem.estudiante
                      ? `${classItem.estudiante.nombre} ${classItem.estudiante.apellido}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {classItem.instructor
                      ? `${classItem.instructor.nombre} ${classItem.instructor.apellido}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {classItem.categoria_licencia ? (
                      <Badge variant="outline" className="font-mono">
                        {classItem.categoria_licencia}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={tipoColors[classItem.tipo]}>
                      {classItem.tipo === "practica" ? "PRÁCTICA" : "TEÓRICA"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{classItem.duracion_minutos} min</TableCell>
                  <TableCell>
                    <Badge className={estadoColors[classItem.estado || "agendado"]}>
                      {classItem.estado === "cursado"
                        ? "CURSADO"
                        : classItem.estado === "por_calificar"
                          ? "POR CALIFICAR"
                          : classItem.estado === "suspendida"
                            ? "SUSPENDIDA"
                            : "AGENDADO"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/classes/${classItem.id}`}>
                        <Button size="sm" variant="outline" className="transition-all hover:bg-blue-50 bg-transparent">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedId(classItem.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="transition-all hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
                className={page === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink onClick={() => setPage(i + 1)} isActive={page === i + 1} className="cursor-pointer">
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className={page === totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La clase será eliminada permanentemente del sistema.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

