"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Radiation as Graduation, UserMinus, TrendingUp, Loader2, BookOpen, CheckCircle2, Clock, Award, BarChart3, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts"

interface DashboardSummary {
  total: number
  activo: number
  en_curso: number
  graduado: number
  inactivo: number
  totalClases: number
  trendData: Array<{ mes: string; estudiantes: number }>
  classesTrendData: Array<{ mes: string; clases: number }>
  // Estadísticas de clases
  clasesCompletadas: number
  clasesAgendadas: number
  clasesPorCalificar: number
  // Estadísticas de notas
  promedioNotas: number
  distribucionNotas: {
    excelente: number
    bueno: number
    regular: number
    bajo: number
  }
  notasTrendData: Array<{ mes: string; promedio: number }>
  // Estadísticas de progreso
  progresoPromedio: number
  estudiantesAprobados: number
  estudiantesReprobados: number
  estudiantesPendientes: number
  promedioNotaFinal: number
  topStudents: Array<{ nombre: string; ci: string; progreso: number }>
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

  // Las 6 estadísticas más importantes con colores únicos
  const topStats = [
    {
      title: "Total de Estudiantes",
      value: summary.total,
      icon: Users,
      color: {
        bg: "from-blue-50 to-blue-100",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
        iconBorder: "border-blue-200",
        icon: "text-blue-600",
        value: "text-blue-700",
        title: "text-blue-600",
      },
    },
    {
      title: "Estudiantes Activos",
      value: summary.activo,
      icon: UserCheck,
      color: {
        bg: "from-green-50 to-green-100",
        border: "border-green-200",
        iconBg: "bg-green-100",
        iconBorder: "border-green-200",
        icon: "text-green-600",
        value: "text-green-700",
        title: "text-green-600",
      },
    },
    {
      title: "Graduados",
      value: summary.graduado,
      icon: Graduation,
      color: {
        bg: "from-purple-50 to-purple-100",
        border: "border-purple-200",
        iconBg: "bg-purple-100",
        iconBorder: "border-purple-200",
        icon: "text-purple-600",
        value: "text-purple-700",
        title: "text-purple-600",
      },
    },
    {
      title: "Clases Completadas",
      value: summary.clasesCompletadas || 0,
      icon: CheckCircle2,
      color: {
        bg: "from-emerald-50 to-emerald-100",
        border: "border-emerald-200",
        iconBg: "bg-emerald-100",
        iconBorder: "border-emerald-200",
        icon: "text-emerald-600",
        value: "text-emerald-700",
        title: "text-emerald-600",
      },
    },
    {
      title: "Promedio de Notas",
      value: summary.promedioNotas ? `${summary.promedioNotas.toFixed(1)}%` : "N/A",
      icon: Award,
      color: {
        bg: "from-amber-50 to-amber-100",
        border: "border-amber-200",
        iconBg: "bg-amber-100",
        iconBorder: "border-amber-200",
        icon: "text-amber-600",
        value: "text-amber-700",
        title: "text-amber-600",
      },
    },
    {
      title: "Progreso Promedio",
      value: summary.progresoPromedio ? `${summary.progresoPromedio.toFixed(1)}%` : "0%",
      icon: Target,
      color: {
        bg: "from-indigo-50 to-indigo-100",
        border: "border-indigo-200",
        iconBg: "bg-indigo-100",
        iconBorder: "border-indigo-200",
        icon: "text-indigo-600",
        value: "text-indigo-700",
        title: "text-indigo-600",
      },
    },
  ]

  const distribucionNotasData = [
    { name: "Excelente (90-100)", value: summary.distribucionNotas?.excelente || 0, color: "#22c55e" },
    { name: "Bueno (75-89)", value: summary.distribucionNotas?.bueno || 0, color: "#3b82f6" },
    { name: "Regular (60-74)", value: summary.distribucionNotas?.regular || 0, color: "#eab308" },
    { name: "Bajo (<60)", value: summary.distribucionNotas?.bajo || 0, color: "#ef4444" },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bienvenido al Sistema de Gestión de Autoescuela</p>
      </div>

      {/* Las 6 Estadísticas Más Importantes - Una Línea Completa */}
      <div className="grid grid-cols-6 gap-3">
        {topStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className={`bg-gradient-to-br ${stat.color.bg} ${stat.color.border} shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] duration-200`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${stat.color.iconBg} border ${stat.color.iconBorder}`}>
                    <Icon className={`h-3.5 w-3.5 ${stat.color.icon}`} />
                  </div>
                </div>
                <div className={`text-lg font-bold ${stat.color.value} mb-1`}>{stat.value}</div>
                <div className={`text-xs ${stat.color.title} font-medium leading-tight`}>{stat.title}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráfico de Tendencia de Clases - Ancho Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Clases</CardTitle>
          <CardDescription>Clases realizadas en los últimos 5 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={summary.classesTrendData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="clases"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 6 }}
                activeDot={{ r: 8 }}
                name="Clases"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      
      {/* Gráficos de Notas y Progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de líneas - Evolución de Notas Promedio */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Notas Promedio</CardTitle>
            <CardDescription>Promedio mensual de calificaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.notasTrendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 5 }}
                  name="Promedio"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Distribución de Notas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Notas</CardTitle>
            <CardDescription>Clasificación de calificaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribucionNotasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {distribucionNotasData.map((entry, index) => (
                    <Cell key={`cell-notas-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Estudiantes y Estado de Exámenes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Estudiantes por Progreso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Estudiantes por Progreso
            </CardTitle>
            <CardDescription>Estudiantes con mayor porcentaje de avance</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.topStudents && summary.topStudents.length > 0 ? (
              <div className="space-y-4">
                {summary.topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.nombre}</p>
                        <p className="text-sm text-muted-foreground">CI: {student.ci}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{student.progreso}%</p>
                      <div className="w-24 bg-secondary rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-500 bg-primary"
                          style={{
                            width: `${Math.min(student.progreso, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay datos de progreso disponibles</p>
            )}
          </CardContent>
        </Card>

        {/* Estado de Exámenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estado de Exámenes Finales
            </CardTitle>
            <CardDescription>Resultados de exámenes de graduación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Aprobados</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{summary.estudiantesAprobados || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center gap-3">
                  <UserMinus className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Reprobados</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{summary.estudiantesReprobados || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Pendientes</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{summary.estudiantesPendientes || 0}</span>
              </div>
            </div>
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
