"use client"

import { StudentProgressCard } from "@/components/students/student-progress"
import { StudentExam } from "@/components/students/student-exam"
import { StudentRequirements } from "@/components/students/student-requirements"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Student, StudentProgress, ClassWithDetails } from "@/lib/types"

export default function StudentProgressDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudent()
    fetchProgress()
    fetchClasses()
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

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/classes?estudiante_id=${id}&limit=1000`)
      if (response.ok) {
        const data = await response.json()
        const sortedClasses = (data.data || []).sort((a: ClassWithDetails, b: ClassWithDetails) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`)
          const dateB = new Date(`${b.fecha}T${b.hora}`)
          return dateB.getTime() - dateA.getTime()
        })
        setClasses(sortedClasses)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  // Calcular promedios
  const calculateAverages = () => {
    const gradedClasses = classes.filter((c) => c.estado === "cursado")
    const clasesConNota = gradedClasses.filter((c) => c.nota !== null && c.nota !== undefined)
    
    if (clasesConNota.length === 0) {
      return {
        promedioTeoricas: 0,
        promedioPracticas: 0,
        promedioGeneral: 0,
        totalTeoricas: 0,
        totalPracticas: 0,
      }
    }

    const clasesTeoricas = clasesConNota.filter((c) => c.tipo === "teorica")
    const clasesPracticas = clasesConNota.filter((c) => c.tipo === "practica")

    const promedioTeoricas =
      clasesTeoricas.length > 0
        ? Math.round((clasesTeoricas.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesTeoricas.length) * 10) / 10
        : 0
    const promedioPracticas =
      clasesPracticas.length > 0
        ? Math.round((clasesPracticas.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesPracticas.length) * 10) / 10
        : 0
    const promedioGeneral = Math.round((clasesConNota.reduce((sum, c) => sum + (c.nota || 0), 0) / clasesConNota.length) * 10) / 10

    return {
      promedioTeoricas,
      promedioPracticas,
      promedioGeneral,
      totalTeoricas: clasesTeoricas.length,
      totalPracticas: clasesPracticas.length,
    }
  }

  const { promedioTeoricas, promedioPracticas, totalTeoricas, totalPracticas } = calculateAverages()

  const handleProgressUpdate = () => {
    fetchProgress()
    fetchClasses()
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
          <StudentExam
            studentId={student.id}
            progress={progress}
            promedioTeoricas={promedioTeoricas}
            promedioPracticas={promedioPracticas}
            totalTeoricas={totalTeoricas}
            totalPracticas={totalPracticas}
            onUpdate={handleProgressUpdate}
          />
        </div>
        <div className="space-y-6">
          <StudentRequirements studentId={student.id} progress={progress} onUpdate={handleProgressUpdate} />
        </div>
      </div>
    </div>
  )
}







