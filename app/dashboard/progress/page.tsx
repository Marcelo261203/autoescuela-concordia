"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye } from "lucide-react"
import type { Student } from "@/lib/types"
import type { StudentProgress } from "@/lib/types"
import { formatMinutesToHours } from "@/lib/utils/format-hours"

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  graduado: "bg-purple-100 text-purple-800",
  inactivo: "bg-gray-100 text-gray-800",
}

const ITEMS_PER_PAGE = 10

interface StudentWithProgress extends Student {
  progress?: StudentProgress
}

export default function ProgressPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState<string>("")
  const [students, setStudents] = useState<StudentWithProgress[]>([])
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
      const studentsData = data.data || []

      // Obtener progreso para cada estudiante
      const studentsWithProgress = await Promise.all(
        studentsData.map(async (student: Student) => {
          try {
            const progressResponse = await fetch(`/api/progress/${student.id}`)
            if (progressResponse.ok) {
              const progressData = await progressResponse.json()
              return {
                ...student,
                progress: progressData.progress || progressData,
              }
            }
          } catch (error) {
            console.error(`Error fetching progress for student ${student.id}:`, error)
          }
          return { ...student, progress: null }
        }),
      )

      setStudents(studentsWithProgress)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const getProgressPercentage = (progress: StudentProgress | null | undefined) => {
    if (!progress) return 0
    return progress.porcentaje_avance || 0
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Progreso de Estudiantes</h1>
        <p className="text-muted-foreground mt-2">Visualiza y gestiona el avance académico de los estudiantes</p>
      </div>

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
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Estudiante</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Horas Prácticas</TableHead>
              <TableHead className="font-semibold">Horas Teóricas</TableHead>
              <TableHead className="font-semibold">Progreso General</TableHead>
              <TableHead className="font-semibold">Examen</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Cargando progreso...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron estudiantes
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const progress = student.progress
                const horasPracticasRequeridasBase =
                  progress?.horas_practicas_requeridas ?? progress?.clases_practicas_requeridas ?? 720
                const horasTeoricasRequeridasBase =
                  progress?.horas_teoricas_requeridas ?? progress?.clases_teoricas_requeridas ?? 600
                const horasPenalizacionPracticas = progress?.horas_penalizacion_practicas || 0
                const horasPenalizacionTeoricas = progress?.horas_penalizacion_teoricas || 0
                const horasPracticasRequeridas = horasPracticasRequeridasBase + horasPenalizacionPracticas
                const horasTeoricasRequeridas = horasTeoricasRequeridasBase + horasPenalizacionTeoricas

                const horasPracticasRealizadasDisplay = progress
                  ? formatMinutesToHours(progress.clases_practicas_realizadas || 0)
                  : "0min"
                const horasTeoricasRealizadasDisplay = progress 
                  ? formatMinutesToHours(progress.clases_teoricas_realizadas || 0) 
                  : "0min"
                const horasPracticasRequeridasDisplay = formatMinutesToHours(horasPracticasRequeridas)
                const horasTeoricasRequeridasDisplay = formatMinutesToHours(horasTeoricasRequeridas)

                const practicasPorcentaje =
                  horasPracticasRequeridas > 0
                    ? Math.round(((progress?.clases_practicas_realizadas || 0) / horasPracticasRequeridas) * 100)
                    : 0
                const teoricasPorcentaje =
                  horasTeoricasRequeridas > 0
                    ? Math.round(((progress?.clases_teoricas_realizadas || 0) / horasTeoricasRequeridas) * 100)
                    : 0

                return (
                  <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {student.nombre} {student.apellido}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{student.ci}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[student.estado]}>
                        {student.estado.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {progress ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {horasPracticasRealizadasDisplay} / {horasPracticasRequeridasDisplay}
                          </div>
                          <Progress value={Math.min(practicasPorcentaje, 100)} className="h-2" />
                          <div className="text-xs text-muted-foreground">{practicasPorcentaje}%</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin datos</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {progress ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {horasTeoricasRealizadasDisplay} / {horasTeoricasRequeridasDisplay}
                          </div>
                          <Progress value={Math.min(teoricasPorcentaje, 100)} className="h-2" />
                          <div className="text-xs text-muted-foreground">{teoricasPorcentaje}%</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin datos</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {progress ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{getProgressPercentage(progress)}%</div>
                          <Progress value={getProgressPercentage(progress)} className="h-2" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">0%</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {progress?.nota_final !== null && progress?.nota_final !== undefined ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{progress.nota_final}/100</div>
                          {progress.aprobado === true ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">Aprobado</Badge>
                          ) : progress.aprobado === false ? (
                            <Badge className="bg-red-100 text-red-800 text-xs">Reprobado</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin calificar</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/progress/${student.id}`}>
                        <Button size="sm" variant="outline" className="transition-all hover:bg-blue-50">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalle
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
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







