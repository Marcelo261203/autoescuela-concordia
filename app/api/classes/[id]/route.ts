import { getClassesByStudent, updateClass, deleteClass } from "@/lib/services/class-service"
import { updateStudentProgress } from "@/lib/services/progress-service"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Obtener la clase
    const { data, error } = await supabase
      .from("classes")
      .select(
        `*,
        estudiante:students(id, nombre, apellido, ci),
        instructor:instructors(id, nombre, apellido, especialidad)`,
      )
      .eq("id", id)
      .single()

    if (error) throw new Error(error.message)
    if (!data) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })
    }

    // Actualizar estado automáticamente si es necesario
    if (data.estado === "agendado" && !data.nota) {
      try {
        const fechaHoraInicio = new Date(`${data.fecha}T${data.hora}`)
        const fechaHoraFin = new Date(fechaHoraInicio.getTime() + (data.duracion_minutos || 0) * 60 * 1000)
        const ahora = new Date()
        
        if (ahora >= fechaHoraFin) {
          // Actualizar estado a "por_calificar"
          const { data: updatedData } = await supabase
            .from("classes")
            .update({ estado: "por_calificar" })
            .eq("id", id)
            .select(
              `*,
              estudiante:students(id, nombre, apellido, ci),
              instructor:instructors(id, nombre, apellido, especialidad)`,
            )
            .single()
          
          if (updatedData) {
            return NextResponse.json(updatedData)
          }
        }
      } catch (updateError) {
        console.error("Error updating class status:", updateError)
        // Continuar y devolver la clase original si hay error
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo clase" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()
    const updated = await updateClass(id, updates)

    if (updates.estudiante_id) {
      await updateStudentProgress(updates.estudiante_id)
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando clase" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Obtener el estudiante_id antes de eliminar la clase
    const supabase = await createClient()
    const { data: clase } = await supabase.from("classes").select("estudiante_id").eq("id", id).single()
    
    await deleteClass(id)
    
    // Actualizar progreso del estudiante después de eliminar la clase
    if (clase?.estudiante_id) {
      await updateStudentProgress(clase.estudiante_id)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error eliminando clase" },
      { status: 500 },
    )
  }
}
