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

import type { Student } from "@/lib/types"

interface StudentFormProps {
  isEdit?: boolean
  student?: Student
}

export function StudentForm({ isEdit = false, student }: StudentFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ci: student?.ci || "",
    email: student?.email || "",
    nombre: student?.nombre || "",
    apellido: student?.apellido || "",
    telefono: student?.telefono || "",
    direccion: student?.direccion || "",
    fecha_nacimiento: student?.fecha_nacimiento ? student.fecha_nacimiento.split("T")[0] : "",
    estado: student?.estado || "activo",
    categoria_licencia_deseada: student?.categoria_licencia_deseada || "",
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
    if (!formData.ci) newErrors.ci = "La cédula es requerida"
    if (!formData.email) newErrors.email = "El email es requerido"
    if (!formData.nombre) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido) newErrors.apellido = "El apellido es requerido"
    if (!formData.telefono) newErrors.telefono = "El teléfono es requerido"
    if (!formData.direccion) newErrors.direccion = "La dirección es requerida"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const url = isEdit && student?.id ? `/api/students/${student.id}` : "/api/students"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ci: formData.ci,
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          direccion: formData.direccion,
          fecha_nacimiento: formData.fecha_nacimiento,
          // Al crear, SIEMPRE forzar estado "activo"
          estado: isEdit ? formData.estado : "activo",
          categoria_licencia_deseada: formData.categoria_licencia_deseada || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ general: errorData.error || "Error al guardar el estudiante" })
        setIsLoading(false)
        return
      }

    setSuccess(true)
    setTimeout(() => {
      router.push("/dashboard/students")
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
        <CardTitle>{isEdit ? "Editar Estudiante" : "Crear Nuevo Estudiante"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Actualiza la información del estudiante"
            : "Completa el formulario para registrar un nuevo estudiante"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {isEdit ? "Estudiante actualizado exitosamente" : "Estudiante creado exitosamente"}
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
              <Label htmlFor="ci">Cédula de Identidad *</Label>
              <Input
                id="ci"
                placeholder="12345678"
                value={formData.ci}
                onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                disabled={isLoading || isEdit}
              />
              {errors.ci && <p className="text-sm text-destructive">{errors.ci}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="estudiante@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

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
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                disabled={isLoading}
              />
              {errors.fecha_nacimiento && <p className="text-sm text-destructive">{errors.fecha_nacimiento}</p>}
            </div>

            {/* Solo mostrar campo de estado al editar, al crear siempre será "activo" */}
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger id="estado" disabled={isLoading}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="en_curso">En Curso</SelectItem>
                    <SelectItem value="graduado">Graduado</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value="Activo"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Los nuevos estudiantes siempre se crean con estado "Activo"</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="categoria_licencia_deseada">Categoría de Licencia Deseada</Label>
              <Select
                value={formData.categoria_licencia_deseada || "all"}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoria_licencia_deseada: value === "all" ? "" : value })
                }
              >
                <SelectTrigger id="categoria_licencia_deseada" disabled={isLoading}>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sin categoría</SelectItem>
                  <SelectItem value="M">M - Moto</SelectItem>
                  <SelectItem value="P">P - Particular (Auto)</SelectItem>
                  <SelectItem value="A">A - Autobús</SelectItem>
                  <SelectItem value="B">B - Bus/Camión</SelectItem>
                  <SelectItem value="C">C - Profesional (Top)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Textarea
              id="direccion"
              placeholder="Calle 123, Apartamento 456, Ciudad"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              disabled={isLoading}
              rows={3}
            />
            {errors.direccion && <p className="text-sm text-destructive">{errors.direccion}</p>}
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
