import { StudentList } from "@/components/students/student-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Estudiantes</h1>
        <p className="text-muted-foreground mt-2">Ver, crear, editar y eliminar estudiantes</p>
        <Link href="/dashboard/students/create">
          <Button className="mt-4">Crear Nuevo Estudiante</Button>
        </Link>
      </div>
      <StudentList />
    </div>
  )
}
