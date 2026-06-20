import { useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Header/Header'
import ClaudePanel from './components/ClaudePanel/ClaudePanel'
import Dashboard from './pages/Dashboard'
import PrivateList from './pages/PrivateList'
import CleaningPlan from './pages/CleaningPlan'
import ShoppingList from './pages/ShoppingList'
import CalendarView from './pages/CalendarView'
import ClaudeChat from './pages/ClaudeChat'
import { useTheme } from './hooks/useTheme'
import Icon from './components/Icon'

const MOBILE_TABS = [
  { to: '/',         icon: 'LayoutDashboard', label: 'Start' },
  { to: '/private',  icon: 'User',            label: 'Privat',  color: '#8b5cf6' },
  null, // FAB placeholder
  { to: '/shopping', icon: 'ShoppingCart',    label: 'Einkauf', color: '#f97316' },
  { to: '/chat',     icon: 'MessageSquare',   label: 'Claude' },
]

export default function App() {
  const { theme, toggle } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const isChatPage = location.pathname === '/chat'

  return (
    <div className="shell">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />

      <div className="main">
        <Header
          theme={theme}
          onThemeToggle={toggle}
          onAssistantToggle={() => setAssistantOpen(v => !v)}
          assistantOpen={assistantOpen}
        />
        <div className="content">
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/private"  element={<PrivateList />} />
            <Route path="/cleaning" element={<CleaningPlan />} />
            <Route path="/shopping" element={<ShoppingList />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/chat"     element={<ClaudeChat />} />
          </Routes>

          {!isChatPage && (
            <>
              <ClaudePanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
              {!assistantOpen && (
                <button
                  className="asst-reopen"
                  onClick={() => setAssistantOpen(true)}
                  title="Claude öffnen"
                >
                  <Icon name="Bot" size={22} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <nav className="mobile-tabbar">
        {MOBILE_TABS.map((tab, i) => {
          if (tab === null) {
            return (
              <div key="fab" className="m-fab-wrap">
                <button className="m-fab" onClick={() => window.dispatchEvent(new CustomEvent('fab-click'))}>
                  <Icon name="Plus" size={22} />
                </button>
              </div>
            )
          }
          const active = location.pathname === tab.to
          return (
            <button
              key={tab.to}
              className={`m-tab${active ? ' on' : ''}`}
              onClick={() => navigate(tab.to)}
              style={active && tab.color ? { color: tab.color } : {}}
            >
              <Icon name={tab.icon} size={22} />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
