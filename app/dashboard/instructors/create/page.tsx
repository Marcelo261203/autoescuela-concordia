"use client"

import { InstructorForm } from "@/components/instructors/instructor-form"

export default function CreateInstructorPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Crear Nuevo Instructor</h1>
        <p className="text-muted-foreground mt-2">Completa el formulario para registrar un nuevo instructor</p>
      </div>
      <InstructorForm isEdit={false} />
    </div>
  )
}











