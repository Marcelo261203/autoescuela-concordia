"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle2, Clock, Award, BarChart3, Users, Loader2, Calendar } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface InstructorDashboardSummary {
  totalClases: number
  clasesCompletadas: number
  clasesAgendadas: number
  clasesPorCalificar: number
  promedioNotas: number
  distribucionNotas: {
    excelente: number
    bueno: number
    regular: number
    bajo: number
  }
  classesTrendData: Array<{ mes: string; clases: number }>
  clasesPracticas: number
  clasesTeoricas: number
  totalEstudiantes: number
  proximasClases: Array<{
    id: string
    fecha: string
    tipo: string
    estudiante?: { nombre: string; apellido: string; ci: string }
  }>
}

export default function InstructorDashboardPage() {
  const [summary, setSummary] = useState<InstructorDashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/dashboard/instructor", {
        credentials: "include",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al cargar datos del dashboard")
      }
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bienvenido, Instructor</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bienvenido, Instructor</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">{error || "Error al cargar los datos"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Estadísticas principales
  const stats = [
    {
      title: "Total de Clases",
      value: summary.totalClases,
      icon: BookOpen,
      color: {
        bg: "from-blue-50 to-blue-100",
        border: "border-blue-200",
        icon: "text-blue-600",
        value: "text-blue-700",
      },
    },
    {
      title: "Clases Completadas",
      value: summary.clasesCompletadas,
      icon: CheckCircle2,
      color: {
        bg: "from-green-50 to-green-100",
        border: "border-green-200",
        icon: "text-green-600",
        value: "text-green-700",
      },
    },
    {
      title: "Clases Agendadas",
      value: summary.clasesAgendadas,
      icon: Calendar,
      color: {
        bg: "from-yellow-50 to-yellow-100",
        border: "border-yellow-200",
        icon: "text-yellow-600",
        value: "text-yellow-700",
      },
    },
    {
      title: "Por Calificar",
      value: summary.clasesPorCalificar,
      icon: Clock,
      color: {
        bg: "from-orange-50 to-orange-100",
        border: "border-orange-200",
        icon: "text-orange-600",
        value: "text-orange-700",
      },
    },
    {
      title: "Promedio de Notas",
      value: `${summary.promedioNotas.toFixed(1)}%`,
      icon: Award,
      color: {
        bg: "from-purple-50 to-purple-100",
        border: "border-purple-200",
        icon: "text-purple-600",
        value: "text-purple-700",
      },
    },
    {
      title: "Estudiantes Asignados",
      value: summary.totalEstudiantes,
      icon: Users,
      color: {
        bg: "from-indigo-50 to-indigo-100",
        border: "border-indigo-200",
        icon: "text-indigo-600",
        value: "text-indigo-700",
      },
    },
  ]

  // Datos para gráfico de distribución de notas
  const distribucionData = [
    { name: "Excelente (90-100)", value: summary.distribucionNotas.excelente, color: "#22c55e" },
    { name: "Bueno (75-89)", value: summary.distribucionNotas.bueno, color: "#3b82f6" },
    { name: "Regular (60-74)", value: summary.distribucionNotas.regular, color: "#eab308" },
    { name: "Bajo (<60)", value: summary.distribucionNotas.bajo, color: "#ef4444" },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Mi Dashboard</h1>
        <p className="text-muted-foreground mt-2">Resumen de tus clases y estadísticas</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className={`border-2 ${stat.color.border} bg-gradient-to-br ${stat.color.bg}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${stat.color.title}`}>{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-white/50 border ${stat.color.border}`}>
                  <Icon className={`h-4 w-4 ${stat.color.icon}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color.value}`}>{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendencia de clases */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Clases</CardTitle>
            <CardDescription>Clases realizadas en los últimos 5 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.classesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clases" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de distribución de notas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Notas</CardTitle>
            <CardDescription>Clasificación de calificaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribucionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Próximas clases */}
      {summary.proximasClases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Clases</CardTitle>
            <CardDescription>Clases agendadas próximamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.proximasClases.map((clase) => (
                <div
                  key={clase.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {clase.estudiante
                        ? `${clase.estudiante.nombre} ${clase.estudiante.apellido}`
                        : "Estudiante no disponible"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(clase.fecha).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {clase.tipo === "practica" ? "Práctica" : "Teórica"}
                    </span>
                    <Link href={`/dashboard/instructor/classes/${clase.id}/view`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de tipos de clases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Clases Prácticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{summary.clasesPracticas}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.totalClases > 0
                ? `${Math.round((summary.clasesPracticas / summary.totalClases) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clases Teóricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{summary.clasesTeoricas}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.totalClases > 0
                ? `${Math.round((summary.clasesTeoricas / summary.totalClases) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





