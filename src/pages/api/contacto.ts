import type { APIRoute } from 'astro'
import { sheets } from '../../libs/google'

export const prerender = false

const SPREADSHEET_ID = import.meta.env.SHEET_ID_CONTACTO

export const POST: APIRoute = async ({ request }): Promise<Response> => {
  const data = await request.formData()

  const iracingName = data.get('iracingName')?.toString() ?? ''
  const iracingId = data.get('iracingId')?.toString() ?? ''
  const discord = data.get('discord')?.toString() ?? ''
  const email = data.get('email')?.toString() ?? ''
  const iracingSafety = data.get('iracingSafety')?.toString() ?? ''
  const experience = data.get('experience')?.toString() ?? ''
  const additionalInfo = data.get('additionalInfo')?.toString() ?? ''

  // Formatear fecha al formato DD/MM/AAAA HH:mm:ss
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[formattedDate, iracingName, iracingId, email, iracingSafety, experience, discord, additionalInfo]]
      }
    })
  } catch (err) {
    console.error('Error al guardar en Sheets:', err)
    return new Response('Error al guardar en Sheets', { status: 500 })
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
