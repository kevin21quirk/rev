import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDB } from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const sql = getDB()
  const id = parseInt(String(req.query.id), 10)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  const rows = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  return res.json({ deleted: id })
}
