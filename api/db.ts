import { Pool } from 'pg'

function cleanUrl(url: string): string {
  return url
    .replace(/[&?]channel_binding=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/&&/, '&')
}

// Pool is reused across warm invocations
let pool: Pool | undefined

export function getPool(): Pool {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set in Vercel Environment Variables')
  if (!pool) {
    pool = new Pool({
      connectionString: cleanUrl(url),
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
  }
  return pool
}
