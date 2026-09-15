import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { sql, initDB } from './db'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// ── GET /api/transactions ─────────────────────────────────────────────────────
app.get('/api/transactions', async (_req, res) => {
  try {
    const rows = await sql`
      SELECT * FROM transactions ORDER BY date_iso DESC, created_at DESC
    `
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// ── POST /api/transactions ────────────────────────────────────────────────────
app.post('/api/transactions', async (req, res) => {
  const { merchant, merchant_initials, merchant_color, reference, date_label, date_iso, status, category, amount, currency } = req.body
  if (!merchant || amount === undefined) {
    return res.status(400).json({ error: 'merchant and amount are required' })
  }
  try {
    const rows = await sql`
      INSERT INTO transactions
        (merchant, merchant_initials, merchant_color, reference, date_label, date_iso, status, category, amount, currency)
      VALUES (
        ${merchant},
        ${merchant_initials || merchant.slice(0, 3).toUpperCase()},
        ${merchant_color || '#3b82f6'},
        ${reference || '–'},
        ${date_label || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })},
        ${date_iso || new Date().toISOString()},
        ${status || 'Completed'},
        ${category || 'Expenses'},
        ${Number(amount)},
        ${currency || 'GBP'}
      )
      RETURNING *
    `
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
})

// ── DELETE /api/transactions/:id ──────────────────────────────────────────────
app.delete('/api/transactions/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const rows = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING id`
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ deleted: id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete transaction' })
  }
})

// ── GET /api/balance ──────────────────────────────────────────────────────────
app.get('/api/balance', async (_req, res) => {
  try {
    const [setting] = await sql`SELECT value FROM settings WHERE key = 'opening_balance'`
    const [agg]     = await sql`SELECT COALESCE(SUM(amount), 0) AS total FROM transactions`
    const opening   = parseFloat(setting?.value ?? '0')
    const total     = parseFloat(String(agg.total))
    res.json({ balance: +(opening + total).toFixed(2), opening_balance: opening })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch balance' })
  }
})

// ── PUT /api/settings/opening_balance ─────────────────────────────────────────
app.put('/api/settings/opening_balance', async (req, res) => {
  const { value } = req.body
  if (value === undefined) return res.status(400).json({ error: 'value required' })
  try {
    await sql`
      INSERT INTO settings (key, value) VALUES ('opening_balance', ${String(value)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `
    res.json({ opening_balance: Number(value) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update setting' })
  }
})

// ── Boot ──────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 API server running on http://localhost:${PORT}`))
}).catch(err => {
  console.error('Failed to initialise DB:', err)
  process.exit(1)
})
