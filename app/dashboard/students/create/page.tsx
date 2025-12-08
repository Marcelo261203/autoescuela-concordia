"use client"

import { StudentForm } from "@/components/students/student-form"

export default function CreateStudentPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Crear Nuevo Estudiante</h1>
        <p className="text-muted-foreground mt-2">Completa el formulario para registrar un nuevo estudiante</p>
      </div>
      <StudentForm isEdit={false} />
    </div>
  )
}
