# Revolut Business — Banking App

A pixel-perfect Revolut Business clone built with React + Vite + TypeScript + Tailwind CSS, backed by a Neon PostgreSQL database.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| API (local) | Express.js + `tsx` |
| API (production) | Vercel Serverless Functions (`/api`) |
| Database | Neon PostgreSQL (`@neondatabase/serverless`) |

---

## Local development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
Copy `.env.example` to `.env` and fill in your Neon connection string:
```bash
cp .env.example .env
```

```.env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
VITE_API_URL=http://localhost:4000
```

### 3. Start both servers
```bash
npm run dev
```
This starts:
- **Vite** on `http://localhost:5173` (frontend)
- **Express API** on `http://localhost:4000` (backend, seeds DB on first run)

---

## Deploy to Vercel

### 1. Import the GitHub repo
Go to [vercel.com/new](https://vercel.com/new) → Import `kevin21quirk/rev`

### 2. Add environment variable
In the Vercel project settings → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require` |

> Do **not** include `VITE_API_URL` on Vercel — the frontend will use relative `/api` paths automatically.

### 3. Deploy
Vercel will build with `npm run build` and serve the API routes from the `/api` directory automatically.

### 4. Seed the database (first deploy only)
The database is seeded automatically the first time the Express server runs locally (`npm run dev`). On Vercel the tables are created on the first API request.

---

## Pages

| Page | Features |
|------|---------|
| **Home** | Live balance, transaction table from DB, Add money |
| **Cards** | Card management, freeze/unfreeze, spending limits |
| **Merchant** | Payment links, received payments |
| **Transfers** | Send / Request / Exchange with confirm flow |
| **Treasury** | Savings accounts, FX exchange, FX Forwards |
| **Bills** | Due/paid/scheduled bills, pay-now flow |
| **Expenses** | Approve/reject workflow, categories |
| **Team** | Member management, invite flow |
| **RevPoints** | Points balance, rewards, history |
| **Analytics** | Bar chart, spending by category, monthly breakdown |
| **Admin** | Add/delete transactions, edit opening balance |

---

## Database schema

```sql
transactions (id, merchant, merchant_initials, merchant_color,
              reference, date_label, date_iso, status, category,
              amount, currency, created_at)

settings     (key, value)   -- stores opening_balance
```

Balance = `opening_balance` + `SUM(transactions.amount)`
