"use client"

import { InstructorList } from "@/components/instructors/instructor-list"

export default function InstructorsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Instructores</h1>
        <p className="text-muted-foreground mt-2">Gestiona los instructores de la autoescuela</p>
      </div>
      <InstructorList />
    </div>
  )
}











