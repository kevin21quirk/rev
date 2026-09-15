import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool } from './db'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const pool = getPool()
    await pool.query('SELECT 1')
    const { rows: txRows } = await pool.query('SELECT COUNT(*) AS count FROM transactions')
    const { rows: balRows } = await pool.query("SELECT value FROM settings WHERE key = 'opening_balance'")
    return res.json({
      ok: true,
      db: 'connected (pg)',
      transaction_count: Number(txRows[0].count),
      opening_balance: balRows[0]?.value ?? 'not set',
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
