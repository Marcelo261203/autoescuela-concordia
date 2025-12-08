import { getActiveStudentsReport, getStudentsByStateReport } from "@/lib/services/report-service"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "active"

    let data
    if (type === "byState") {
      data = await getStudentsByStateReport()
    } else {
      data = await getActiveStudentsReport()
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo reportes" },
      { status: 500 },
    )
  }
}
