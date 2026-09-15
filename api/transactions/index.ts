import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const url = process.env.DATABASE_URL
  if (!url) return res.status(500).json({ error: 'DATABASE_URL not set' })

  try {
    const sql = neon(url.replace(/[&?]channel_binding=[^&]*/g, ''))

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM transactions ORDER BY date_iso DESC, created_at DESC`
      return res.json(rows)
    }

    if (req.method === 'POST') {
      const { merchant, merchant_initials, merchant_color, reference, date_label, date_iso, status, category, amount, currency } = req.body
      if (!merchant || amount === undefined) return res.status(400).json({ error: 'merchant and amount are required' })
      const rows = await sql`
        INSERT INTO transactions (merchant, merchant_initials, merchant_color, reference, date_label, date_iso, status, category, amount, currency)
        VALUES (
          ${merchant},
          ${merchant_initials || merchant.slice(0, 3).toUpperCase()},
          ${merchant_color || '#3b82f6'},
          ${reference || '\u2013'},
          ${date_label || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })},
          ${date_iso || new Date().toISOString()},
          ${status || 'Completed'},
          ${category || 'Expenses'},
          ${Number(amount)},
          ${currency || 'GBP'}
        )
        RETURNING *`
      return res.status(201).json(rows[0])
    }

    if (req.method === 'DELETE') {
      // Bulk delete all
      if (req.query.all === 'true') {
        await sql`DELETE FROM transactions`
        return res.json({ deleted: 'all' })
      }
      // Single delete by id
      const id = parseInt(String(req.query.id), 10)
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
      const rows = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING id`
      if (rows.length === 0) return res.status(404).json({ error: 'Transaction not found' })
      return res.json({ deleted: id })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[transactions]', message)
    return res.status(500).json({ error: message })
  }
}
