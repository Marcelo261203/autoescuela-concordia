import { getClassesReport } from "@/lib/services/report-service"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined
    const tipo = searchParams.get("tipo") || undefined

    const data = await getClassesReport({
      dateFrom,
      dateTo,
      tipo,
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo reportes de clases" },
      { status: 500 },
    )
  }
}
