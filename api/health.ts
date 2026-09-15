import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDB } from './db'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const sql = getDB()
    await sql`SELECT 1`
    const rows = await sql`SELECT COUNT(*) AS count FROM transactions`
    const [bal] = await sql`SELECT value FROM settings WHERE key = 'opening_balance'`
    return res.json({
      ok: true,
      db: 'connected',
      transaction_count: Number(rows[0].count),
      opening_balance: bal?.value ?? 'not set',
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
