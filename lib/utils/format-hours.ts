/**
 * Convierte minutos a formato legible de horas y minutos
 * @param minutos - Cantidad de minutos a convertir
 * @returns String en formato "Xh Ymin", "Xh", o "Ymin"
 * 
 * @example
 * formatMinutesToHours(0) // "0min"
 * formatMinutesToHours(30) // "30min"
 * formatMinutesToHours(60) // "1h"
 * formatMinutesToHours(90) // "1h 30min"
 * formatMinutesToHours(105) // "1h 45min"
 * formatMinutesToHours(120) // "2h"
 */
export function formatMinutesToHours(minutos: number): string {
  if (minutos === 0) {
    return "0min"
  }

  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60

  if (horas === 0) {
    return `${minutosRestantes}min`
  }

  if (minutosRestantes === 0) {
    return `${horas}h`
  }

  return `${horas}h ${minutosRestantes}min`
}

