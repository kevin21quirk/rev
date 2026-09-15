const BASE = import.meta.env.VITE_API_URL ?? ''

export interface Transaction {
  id: number
  merchant: string
  merchant_initials: string
  merchant_color: string
  reference: string
  date_label: string
  date_iso: string
  status: string
  category: string
  amount: number
  currency: string
  created_at: string
}

export interface NewTransaction {
  merchant: string
  merchant_initials?: string
  merchant_color?: string
  reference?: string
  date_label?: string
  date_iso?: string
  status?: string
  category?: string
  amount: number
  currency?: string
}

async function apiError(res: Response, fallback: string): Promise<never> {
  try {
    const body = await res.json()
    throw new Error(body?.error ?? fallback)
  } catch (e) {
    if (e instanceof SyntaxError) throw new Error(fallback)
    throw e
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${BASE}/api/transactions`)
  if (!res.ok) await apiError(res, 'Failed to fetch transactions')
  return res.json()
}

export async function fetchBalance(): Promise<{ balance: number; opening_balance: number }> {
  const res = await fetch(`${BASE}/api/balance`)
  if (!res.ok) await apiError(res, 'Failed to fetch balance')
  return res.json()
}

export async function createTransaction(data: NewTransaction): Promise<Transaction> {
  const res = await fetch(`${BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) await apiError(res, 'Failed to create transaction')
  return res.json()
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/transactions?id=${id}`, { method: 'DELETE' })
  if (!res.ok) await apiError(res, 'Failed to delete transaction')
}

export async function clearAllTransactions(): Promise<void> {
  const res = await fetch(`${BASE}/api/transactions?all=true`, { method: 'DELETE' })
  if (!res.ok) await apiError(res, 'Failed to clear transactions')
}

export async function updateOpeningBalance(value: number): Promise<void> {
  const res = await fetch(`${BASE}/api/settings/opening_balance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  if (!res.ok) await apiError(res, 'Failed to update opening balance')
}
