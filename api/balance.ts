import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDB } from './db'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const sql = await getDB()
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
