import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool } from './db'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const pool = getPool()
    const { rows: settings } = await pool.query(
      "SELECT value FROM settings WHERE key = 'opening_balance'"
    )
    const { rows: agg } = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM transactions'
    )
    const opening = parseFloat(settings[0]?.value ?? '0')
    const total   = parseFloat(String(agg[0].total))
    return res.json({ balance: +(opening + total).toFixed(2), opening_balance: opening })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[balance]', message)
    return res.status(500).json({ error: message })
  }
}
