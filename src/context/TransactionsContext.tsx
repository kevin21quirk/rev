import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { fetchTransactions, fetchBalance, type Transaction } from '../lib/api'

interface TransactionsContextValue {
  transactions: Transaction[]
  balance: number
  openingBalance: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [openingBalance, setOpeningBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [txs, bal] = await Promise.all([fetchTransactions(), fetchBalance()])
      setTransactions(txs)
      setBalance(bal.balance)
      setOpeningBalance(bal.opening_balance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <TransactionsContext.Provider value={{ transactions, balance, openingBalance, loading, error, refetch }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx) throw new Error('useTransactions must be used inside TransactionsProvider')
  return ctx
}
