import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const url = process.env.DATABASE_URL
  if (!url) return res.status(500).json({ ok: false, error: 'DATABASE_URL not set' })
  try {
    const sql = neon(url.replace(/[&?]channel_binding=[^&]*/g, ''))
    const rows = await sql`SELECT 1 AS one`
    return res.json({ ok: true, result: rows[0] })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
