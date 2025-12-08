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
import { Edit, Trash2, Search, Plus } from "lucide-react"
import type { Student } from "@/lib/types"

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  graduado: "bg-purple-100 text-purple-800",
  inactivo: "bg-gray-100 text-gray-800",
}

const ITEMS_PER_PAGE = 10

export function StudentList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [page, search, estado])

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      })
      if (search) params.append("search", search)
      if (estado) params.append("estado", estado)

      const response = await fetch(`/api/students?${params}`)
      if (!response.ok) throw new Error("Error al cargar estudiantes")

      const data = await response.json()
      setStudents(data.data || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/students/${selectedId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.hasClasses) {
          // Si tiene clases, mostrar confirmación adicional
          const confirmDelete = window.confirm(
            `${errorData.error}\n\n¿Desea continuar con la eliminación?`,
          )
          if (confirmDelete) {
            // Hacer segunda llamada para forzar eliminación
            const forceResponse = await fetch(`/api/students/${selectedId}?force=true`, {
              method: "DELETE",
            })
            if (!forceResponse.ok) {
              const forceError = await forceResponse.json()
              alert(forceError.error || "Error al eliminar el estudiante")
              return
            }
          } else {
            setDeleteDialogOpen(false)
            return
          }
        } else {
          const errorData = await response.json()
          alert(errorData.error || "Error al eliminar el estudiante")
          setDeleteDialogOpen(false)
          return
        }
      }

    setDeleteDialogOpen(false)
      fetchStudents()
      router.refresh()
    } catch (error) {
      console.error("Error deleting student:", error)
      alert("Error al eliminar el estudiante")
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:gap-4 flex-1">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por CI, email, nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={estado || "all"} onValueChange={(value) => setEstado(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="en_curso">En Curso</SelectItem>
              <SelectItem value="graduado">Graduado</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/dashboard/students/create">
          <Button className="w-full md:w-auto gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Estudiante
          </Button>
        </Link>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Cédula</TableHead>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Teléfono</TableHead>
              <TableHead className="font-semibold">Categoría</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Cargando estudiantes...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron estudiantes
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
              <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-sm">{student.ci}</TableCell>
                <TableCell className="font-medium">
                    {student.nombre} {student.apellido}
                </TableCell>
                <TableCell className="text-sm">{student.email}</TableCell>
                  <TableCell className="text-sm">{student.telefono}</TableCell>
                  <TableCell>
                    {student.categoria_licencia_deseada ? (
                      <Badge variant="outline" className="font-mono">
                        {student.categoria_licencia_deseada}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                <TableCell>
                    <Badge className={statusColors[student.estado]}>
                      {student.estado.replace("_", " ").toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/students/${student.id}`}>
                      <Button size="sm" variant="outline" className="transition-all hover:bg-blue-50 bg-transparent">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedId(student.id)
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
          <AlertDialogTitle>¿Eliminar estudiante?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El estudiante será eliminado permanentemente del sistema.
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
