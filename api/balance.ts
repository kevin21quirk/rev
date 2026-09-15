import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const url = process.env.DATABASE_URL
  if (!url) return res.status(500).json({ error: 'DATABASE_URL not set' })
  try {
    const sql = neon(url.replace(/[&?]channel_binding=[^&]*/g, ''))
    const [setting] = await sql`SELECT value FROM settings WHERE key = 'opening_balance'`
    const [agg]     = await sql`SELECT COALESCE(SUM(amount), 0) AS total FROM transactions`
    const opening   = parseFloat(setting?.value ?? '0')
    const total     = parseFloat(String(agg.total))
    return res.json({ balance: +(opening + total).toFixed(2), opening_balance: opening })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[balance]', message)
    return res.status(500).json({ error: message })
  }
}
