"use client"

import { InstructorForm } from "@/components/instructors/instructor-form"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import type { Instructor } from "@/lib/types"

export default function EditInstructorPage() {
  const params = useParams()
  const id = params.id as string
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInstructor()
  }, [id])

  const fetchInstructor = async () => {
    try {
      const response = await fetch(`/api/instructors/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError("Instructor no encontrado")
        } else {
          setError("Error al cargar el instructor")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setInstructor(data)
    } catch (error) {
      console.error("Error fetching instructor:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Editar Instructor</h1>
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !instructor) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">{error || "Instructor no encontrado"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Editar Instructor</h1>
        <p className="text-muted-foreground mt-2">
          {instructor.nombre} {instructor.apellido}
        </p>
      </div>
      <InstructorForm isEdit={true} instructor={instructor} />
    </div>
  )
}











