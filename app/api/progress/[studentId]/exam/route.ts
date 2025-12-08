import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { updateStudentProgress } from "@/lib/services/progress-service"

export async function PUT(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params
    const updates = await request.json()

    const supabase = await createClient()

    // Actualizar campos de examen en student_progress
    const { data, error } = await supabase
      .from("student_progress")
      .update({
        nota_final: updates.nota_final,
        aprobado: updates.aprobado,
        reintentos: updates.reintentos,
        horas_penalizacion_practicas: updates.horas_penalizacion_practicas || 0,
        horas_penalizacion_teoricas: updates.horas_penalizacion_teoricas || 0,
        actualizado_en: new Date().toISOString(),
      })
      .eq("estudiante_id", studentId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Recalcular progreso después de actualizar examen
    await updateStudentProgress(studentId)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando examen" },
      { status: 500 },
    )
  }
}











