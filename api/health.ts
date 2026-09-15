import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const url = process.env.DATABASE_URL
  if (!url) return res.status(500).json({ ok: false, error: 'DATABASE_URL not set' })
  try {
    const sql = neon(url.replace(/[&?]channel_binding=[^&]*/g, ''))
    const [cnt]  = await sql`SELECT COUNT(*) AS count FROM transactions`
    const [bal]  = await sql`SELECT value FROM settings WHERE key = 'opening_balance'`
    return res.json({ ok: true, db: 'connected', transaction_count: Number(cnt.count), opening_balance: bal?.value ?? 'not set' })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Unknown' })
  }
}
