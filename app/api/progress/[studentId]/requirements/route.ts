import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { updateStudentProgress } from "@/lib/services/progress-service"

export async function PUT(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params
    const { horas_practicas_requeridas, horas_teoricas_requeridas, duracion_estandar_minutos } = await request.json()

    const supabase = await createClient()

    const updateData: any = {
      actualizado_en: new Date().toISOString(),
    }

    if (horas_practicas_requeridas !== undefined) {
      updateData.horas_practicas_requeridas = horas_practicas_requeridas * 60 // Convertir horas a minutos
    }
    if (horas_teoricas_requeridas !== undefined) {
      updateData.horas_teoricas_requeridas = horas_teoricas_requeridas * 60 // Convertir horas a minutos
    }
    if (duracion_estandar_minutos !== undefined) {
      updateData.duracion_estandar_minutos = duracion_estandar_minutos
    }

    // Usar upsert para crear el registro si no existe, o actualizarlo si existe
    const { data, error } = await supabase
      .from("student_progress")
      .upsert(
        {
          estudiante_id: studentId,
          ...updateData,
        },
        {
          onConflict: "estudiante_id",
        }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Recalcular progreso después de actualizar requisitos
    await updateStudentProgress(studentId)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando requisitos" },
      { status: 500 },
    )
  }
}







