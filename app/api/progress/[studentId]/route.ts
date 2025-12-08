import { getStudentProgressReport } from "@/lib/services/progress-service"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params
    const report = await getStudentProgressReport(studentId)
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo progreso" },
      { status: 500 },
    )
  }
}
