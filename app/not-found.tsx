"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-xl font-semibold text-slate-900">Página no encontrada</p>
          <p className="text-slate-600">La página que buscas no existe o fue eliminada</p>
        </div>
        <Link href="/dashboard">
          <Button size="lg" className="w-full">
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
