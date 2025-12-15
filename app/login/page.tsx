"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si hay un error en la URL (por ejemplo, instructor inactivo)
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "inactivo") {
      setError("Su cuenta de instructor está inactiva. Por favor, contacte al administrador.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Email o contraseña incorrectos. Por favor, verifique sus credenciales e intente nuevamente.")
        setIsLoading(false)
        return
      }

      // Login exitoso, redirigir al dashboard
        router.push("/dashboard")
      router.refresh()
    } catch (error) {
      setError("Error al conectar con el servidor. Por favor, intenta nuevamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-md mb-4">
              <Image
                src="/logo-autoescuela.png"
                alt="Logo Autoescuela Concordia"
                width={400}
                height={180}
                className="object-contain"
                priority
                style={{ width: "auto", height: "auto", maxWidth: "400px", maxHeight: "180px" }}
              />
            </div>
            <CardTitle className="text-2xl font-semibold">Inicio de Sesión</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@autoescuela.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              <p>Ingresa tus credenciales de Supabase</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
