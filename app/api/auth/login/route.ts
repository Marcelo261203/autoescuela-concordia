import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getInstructorByAuthUserId } from "@/lib/services/instructor-service"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Personalizar mensajes de error para que sean más claros
      let errorMessage = "Email o contraseña incorrectos. Por favor, verifique sus credenciales."
      
      // Verificar el tipo de error específico de Supabase
      if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid credentials")) {
        errorMessage = "Email o contraseña incorrectos. Por favor, verifique sus credenciales e intente nuevamente."
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Su email no ha sido confirmado. Por favor, verifique su correo electrónico."
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Demasiados intentos de inicio de sesión. Por favor, espere unos minutos antes de intentar nuevamente."
      } else if (error.message) {
        // Si hay otro tipo de error, usar el mensaje original pero en español si es posible
        errorMessage = error.message
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 401 })
    }

    // Verificar si el usuario es instructor y su estado
    if (data.user) {
      const instructor = await getInstructorByAuthUserId(data.user.id)
      
      if (instructor && instructor.estado === "inactivo") {
        // Cerrar sesión si el instructor está inactivo
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: "Su cuenta de instructor está inactiva. Por favor, contacte al administrador." },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error en login" }, { status: 500 })
  }
}
