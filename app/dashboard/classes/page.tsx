"use client"

import { ClassList } from "@/components/classes/class-list"

export default function ClassesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Clases</h1>
        <p className="text-muted-foreground mt-2">Gestiona las clases programadas</p>
      </div>
      <ClassList />
    </div>
  )
}











