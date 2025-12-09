import { getClassesByStudent, updateClass, deleteClass } from "@/lib/services/class-service"
import { updateStudentProgress } from "@/lib/services/progress-service"
import { getUserRole, getCurrentInstructorId } from "@/lib/services/auth-service"
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
    const userRole = await getUserRole()

    // Si es instructor, solo permitir actualizar nota y observaciones
    if (userRole === "instructor") {
      const instructorId = await getCurrentInstructorId()
      if (!instructorId) {
        return NextResponse.json({ error: "No se encontró el instructor" }, { status: 403 })
      }

      // Verificar que la clase pertenece al instructor
      const supabase = await createClient()
      const { data: clase, error: claseError } = await supabase
        .from("classes")
        .select("instructor_id, estudiante_id")
        .eq("id", id)
        .single()

      if (claseError || !clase) {
        return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })
      }

      if (clase.instructor_id !== instructorId) {
        return NextResponse.json({ error: "No tienes permiso para actualizar esta clase" }, { status: 403 })
      }

      // Verificar que el estudiante no esté graduado
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("estado, nombre, apellido")
        .eq("id", clase.estudiante_id)
        .single()

      if (studentError) {
        return NextResponse.json({ error: "Error al verificar el estado del estudiante" }, { status: 500 })
      }

      if (student?.estado === "graduado") {
        return NextResponse.json(
          { error: `No se pueden editar calificaciones de estudiantes graduados. El estudiante ${student.nombre} ${student.apellido} ya está graduado.` },
          { status: 400 },
        )
      }

      // Permitir actualizar: fecha, hora, duracion_minutos, tipo, observaciones, nota
      // NO permitir cambiar: instructor_id (debe ser siempre el del instructor actual), estudiante_id
      const allowedUpdates: any = {}
      
      // Campos que el instructor puede actualizar
      if (updates.fecha !== undefined) {
        allowedUpdates.fecha = updates.fecha
      }
      if (updates.hora !== undefined) {
        allowedUpdates.hora = updates.hora
      }
      if (updates.duracion_minutos !== undefined) {
        allowedUpdates.duracion_minutos = updates.duracion_minutos
      }
      if (updates.tipo !== undefined) {
        allowedUpdates.tipo = updates.tipo
      }
      if (updates.observaciones !== undefined) {
        allowedUpdates.observaciones = updates.observaciones
      }
      if (updates.nota !== undefined) {
        allowedUpdates.nota = updates.nota
      }
      if (updates.categoria_licencia !== undefined) {
        allowedUpdates.categoria_licencia = updates.categoria_licencia
      }

      // Asegurar que instructor_id siempre sea el del instructor actual (no se puede cambiar)
      allowedUpdates.instructor_id = instructorId

      // Si se está calificando (agregando nota), actualizar estado a "cursado"
      if (allowedUpdates.nota !== undefined && allowedUpdates.nota !== null) {
        allowedUpdates.estado = "cursado"
      } else if (updates.estado !== undefined) {
        // Permitir actualizar estado solo si no se está calificando
        allowedUpdates.estado = updates.estado
      }

      const updated = await updateClass(id, allowedUpdates)

      // Actualizar progreso del estudiante
      const { data: claseCompleta } = await supabase
        .from("classes")
        .select("estudiante_id")
        .eq("id", id)
        .single()

      if (claseCompleta?.estudiante_id) {
        await updateStudentProgress(claseCompleta.estudiante_id)
      }

      return NextResponse.json(updated)
    }

    // Si es admin, permitir todas las actualizaciones
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
    const userRole = await getUserRole()
    
    // Obtener el estudiante_id y instructor_id antes de eliminar la clase
    const supabase = await createClient()
    const { data: clase, error: claseError } = await supabase
      .from("classes")
      .select("estudiante_id, instructor_id")
      .eq("id", id)
      .single()
    
    if (claseError || !clase) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })
    }

    // Si es instructor, validar que solo pueda eliminar sus propias clases
    if (userRole === "instructor") {
      const instructorId = await getCurrentInstructorId()
      if (!instructorId) {
        return NextResponse.json({ error: "No se encontró el instructor" }, { status: 403 })
      }

      if (clase.instructor_id !== instructorId) {
        return NextResponse.json(
          { error: "No tienes permiso para eliminar esta clase" },
          { status: 403 },
        )
      }
    }
    
    await deleteClass(id)
    
    // Actualizar progreso del estudiante después de eliminar la clase
    if (clase.estudiante_id) {
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
