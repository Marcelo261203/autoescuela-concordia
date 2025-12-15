"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, User } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Instructor } from "@/lib/types"

export default function InstructorProfilePage() {
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    especialidad: "",
    hora_inicio: "",
    hora_fin: "",
  })

  useEffect(() => {
    fetchInstructorProfile()
  }, [])

  const fetchInstructorProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/instructor/profile", {
        credentials: "include",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al cargar perfil")
      }
      const data = await response.json()
      setInstructor(data.instructor)
      setFormData({
        nombre: data.instructor.nombre || "",
        apellido: data.instructor.apellido || "",
        email: data.instructor.email || "",
        telefono: data.instructor.telefono || "",
        especialidad: data.instructor.especialidad || "",
        hora_inicio: data.instructor.hora_inicio || "",
        hora_fin: data.instructor.hora_fin || "",
      })
    } catch (err) {
      console.error("Error fetching instructor profile:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    // Validar horario
    if (formData.hora_inicio && formData.hora_fin) {
      const [horaInicioH, horaInicioM] = formData.hora_inicio.split(":").map(Number)
      const [horaFinH, horaFinM] = formData.hora_fin.split(":").map(Number)
      const horaInicioMinutos = horaInicioH * 60 + horaInicioM
      const horaFinMinutos = horaFinH * 60 + horaFinM

      if (horaFinMinutos <= horaInicioMinutos) {
        setError("La hora de fin debe ser posterior a la hora de inicio")
        setIsSaving(false)
        return
      }
    }

    try {
      const response = await fetch("/api/instructor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          especialidad: formData.especialidad,
          hora_inicio: formData.hora_inicio || null,
          hora_fin: formData.hora_fin || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al actualizar perfil")
      }

      setSuccess(true)
      await fetchInstructorProfile()
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Error al actualizar perfil")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error && !instructor) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <Link href="/dashboard/instructor">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <Link href="/dashboard/instructor">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">Edita tu información personal y horario disponible</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Actualiza tus datos personales</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Perfil actualizado exitosamente
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="especialidad">Especialidad *</Label>
                <Input
                  id="especialidad"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  required
                  disabled={isSaving}
                  placeholder="Ej: Práctica, Teórica, Ambas"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Horario Disponible</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Define tu horario de disponibilidad. Las clases que crees no podrán exceder este horario.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deja vacío si no tienes restricción de horario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_fin">Hora de Fin</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Debe ser posterior a la hora de inicio
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



