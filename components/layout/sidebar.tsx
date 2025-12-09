"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, FileText, LogOut, Menu, GraduationCap, Calendar, TrendingUp, ClipboardList, Plus, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<"admin" | "instructor" | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/auth/role", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role)
      }
    } catch (error) {
      console.error("Error obteniendo rol:", error)
    }
  }

  const handleLogout = async () => {
    try {
      // Cerrar sesión usando el cliente de Supabase
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error al cerrar sesión:", error)
      }

      // Limpiar almacenamiento local del navegador
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
      }

      // También llamar a la API de logout para asegurar limpieza en el servidor
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        })
      } catch (apiError) {
        console.error("Error en API de logout:", apiError)
      }

      // Redirigir al login y forzar recarga completa
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Limpiar almacenamiento de todas formas
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
      }
      // Intentar redirigir de todas formas
      window.location.href = "/login"
    }
  }

  // Menú items según el rol
  const adminMenuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      label: "Matricular",
      href: "/dashboard/enroll",
      icon: UserPlus,
    },
    {
      label: "Estudiantes",
      href: "/dashboard/students",
      icon: Users,
    },
    {
      label: "Progreso",
      href: "/dashboard/progress",
      icon: TrendingUp,
    },
    {
      label: "Notas",
      href: "/dashboard/grades",
      icon: ClipboardList,
    },
    {
      label: "Instructores",
      href: "/dashboard/instructors",
      icon: GraduationCap,
    },
    {
      label: "Clases",
      href: "/dashboard/classes",
      icon: Calendar,
    },
    {
      label: "Reportes",
      href: "/dashboard/reports",
      icon: FileText,
    },
  ]

  const instructorMenuItems = [
    {
      label: "Mi Dashboard",
      href: "/dashboard/instructor",
      icon: BarChart3,
    },
    {
      label: "Mis Estudiantes",
      href: "/dashboard/instructor/students",
      icon: Users,
    },
    {
      label: "Progreso",
      href: "/dashboard/instructor/progress",
      icon: TrendingUp,
    },
    {
      label: "Mis Clases",
      href: "/dashboard/instructor/classes",
      icon: Calendar,
    },
    {
      label: "Agendar Clase",
      href: "/dashboard/instructor/classes/create",
      icon: Plus,
    },
  ]

  // Seleccionar items según el rol
  const menuItems = userRole === "instructor" ? instructorMenuItems : adminMenuItems

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="flex-1 space-y-4 py-4 px-3">
        <div className="px-3 py-4">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <Image
                src="/logo-autoescuela.png"
                alt="Logo Autoescuela Concordia"
                width={320}
                height={140}
                className="object-contain"
                priority
                style={{ width: "auto", height: "auto", maxWidth: "320px", maxHeight: "140px" }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">
            {userRole === "instructor" ? "Panel de Instructor" : "Gestión de Estudiantes"}
          </p>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            // Mejorar la lógica de detección de ruta activa
            let isActive = false
            if (pathname === item.href) {
              // Ruta exacta
              isActive = true
            } else if (item.href !== "/dashboard" && pathname?.startsWith(item.href)) {
              // Verificar que no haya otra ruta más específica que también coincida
              // Esto evita que "/dashboard/instructor/classes" se active cuando estás en "/dashboard/instructor/classes/create"
              const hasMoreSpecificMatch = menuItems.some((otherItem) => {
                if (otherItem.href === item.href) return false
                // Si otra ruta es más larga y también empieza con la ruta actual, es más específica
                return (
                  otherItem.href.startsWith(item.href) &&
                  otherItem.href.length > item.href.length &&
                  pathname?.startsWith(otherItem.href)
                )
              })
              // Solo activar si no hay una ruta más específica que coincida
              isActive = !hasMoreSpecificMatch
            }
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 ${isActive ? "bg-blue-600 hover:bg-blue-700" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-3 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-sidebar">{sidebarContent}</aside>

      {/* Sidebar mobile */}
      {mounted && (
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
      )}
      {!mounted && (
        <div className="md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  )
}
