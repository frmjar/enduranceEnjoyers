import type { APIRoute } from 'astro'
import { sheets } from '../../libs/google'

const SPREADSHEET_ID = import.meta.env.SHEET_ID_RESISTENCIAS
const headers = ['Season', 'Week', 'Fecha', 'Serie', 'Team', 'Duracion', 'Circuito', 'Lluvia', 'Coches']

export const GET: APIRoute = async (): Promise<Response> => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'B239:J294'
  })

  const rows = response.data.values ?? []

  let lastSeason = ''
  let lastWeek = ''
  let lastFecha = ''

  const data = rows.map(row => {
    if (row[0]) lastSeason = row[0]
    else row[0] = lastSeason

    if (row[1]) lastWeek = row[1]
    else row[1] = lastWeek

    if (row[2]) lastFecha = row[2]
    else row[2] = lastFecha

    return Object.fromEntries(headers.map((h, i): [string, string] => [h, row[i] || '']))
  })

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
}
