"use client"

import { ClassForm } from "@/components/classes/class-form"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import type { Class } from "@/lib/types"

export default function EditClassPage() {
  const params = useParams()
  const id = params.id as string
  const [classData, setClassData] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClass()
  }, [id])

  const fetchClass = async () => {
    try {
      const response = await fetch(`/api/classes/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError("Clase no encontrada")
        } else {
          setError("Error al cargar la clase")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setClassData(data)
    } catch (error) {
      console.error("Error fetching class:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Editar Clase</h1>
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">{error || "Clase no encontrada"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Editar Clase</h1>
        <p className="text-muted-foreground mt-2">Actualiza la información de la clase</p>
      </div>
      <ClassForm isEdit={true} classData={classData} />
    </div>
  )
}











