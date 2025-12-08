"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Radiation as Graduation, UserMinus, TrendingUp, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface DashboardSummary {
  total: number
  activo: number
  en_curso: number
  graduado: number
  inactivo: number
  totalClases: number
  trendData: Array<{ mes: string; estudiantes: number }>
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/dashboard/summary", {
        credentials: "include", // Incluir cookies en la petición
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bienvenido al Sistema de Gestión de Autoescuela</p>
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bienvenido al Sistema de Gestión de Autoescuela</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">{error || "Error al cargar los datos"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const distributionData = [
    { name: "Activos", value: summary.activo, color: "#22c55e" },
    { name: "En Curso", value: summary.en_curso, color: "#eab308" },
    { name: "Graduados", value: summary.graduado, color: "#a855f7" },
    { name: "Inactivos", value: summary.inactivo, color: "#ef4444" },
  ]

  const stats = [
    {
      title: "Total de Estudiantes",
      value: summary.total,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Estudiantes Activos",
      value: summary.activo,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "En Curso",
      value: summary.en_curso,
      icon: Users,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Graduados",
      value: summary.graduado,
      icon: Graduation,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Inactivos",
      value: summary.inactivo,
      icon: UserMinus,
      color: "bg-red-100 text-red-600",
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bienvenido al Sistema de Gestión de Autoescuela</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="transition-all hover:shadow-lg hover:scale-105 duration-300"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Tendencia */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Estudiantes</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="estudiantes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico circular - Distribución */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Estado actual de estudiantes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de distribución */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${summary.total > 0 ? (item.value / summary.total) * 100 : 0}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold min-w-12 text-right">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
