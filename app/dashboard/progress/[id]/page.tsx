"use client"

import { StudentProgressCard } from "@/components/students/student-progress"
import { StudentExam } from "@/components/students/student-exam"
import { StudentRequirements } from "@/components/students/student-requirements"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Student } from "@/lib/types"
import type { StudentProgress } from "@/lib/types"

export default function StudentProgressDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudent()
    fetchProgress()
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

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress || data)
      }
    } catch (error) {
      console.error("Error fetching progress:", error)
    }
  }

  const handleProgressUpdate = () => {
    fetchProgress()
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Progreso del Estudiante</h1>
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
          <Link href="/dashboard/progress">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Progreso
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
          <Link href="/dashboard/progress">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Progreso
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Progreso del Estudiante</h1>
          <p className="text-muted-foreground mt-2">
            {student.nombre} {student.apellido} - CI: {student.ci}
          </p>
        </div>
        <Link href={`/dashboard/students/${student.id}`}>
          <Button variant="outline">Editar Datos Personales</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StudentProgressCard studentId={student.id} />
          <StudentExam studentId={student.id} progress={progress} onUpdate={handleProgressUpdate} />
        </div>
        <div className="space-y-6">
          <StudentRequirements studentId={student.id} progress={progress} onUpdate={handleProgressUpdate} />
        </div>
      </div>
    </div>
  )
}







