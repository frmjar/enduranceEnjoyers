import { google } from 'googleapis'

export const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    credentials: {
      type: import.meta.env.GOOGLE_TYPE,
      private_key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: import.meta.env.GOOGLE_CLIENT_EMAIL
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
})
