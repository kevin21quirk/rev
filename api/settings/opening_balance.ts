import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDB } from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const sql = getDB()
    const { value } = req.body
    if (value === undefined) return res.status(400).json({ error: 'value required' })
    await sql`
      INSERT INTO settings (key, value) VALUES ('opening_balance', ${String(value)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `
    return res.json({ opening_balance: Number(value) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[settings/opening_balance]', message)
    return res.status(500).json({ error: message })
  }
}
