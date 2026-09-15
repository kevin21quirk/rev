import { Pool } from 'pg'
import 'dotenv/config'

function cleanUrl(url: string): string {
  return url
    .replace(/[&?]channel_binding=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/&&/, '&')
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

export const pool = new Pool({
  connectionString: cleanUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  max: 10,
})

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id                SERIAL PRIMARY KEY,
      merchant          VARCHAR(255)   NOT NULL,
      merchant_initials VARCHAR(10)    NOT NULL DEFAULT '',
      merchant_color    VARCHAR(7)     NOT NULL DEFAULT '#3b82f6',
      reference         VARCHAR(255)   NOT NULL DEFAULT '–',
      date_label        VARCHAR(100)   NOT NULL DEFAULT '',
      date_iso          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      status            VARCHAR(50)    NOT NULL DEFAULT 'Completed',
      category          VARCHAR(100)   NOT NULL DEFAULT 'Expenses',
      amount            NUMERIC(12,2)  NOT NULL,
      currency          VARCHAR(3)     NOT NULL DEFAULT 'GBP',
      created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key   VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  await pool.query(`
    INSERT INTO settings (key, value) VALUES ('opening_balance', '14620.14')
    ON CONFLICT (key) DO NOTHING
  `)

  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM transactions')
  if (Number(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO transactions
        (merchant, merchant_initials, merchant_color, reference, date_label, date_iso, status, category, amount, currency)
      VALUES
        ('Fasthosts',                'FH',  '#3b82f6', '–',              'Yesterday, 3:59 PM', '2026-09-14 15:59:00+00', 'Completed', 'Expenses', -11.16,   'GBP'),
        ('Tesco',                    'T',   '#003087', '–',              'Sep 11, 2:21 PM',    '2026-09-11 14:21:00+00', 'Completed', 'Expenses', -17.75,   'GBP'),
        ('To Kevin Quirk',           'KQ',  '#e8c547', 'Directors Loan', 'Sep 10, 3:02 PM',   '2026-09-10 15:02:00+00', 'Completed', 'Expenses', -2000.00, 'GBP'),
        ('To Kevin Quirk',           'KQ',  '#e8c547', 'Directors Loan', 'Sep 9, 2:31 PM',    '2026-09-09 14:31:00+00', 'Completed', 'Expenses', -2000.00, 'GBP'),
        ('To Kevin Quirk',           'KQ',  '#e8c547', 'Directors Loan', 'Sep 8, 11:12 AM',   '2026-09-08 11:12:00+00', 'Completed', 'Expenses', -3000.00, 'GBP'),
        ('Fasthosts',                'FH',  '#3b82f6', '–',              'Sep 8, 9:26 AM',    '2026-09-08 09:26:00+00', 'Completed', 'Expenses', -6.14,    'GBP'),
        ('ICO',                      'ICO', '#2563eb', '–',              'Sep 7, 3:53 PM',    '2026-09-07 15:53:00+00', 'Completed', 'Expenses', -52.00,   'GBP'),
        ('Fasthosts',                'FH',  '#3b82f6', '–',              'Sep 5, 10:15 AM',   '2026-09-05 10:15:00+00', 'Completed', 'Expenses', -5.58,    'GBP'),
        ('Fasthosts',                'FH',  '#3b82f6', '–',              'Sep 1, 4:13 PM',    '2026-09-01 16:13:00+00', 'Completed', 'Expenses', -5.58,    'GBP'),
        ('Costa Coffee',             'CC',  '#5c1a24', '–',              'Sep 1, 2:27 PM',    '2026-09-01 14:27:00+00', 'Completed', 'Expenses', -3.10,    'GBP'),
        ('Costa Coffee',             'CC',  '#5c1a24', '–',              'Sep 1, 2:09 PM',    '2026-09-01 14:09:00+00', 'Completed', 'Expenses', -4.15,    'GBP'),
        ('Tesco',                    'T',   '#003087', '–',              'Sep 1, 11:50 AM',   '2026-09-01 11:50:00+00', 'Completed', 'Expenses', -80.00,   'GBP'),
        ('The Isle Of Man Steam Pac','IOM', '#059669', '–',              'Aug 31, 8:30 PM',   '2026-08-31 20:30:00+00', 'Completed', 'Expenses', -18.30,   'GBP')
    `)
  }

  console.log('✅ Database initialised')
}
