"use client"

import { StudentForm } from "@/components/students/student-form"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Student } from "@/lib/types"

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudent()
  }, [id])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError("Estudiante no encontrado")
        } else {
          setError("Error al cargar el estudiante")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setStudent(data)
    } catch (error) {
      console.error("Error fetching student:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Editar Estudiante</h1>
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">{error || "Estudiante no encontrado"}</p>
          <Link href="/dashboard/students">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Estudiantes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
      <div>
          <Link href="/dashboard/students">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Estudiantes
            </Button>
          </Link>
        <h1 className="text-3xl font-bold">Editar Estudiante</h1>
        <p className="text-muted-foreground mt-2">
            {student.nombre} {student.apellido}
        </p>
        </div>
        <Link href={`/dashboard/progress/${student.id}`}>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Progreso
          </Button>
        </Link>
      </div>
      <div className="max-w-4xl">
      <StudentForm isEdit={true} student={student} />
      </div>
    </div>
  )
}
