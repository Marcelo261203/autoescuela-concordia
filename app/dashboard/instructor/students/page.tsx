"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, User, Eye } from "lucide-react"
import Link from "next/link"
import type { Student } from "@/lib/types"

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  graduado: "bg-purple-100 text-purple-800",
  inactivo: "bg-gray-100 text-gray-800",
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    // Filtrar localmente por búsqueda
    if (!search) {
      setFilteredStudents(students)
    } else {
      const searchLower = search.toLowerCase()
      setFilteredStudents(
        students.filter(
          (student) =>
            student.nombre.toLowerCase().includes(searchLower) ||
            student.apellido.toLowerCase().includes(searchLower) ||
            student.ci.toLowerCase().includes(searchLower) ||
            student.email.toLowerCase().includes(searchLower),
        ),
      )
    }
  }, [search, students])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/instructor/students", {
        credentials: "include",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al cargar estudiantes")
      }
      const data = await response.json()
      setStudents(data.data || [])
      setFilteredStudents(data.data || [])
    } catch (err) {
      console.error("Error fetching students:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mis Estudiantes</h1>
          <p className="text-muted-foreground mt-2">Estudiantes asignados a tus clases</p>
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
          <h1 className="text-3xl font-bold">Mis Estudiantes</h1>
          <p className="text-muted-foreground mt-2">Estudiantes asignados a tus clases</p>
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
        <h1 className="text-3xl font-bold">Mis Estudiantes</h1>
        <p className="text-muted-foreground mt-2">Estudiantes asignados a tus clases</p>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, CI, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de estudiantes */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {search ? "No se encontraron estudiantes" : "No tienes estudiantes asignados"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {search
                  ? "Intenta con otro término de búsqueda"
                  : "Los estudiantes aparecerán aquí cuando se les asignen clases contigo"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Estudiantes</CardTitle>
            <CardDescription>Total: {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">CI</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Teléfono</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Categoría</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium">
                        {student.nombre} {student.apellido}
                      </TableCell>
                      <TableCell className="text-sm">{student.ci}</TableCell>
                      <TableCell className="text-sm">{student.email}</TableCell>
                      <TableCell className="text-sm">{student.telefono}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[student.estado]}>
                          {student.estado.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.categoria_licencia_deseada ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            {student.categoria_licencia_deseada}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/instructor/students/${student.id}`}>
                            <Button size="sm" variant="outline" className="transition-all hover:bg-blue-50">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalles
                            </Button>
                          </Link>
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
    </div>
  )
}





