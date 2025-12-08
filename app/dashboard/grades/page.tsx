"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ClipboardList, Loader2 } from "lucide-react"
import type { Student } from "@/lib/types"

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  graduado: "bg-purple-100 text-purple-800",
  inactivo: "bg-gray-100 text-gray-800",
}

const ITEMS_PER_PAGE = 10

export default function GradesListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [page, search, estado])

  const fetchStudents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      })
      if (search) params.append("search", search)
      if (estado) params.append("estado", estado)

      const studentsResponse = await fetch(`/api/students?${params}`)
      if (!studentsResponse.ok) throw new Error("Error al cargar estudiantes")
      const studentsData = await studentsResponse.json()
      setStudents(studentsData.data || [])
      setTotal(studentsData.total || 0)
    } catch (err) {
      console.error("Error fetching students:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setStudents([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Calificaciones de Clases</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las calificaciones de las clases de cada estudiante
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:gap-4 flex-1">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por CI, email, nombre..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-8"
            />
          </div>
          <Select
            value={estado || "all"}
            onValueChange={(value) => {
              setEstado(value === "all" ? "" : value)
              setPage(1)
            }}
          >
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
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Cédula</TableHead>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando estudiantes...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                  <TableCell>
                    <Badge className={statusColors[student.estado]}>
                      {student.estado.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/grades/${student.id}`}>
                        <Button size="sm" variant="outline" className="transition-all hover:bg-blue-50 bg-transparent">
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Notas
                        </Button>
                      </Link>
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
    </div>
  )
}





