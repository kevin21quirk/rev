import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pool } from 'pg'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const url = (process.env.DATABASE_URL ?? '').replace(/[&?]channel_binding=[^&]*/g, '')
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
    const { rows } = await pool.query('SELECT 1 AS one')
    await pool.end()
    return res.json({ ok: true, result: rows[0] })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
