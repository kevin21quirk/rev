import { neon } from '@neondatabase/serverless'

export function getDB() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set in Vercel Environment Variables')
  return neon(url.replace(/[&?]channel_binding=[^&]*/g, ''))
}
