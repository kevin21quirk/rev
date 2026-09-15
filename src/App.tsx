import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './components/HomePage'
import RightPanel from './components/RightPanel'
import CardsPage from './components/CardsPage'
import TransfersPage from './components/TransfersPage'
import AnalyticsPage from './components/AnalyticsPage'
import BillsPage from './components/BillsPage'
import ExpensesPage from './components/ExpensesPage'
import TeamPage from './components/TeamPage'
import RevPointsPage from './components/RevPointsPage'
import TreasuryPage from './components/TreasuryPage'
import MerchantPage from './components/MerchantPage'
import AdminPage from './components/AdminPage'
import TransactionsModal from './components/TransactionsModal'
import AddMoneyModal from './components/AddMoneyModal'

export type NavItem =
  | 'Home'
  | 'Cards'
  | 'Merchant'
  | 'Transfers'
  | 'Treasury'
  | 'Bills'
  | 'Expenses'
  | 'Team'
  | 'RevPoints'
  | 'Analytics'
  | 'Admin'

function getInitialNav(): NavItem {
  return window.location.pathname === '/admin' ? 'Admin' : 'Home'
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>(getInitialNav)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [showAddMoney, setShowAddMoney] = useState(false)

  const handleNavChange = (nav: NavItem) => {
    setActiveNav(nav)
    window.history.pushState(null, '', nav === 'Admin' ? '/admin' : '/')
  }

  const renderPage = () => {
    switch (activeNav) {
      case 'Home':
        return <HomePage onSeeAll={() => setShowAllTransactions(true)} onAddMoney={() => setShowAddMoney(true)} />
      case 'Cards':      return <CardsPage />
      case 'Merchant':   return <MerchantPage />
      case 'Transfers':  return <TransfersPage />
      case 'Treasury':   return <TreasuryPage />
      case 'Bills':      return <BillsPage />
      case 'Expenses':   return <ExpensesPage />
      case 'Team':       return <TeamPage />
      case 'RevPoints':  return <RevPointsPage />
      case 'Analytics':  return <AnalyticsPage />
      case 'Admin':      return <AdminPage />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0e0e15' }}>
      <Sidebar activeNav={activeNav} setActiveNav={handleNavChange} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header activeNav={activeNav} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {renderPage()}
          </div>
          {activeNav === 'Home' && (
            <RightPanel onAddMoney={() => setShowAddMoney(true)} />
          )}
        </div>
      </div>

      {showAllTransactions && <TransactionsModal onClose={() => setShowAllTransactions(false)} />}
      {showAddMoney        && <AddMoneyModal     onClose={() => setShowAddMoney(false)} />}
    </div>
  )
}
