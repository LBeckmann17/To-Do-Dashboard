import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../context/TasksContext'
import { LISTS, PRIO_ORDER, PRIO_API_TO_KEY } from '../utils/constants'
import TaskCard from '../components/TaskCard/TaskCard'
import TaskForm from '../components/TaskForm/TaskForm'
import Icon from '../components/Icon'

export default function Dashboard() {
  const { tasks, loading } = useTasks()
  const [addingTask, setAddingTask] = useState(false)
  const navigate = useNavigate()

  const openTasks = tasks.filter(t => !t.is_completed)
  const overdueTasks = openTasks.filter(t => t.deadline && new Date(t.deadline) < new Date())
  const urgentTasks = openTasks
    .filter(t => t.priority === 'urgent' || t.priority === 'high')
    .sort((a, b) => PRIO_ORDER[PRIO_API_TO_KEY[a.priority]] - PRIO_ORDER[PRIO_API_TO_KEY[b.priority]])
    .slice(0, 5)

  function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Guten Morgen'
    if (h < 17) return 'Guten Tag'
    return 'Guten Abend'
  }

  function countOpen(apiType) {
    return openTasks.filter(t => t.list_type === apiType).length
  }

  function countDone(apiType) {
    return tasks.filter(t => t.list_type === apiType && t.is_completed).length
  }

  return (
    <div className="dashboard scroll">
      <div className="dash-head">
        <div>
          <div className="greeting">
            {getGreeting()}, <span className="accent">Leon</span>
          </div>
          <div className="dash-sub">
            {openTasks.length} offene Aufgaben
            {overdueTasks.length > 0 && ` · ${overdueTasks.length} überfällig`}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-primary" onClick={() => setAddingTask(true)}>
            <Icon name="Plus" size={16} /> Neue Aufgabe
          </button>
        </div>
      </div>

      {addingTask && (
        <div style={{ marginBottom: 20 }}>
          <TaskForm onClose={() => setAddingTask(false)} />
        </div>
      )}

      <div className="stat-grid">
        {LISTS.map(list => {
          const open = countOpen(list.api)
          const done = countDone(list.api)
          const total = open + done
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <div key={list.key} className="stat-card" onClick={() => navigate(list.path)}>
              <div className="stat-top">
                <span className="nav-dot" style={{ background: list.color }} />
                <span className="stat-name">{list.label}</span>
                <span className="stat-ic"><Icon name={list.icon} size={15} /></span>
              </div>
              <div className="stat-nums">
                <span className="stat-open">{open}</span>
                <span className="stat-meta">offen · {pct}% erledigt</span>
              </div>
              <div className="bar">
                <i style={{ width: `${pct}%`, background: list.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {urgentTasks.length > 0 && (
        <section>
          <div className="sec-head">
            <div className="sec-title">Priorität</div>
            <div className="sec-count">{urgentTasks.length}</div>
          </div>
          <div className="task-list">
            {urgentTasks.map(t => <TaskCard key={t.id} task={t} showList />)}
          </div>
        </section>
      )}

      {overdueTasks.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <div className="sec-head">
            <div className="sec-title" style={{ color: 'var(--overdue)' }}>Überfällig</div>
            <div className="sec-count">{overdueTasks.length}</div>
          </div>
          <div className="task-list">
            {overdueTasks.map(t => <TaskCard key={t.id} task={t} showList />)}
          </div>
        </section>
      )}

      {loading && (
        <div className="loading-state">
          <Icon name="Loader2" size={18} className="spinner" />
          Lade Aufgaben…
        </div>
      )}
    </div>
  )
}
