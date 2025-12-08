import { checkClassConflict, checkHoursExceeded, checkInstructorAvailability } from "@/lib/services/class-service"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { fecha, hora, estudiante_id, instructor_id, tipo, duracion_minutos, excludeId } = await request.json()

    if (!fecha || !hora) {
      return NextResponse.json({ error: "Fecha y hora son requeridas" }, { status: 400 })
    }

    // Verificar conflicto de fecha y hora
    const conflictResult = await checkClassConflict(fecha, hora, estudiante_id, instructor_id, excludeId)
    if (conflictResult.conflict) {
      return NextResponse.json(conflictResult)
    }

    // Verificar si la hora está dentro del horario disponible del instructor
    if (instructor_id) {
      const availabilityResult = await checkInstructorAvailability(instructor_id, hora)
      if (!availabilityResult.available) {
        return NextResponse.json({
          conflict: true,
          message: availabilityResult.message || "La hora de la clase está fuera del horario disponible del instructor",
        })
      }
    }

    // Verificar si excedería las horas requeridas
    if (estudiante_id && tipo && duracion_minutos) {
      const hoursResult = await checkHoursExceeded(estudiante_id, tipo, duracion_minutos, excludeId)
      if (hoursResult.exceeded) {
        return NextResponse.json(hoursResult)
      }
    }

    return NextResponse.json({ conflict: false, exceeded: false })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error verificando conflicto" },
      { status: 500 },
    )
  }
}

