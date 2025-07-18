import type { APIRoute } from 'astro'
import { sheets } from '../../libs/google'

export const prerender = false

const SPREADSHEET_ID = import.meta.env.SHEET_ID

export const POST: APIRoute = async ({ request }): Promise<Response> => {
  const data = await request.formData()

  const iracing = data.get('iracing')?.toString() ?? ''
  const id = data.get('id')?.toString() ?? ''
  const discord = data.get('discord')?.toString() ?? ''
  const email = data.get('email')?.toString() ?? ''
  const irating = data.get('irating')?.toString() ?? ''
  const experience = data.get('experience')?.toString() ?? ''
  const message = data.get('message')?.toString() ?? ''

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[new Date().toISOString(), iracing, id, email, irating, experience, discord, message]]
      }
    })
  } catch (err) {
    console.error('Error al guardar en Sheets:', err)
    return new Response('Error al guardar en Sheets', { status: 500 })
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
