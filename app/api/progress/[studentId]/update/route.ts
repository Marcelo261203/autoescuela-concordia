import { updateStudentProgress } from "@/lib/services/progress-service"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params
    const progress = await updateStudentProgress(studentId)
    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error actualizando progreso" },
      { status: 500 },
    )
  }
}











