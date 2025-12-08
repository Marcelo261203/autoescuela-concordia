import { getDashboardSummary } from "@/lib/services/report-service"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Verificar autenticación antes de obtener datos
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 },
      )
    }

    const summary = await getDashboardSummary()
    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error en dashboard summary:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error obteniendo resumen" },
      { status: 500 },
    )
  }
}
