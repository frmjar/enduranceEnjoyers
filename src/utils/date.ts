const MESES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export interface RaceData {
  Season: string
  Week: string
  Fecha: string
  Serie: string
  Team: string
  Duracion: string
  Circuito: string
  Lluvia: string
  Coches: string
}

export interface RaceWithDate extends RaceData {
  date: Date
  weekNum: number
}

export const parseRaceDate = (fecha: string): Date => {
  const [d, m, y] = fecha.split(' ')
  const monthName = m.toLowerCase()
  return new Date(parseInt(y), MESES[monthName], parseInt(d))
}

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export const getMonthName = (monthIndex: number): string => {
  return MONTH_NAMES[monthIndex]
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'

  const hours = parseInt(match[1] ?? '0')
  const minutes = parseInt(match[2] ?? '0')
  const seconds = parseInt(match[3] ?? '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const formatViews = (views: string): string => {
  const num = parseInt(views)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return `${num}`
}
