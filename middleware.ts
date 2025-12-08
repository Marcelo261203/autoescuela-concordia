import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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


  // Rutas protegidas
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirigir desde la raíz
  if (request.nextUrl.pathname === "/") {
    if (isAuthenticated) {
      // Si está autenticado, redirigir al dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      // Si NO está autenticado, redirigir al login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Proteger ruta de login: si está autenticado, redirigir al dashboard
  if (request.nextUrl.pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/login"],
}
