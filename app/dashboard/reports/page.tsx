import { ReportGenerator } from "@/components/reports/report-generator"

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground mt-2">Genera y descarga reportes de estudiantes y clases programadas</p>
      </div>
      <ReportGenerator />
    </div>
  )
}
