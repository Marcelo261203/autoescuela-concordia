"use client"

import { ClassForm } from "@/components/classes/class-form"

export default function CreateClassPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Crear Nueva Clase</h1>
        <p className="text-muted-foreground mt-2">Completa el formulario para programar una nueva clase</p>
      </div>
      <ClassForm isEdit={false} />
    </div>
  )
}











