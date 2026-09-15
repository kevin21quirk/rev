import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const url = process.env.DATABASE_URL
  if (!url) {
    return res.status(500).json({
      ok: false,
      error: 'DATABASE_URL is NOT set in Vercel Environment Variables',
      fix: 'Go to Vercel → your project → Settings → Environment Variables and add DATABASE_URL',
    })
  }

  const cleanUrl = url.replace(/[&?]channel_binding=[^&]*/g, '')

  try {
    const sql = neon(cleanUrl)
    await sql`SELECT 1`
    return res.json({
      ok: true,
      db: 'connected',
      host: new URL(cleanUrl).host,
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'DB connection failed',
    })
  }
}
