import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { pool, initDB } from './db'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/transactions', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM transactions ORDER BY date_iso DESC, created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' })
  }
})

app.post('/api/transactions', async (req, res) => {
  const { merchant, merchant_initials, merchant_color, reference, date_label, date_iso, status, category, amount, currency } = req.body
  if (!merchant || amount === undefined) return res.status(400).json({ error: 'merchant and amount are required' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO transactions (merchant, merchant_initials, merchant_color, reference, date_label, date_iso, status, category, amount, currency)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        merchant,
        merchant_initials || merchant.slice(0, 3).toUpperCase(),
        merchant_color || '#3b82f6',
        reference || '–',
        date_label || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        date_iso || new Date().toISOString(),
        status || 'Completed',
        category || 'Expenses',
        Number(amount),
        currency || 'GBP',
      ]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' })
  }
})

app.delete('/api/transactions/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const { rows } = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING id', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ deleted: id })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' })
  }
})

app.get('/api/balance', async (_req, res) => {
  try {
    const { rows: s } = await pool.query("SELECT value FROM settings WHERE key = 'opening_balance'")
    const { rows: a } = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM transactions')
    const opening = parseFloat(s[0]?.value ?? '0')
    const total   = parseFloat(String(a[0].total))
    res.json({ balance: +(opening + total).toFixed(2), opening_balance: opening })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' })
  }
})

app.put('/api/settings/opening_balance', async (req, res) => {
  const { value } = req.body
  if (value === undefined) return res.status(400).json({ error: 'value required' })
  try {
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('opening_balance', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [String(value)]
    )
    res.json({ opening_balance: Number(value) })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error' })
  }
})

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 API server on http://localhost:${PORT}`))
}).catch(err => {
  console.error('Failed to init DB:', err)
  process.exit(1)
})
