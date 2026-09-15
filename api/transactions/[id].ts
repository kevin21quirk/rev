import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool } from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const pool = getPool()
    const id = parseInt(String(req.query.id), 10)
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

    const { rows } = await pool.query(
      'DELETE FROM transactions WHERE id = $1 RETURNING id',
      [id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    return res.json({ deleted: id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[transactions/:id]', message)
    return res.status(500).json({ error: message })
  }
}
