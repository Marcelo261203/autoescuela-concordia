"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import type { Instructor } from "@/lib/types"

interface InstructorFormProps {
  isEdit?: boolean
  instructor?: Instructor
}

export function InstructorForm({ isEdit = false, instructor }: InstructorFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: instructor?.nombre || "",
    apellido: instructor?.apellido || "",
    email: instructor?.email || "",
    telefono: instructor?.telefono || "",
    especialidad: instructor?.especialidad || "",
    disponibilidad: instructor?.disponibilidad || "", // Mantener por compatibilidad
    hora_inicio: instructor?.hora_inicio || "",
    hora_fin: instructor?.hora_fin || "",
    estado: instructor?.estado || "activo",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validación
    const newErrors: Record<string, string> = {}
    if (!formData.nombre) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido) newErrors.apellido = "El apellido es requerido"
    if (!formData.email) newErrors.email = "El email es requerido"
    if (!formData.telefono) newErrors.telefono = "El teléfono es requerido"
    if (!formData.especialidad) newErrors.especialidad = "La especialidad es requerida"

    // Validar horarios: si se especifica uno, debe especificarse el otro
    if (formData.hora_inicio && !formData.hora_fin) {
      newErrors.hora_fin = "Debe especificar la hora de fin si especifica la hora de inicio"
    }
    if (formData.hora_fin && !formData.hora_inicio) {
      newErrors.hora_inicio = "Debe especificar la hora de inicio si especifica la hora de fin"
    }

    // Validar que hora_fin sea posterior a hora_inicio
    if (formData.hora_inicio && formData.hora_fin) {
      const [horaInicioH, horaInicioM] = formData.hora_inicio.split(":").map(Number)
      const [horaFinH, horaFinM] = formData.hora_fin.split(":").map(Number)
      const horaInicioMinutos = horaInicioH * 60 + horaInicioM
      const horaFinMinutos = horaFinH * 60 + horaFinM

      if (horaFinMinutos <= horaInicioMinutos) {
        newErrors.hora_fin = "La hora de fin debe ser posterior a la hora de inicio"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const url = isEdit && instructor?.id ? `/api/instructors/${instructor.id}` : "/api/instructors"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          especialidad: formData.especialidad,
          disponibilidad: formData.disponibilidad || null, // Mantener por compatibilidad
          hora_inicio: formData.hora_inicio || null,
          hora_fin: formData.hora_fin || null,
          estado: formData.estado,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ general: errorData.error || "Error al guardar el instructor" })
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/instructors")
        router.refresh()
      }, 1500)
    } catch (error) {
      setErrors({ general: "Error al conectar con el servidor. Por favor, intenta nuevamente." })
      setIsLoading(false)
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Instructor" : "Crear Nuevo Instructor"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Actualiza la información del instructor"
            : "Completa el formulario para registrar un nuevo instructor"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {isEdit ? "Instructor actualizado exitosamente" : "Instructor creado exitosamente"}
              </AlertDescription>
            </Alert>
          )}

          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {Object.keys(errors).filter((key) => key !== "general").length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Por favor corrige los errores en el formulario</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Juan"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                disabled={isLoading}
              />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                disabled={isLoading}
              />
              {errors.apellido && <p className="text-sm text-destructive">{errors.apellido}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="instructor@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                placeholder="+58 414 1234567"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                disabled={isLoading}
              />
              {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad *</Label>
              <Input
                id="especialidad"
                placeholder="Manejo Defensivo"
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                disabled={isLoading}
              />
              {errors.especialidad && <p className="text-sm text-destructive">{errors.especialidad}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger id="estado" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora de Inicio</Label>
              <Input
                id="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                disabled={isLoading}
              />
              {errors.hora_inicio && <p className="text-sm text-destructive">{errors.hora_inicio}</p>}
              <p className="text-xs text-muted-foreground">
                Hora de inicio del horario disponible (opcional). Si no se especifica, no hay restricción.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_fin">Hora de Fin</Label>
              <Input
                id="hora_fin"
                type="time"
                value={formData.hora_fin}
                onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                disabled={isLoading}
              />
              {errors.hora_fin && <p className="text-sm text-destructive">{errors.hora_fin}</p>}
              <p className="text-xs text-muted-foreground">
                Hora de fin del horario disponible (opcional). Debe ser posterior a la hora de inicio.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilidad">Notas de Disponibilidad (Opcional)</Label>
            <Textarea
              id="disponibilidad"
              placeholder="Ej: Lunes a Viernes, disponible para clases prácticas"
              value={formData.disponibilidad}
              onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
              disabled={isLoading}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Campo opcional para notas adicionales sobre la disponibilidad del instructor.
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isLoading} className="transition-all">
              {isLoading ? (isEdit ? "Actualizando..." : "Creando...") : isEdit ? "Actualizar" : "Crear"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}








