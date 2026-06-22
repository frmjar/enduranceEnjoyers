import type { RaceData } from './date'

export const fetchRaces = async (origin: string): Promise<RaceData[]> => {
  try {
    const res = await fetch(`${origin}/api/resistencias`)
    if (res.ok) return await res.json()
  } catch (err) {
    console.error('Error de conexión con la API:', err)
  }
  return []
}
