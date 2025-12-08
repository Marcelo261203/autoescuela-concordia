import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Limpiar todas las cookies relacionadas con la sesión
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    // Crear respuesta con cookies limpiadas
    const response = NextResponse.json({ success: true })
    
    // Eliminar cookies de Supabase Auth
    allCookies.forEach((cookie) => {
      if (cookie.name.includes("supabase") || cookie.name.includes("sb-")) {
        response.cookies.set(cookie.name, "", {
          expires: new Date(0),
          path: "/",
          sameSite: "lax",
        })
      }
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error en logout" }, { status: 500 })
  }
}
