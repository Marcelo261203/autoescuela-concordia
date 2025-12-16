"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, TrendingUp, User, Eye } from "lucide-react"
import Link from "next/link"
import type { Student, StudentProgress } from "@/lib/types"
import { StudentProgressCard } from "@/components/students/student-progress"

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  graduado: "bg-purple-100 text-purple-800",
  inactivo: "bg-gray-100 text-gray-800",
}

interface StudentWithProgress extends Student {
  progress?: StudentProgress | null
}

export default function InstructorProgressPage() {
  const [students, setStudents] = useState<StudentWithProgress[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentsWithProgress()
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

  const fetchStudentsWithProgress = async () => {
    try {
      setIsLoading(true)
      // Obtener estudiantes del instructor
      const studentsRes = await fetch("/api/instructor/students", {
        credentials: "include",
      })
      if (!studentsRes.ok) {
        const errorData = await studentsRes.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al cargar estudiantes")
      }
      const studentsData = await studentsRes.json()
      const studentsList = studentsData.data || []

      // Obtener progreso para cada estudiante
      const studentsWithProgress = await Promise.all(
        studentsList.map(async (student: Student) => {
          try {
            const progressRes = await fetch(`/api/progress/${student.id}`, {
              credentials: "include",
            })
            if (progressRes.ok) {
              const progressData = await progressRes.json()
              return {
                ...student,
                progress: progressData.progress || progressData,
              }
            }
            return { ...student, progress: null }
          } catch (error) {
            console.error(`Error fetching progress for student ${student.id}:`, error)
            return { ...student, progress: null }
          }
        }),
      )

      setStudents(studentsWithProgress)
      setFilteredStudents(studentsWithProgress)
    } catch (err) {
      console.error("Error fetching students with progress:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId)
  }

  const calculateProgressPercentage = (progress: StudentProgress | null | undefined): number => {
    if (!progress) return 0
    return progress.porcentaje_avance || 0
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 50) return "text-blue-600"
    if (percentage >= 25) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Progreso de Estudiantes</h1>
          <p className="text-muted-foreground mt-2">Seguimiento del progreso de tus estudiantes</p>
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
          <h1 className="text-3xl font-bold">Progreso de Estudiantes</h1>
          <p className="text-muted-foreground mt-2">Seguimiento del progreso de tus estudiantes</p>
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
        <h1 className="text-3xl font-bold">Progreso de Estudiantes</h1>
        <p className="text-muted-foreground mt-2">Seguimiento del progreso de tus estudiantes</p>
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

      {/* Lista de estudiantes con progreso */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
        <div className="space-y-4">
          {filteredStudents.map((student) => {
            const progressPercentage = calculateProgressPercentage(student.progress)
            return (
              <Card key={student.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleStudentExpansion(student.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {student.nombre} {student.apellido}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        CI: {student.ci} | Email: {student.email}
                        {student.categoria_licencia_deseada && (
                          <span className="ml-2">| Categoría: {student.categoria_licencia_deseada}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Progreso</p>
                        <p className={`text-2xl font-bold ${getProgressColor(progressPercentage)}`}>
                          {progressPercentage}%
                        </p>
                      </div>
                      <Badge className={statusColors[student.estado] || "bg-gray-100 text-gray-800"}>
                        {student.estado.toUpperCase()}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        {expandedStudentId === student.id ? "Ocultar" : "Ver Detalles"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedStudentId === student.id && (
                  <CardContent className="pt-0 border-t">
                    <div className="mt-4">
                      <StudentProgressCard studentId={student.id} />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/dashboard/instructor/students/${student.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles Completos
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}








