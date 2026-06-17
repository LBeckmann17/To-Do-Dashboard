import { NavLink, useLocation } from 'react-router-dom'
import { LISTS } from '../../utils/constants'
import { useTasks } from '../../context/TasksContext'
import Icon from '../Icon'

const NAV_MAIN = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard', exact: true },
  { to: '/calendar', label: 'Kalender', icon: 'Calendar' },
  { to: '/chat', label: 'Claude AI', icon: 'MessageSquare' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { tasks } = useTasks()
  const location = useLocation()

  function countOpen(apiType) {
    return tasks.filter(t => t.list_type === apiType && !t.is_completed).length
  }

  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="side-top">
        <div className="brand-mark">
          <Icon name="Check" size={15} />
        </div>
        <span className="brand-name">Tasker</span>
      </div>

      {/* Toggle-Button immer sichtbar, als erstes Nav-Element */}
      <button
        className="nav-item side-toggle"
        onClick={onToggle}
        title={collapsed ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen'}
      >
        <span className="nav-ic">
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={17} />
        </span>
        <span className="nav-label">{collapsed ? 'Ausklappen' : 'Einklappen'}</span>
      </button>

      {NAV_MAIN.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          title={collapsed ? item.label : undefined}
        >
          <span className="nav-ic"><Icon name={item.icon} size={17} /></span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}

      <div className="side-section">Listen</div>

      {LISTS.map(list => {
        const count = countOpen(list.api)
        const isActive = location.pathname === list.path
        return (
          <NavLink
            key={list.key}
            to={list.path}
            className={`nav-item${isActive ? ' active' : ''}`}
            title={collapsed ? list.label : undefined}
          >
            <span className="nav-dot" style={{ background: list.color }} />
            <span className="nav-label">{list.label}</span>
            {count > 0 && <span className="nav-count">{count}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}
