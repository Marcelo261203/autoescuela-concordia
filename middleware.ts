import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              path: "/",
              sameSite: "lax",
            })
          })
        },
      },
    },
  )

  // Obtener sesión y usuario
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Si hay error o no hay usuario, considerar como no autenticado
  const isAuthenticated = !error && user !== null

  // Determinar el rol del usuario - SIEMPRE verificar si está autenticado
  let userRole: "admin" | "instructor" | null = null
  
  if (isAuthenticated && user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      // Verificar si el usuario está vinculado a un instructor
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      const { data: instructor, error: instructorError } = await adminClient
        .from("instructors")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle()

      if (instructorError && instructorError.code !== "PGRST116") {
        userRole = "admin"
      } else {
        userRole = instructor ? "instructor" : "admin"
      }
    } catch (error) {
      // Si hay error, asumir admin por defecto
      userRole = "admin"
    }
  } else if (isAuthenticated) {
    // Si no hay SERVICE_ROLE_KEY pero está autenticado, asumir admin
    userRole = "admin"
  }

  // Rutas protegidas
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Aplicar restricciones de rol según el tipo de usuario
    
    if (userRole === "instructor") {
      // Instructores solo pueden acceder a su dashboard específico
      if (request.nextUrl.pathname === "/dashboard" || 
          request.nextUrl.pathname.startsWith("/dashboard/")) {
        // Si intenta acceder a cualquier ruta de dashboard que NO sea /dashboard/instructor, redirigir
        if (!request.nextUrl.pathname.startsWith("/dashboard/instructor")) {
          return NextResponse.redirect(new URL("/dashboard/instructor", request.url))
        }
      }
    } else if (userRole === "admin") {
      // Admins no pueden acceder al dashboard de instructor
      if (request.nextUrl.pathname.startsWith("/dashboard/instructor") && 
          request.nextUrl.pathname !== "/dashboard/instructors" && 
          !request.nextUrl.pathname.startsWith("/dashboard/instructors/")) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
    // Si userRole es null, permitir acceso (asumir admin)
  }

  // Redirigir desde la raíz
  if (request.nextUrl.pathname === "/") {
    if (isAuthenticated) {
      // Redirigir según el rol
      if (userRole === "instructor") {
        return NextResponse.redirect(new URL("/dashboard/instructor", request.url))
      }
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      // Si NO está autenticado, redirigir al login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Proteger ruta de login: si está autenticado, redirigir según el rol
  if (request.nextUrl.pathname === "/login") {
    if (isAuthenticated) {
      if (userRole === "instructor") {
        return NextResponse.redirect(new URL("/dashboard/instructor", request.url))
      }
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/login"],
}
