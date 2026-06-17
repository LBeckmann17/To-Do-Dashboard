import { useState, useEffect } from 'react'
import { useTasks } from '../context/TasksContext'
import { PRIO_ORDER, PRIO_API_TO_KEY } from '../utils/constants'
import TaskCard from '../components/TaskCard/TaskCard'
import TaskForm from '../components/TaskForm/TaskForm'
import Icon from '../components/Icon'

const FILTER_OPTS = [
  { key: 'all', label: 'Alle' },
  { key: 'open', label: 'Offen' },
  { key: 'done', label: 'Erledigt' },
  { key: 'urgent', label: 'Kritisch' },
  { key: 'overdue', label: 'Überfällig' },
]

const SORT_OPTS = [
  { key: 'created', label: 'Erstellt' },
  { key: 'priority', label: 'Priorität' },
  { key: 'deadline', label: 'Fälligkeit' },
]

export default function TaskListPage({ list }) {
  const { tasks, loading } = useTasks()
  const [filter, setFilter] = useState('open')
  const [sort, setSort] = useState('priority')
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => {
    const handler = () => setAddingTask(true)
    window.addEventListener('fab-click', handler)
    return () => window.removeEventListener('fab-click', handler)
  }, [])

  const listTasks = tasks.filter(t => t.list_type === list.api)

  const filtered = listTasks.filter(t => {
    if (filter === 'open') return !t.is_completed
    if (filter === 'done') return t.is_completed
    if (filter === 'urgent') return !t.is_completed && (t.priority === 'urgent' || t.priority === 'high')
    if (filter === 'overdue') return !t.is_completed && t.deadline && new Date(t.deadline) < new Date()
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'priority') {
      return (PRIO_ORDER[PRIO_API_TO_KEY[a.priority]] || 3) - (PRIO_ORDER[PRIO_API_TO_KEY[b.priority]] || 3)
    }
    if (sort === 'deadline') {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline) - new Date(b.deadline)
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const openCount = listTasks.filter(t => !t.is_completed).length
  const doneCount = listTasks.filter(t => t.is_completed).length
  const pct = listTasks.length > 0 ? Math.round((doneCount / listTasks.length) * 100) : 0

  return (
    <div className="view">
      <div className="view-head">
        <div className="view-title-row">
          <div className="view-dot" style={{ background: list.color }} />
          <h1 className="view-title">{list.label}</h1>
          <div className="view-prog-mini">
            <div className="bar" style={{ width: 100 }}>
              <i style={{ width: `${pct}%`, background: list.color }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{pct}%</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button
              className="btn-primary"
              style={{ background: list.color }}
              onClick={() => setAddingTask(v => !v)}
            >
              <Icon name="Plus" size={15} /> Aufgabe
            </button>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, paddingBottom: 16 }}>
          {openCount} offen · {doneCount} erledigt
        </div>
      </div>

      <div className="view-body scroll">
        {addingTask && (
          <div style={{ marginBottom: 16 }}>
            <TaskForm listKey={list.key} onClose={() => setAddingTask(false)} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="chip-row" style={{ marginBottom: 0 }}>
            {FILTER_OPTS.map(o => (
              <button
                key={o.key}
                className={`fchip${filter === o.key ? ' on' : ''}`}
                onClick={() => setFilter(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Sortierung:</span>
            {SORT_OPTS.map(o => (
              <button
                key={o.key}
                className={`fchip${sort === o.key ? ' on' : ''}`}
                style={{ fontSize: 12 }}
                onClick={() => setSort(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <Icon name="Loader2" size={18} />
            Lade…
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="loading-state" style={{ color: 'var(--text-3)' }}>
            Keine Aufgaben gefunden
          </div>
        )}

        <div className="task-list">
          {sorted.map(t => <TaskCard key={t.id} task={t} />)}
        </div>

        {!addingTask && (
          <button className="add-task" onClick={() => setAddingTask(true)} style={{ marginTop: 10 }}>
            <Icon name="Plus" size={16} />
            Aufgabe hinzufügen
          </button>
        )}
      </div>
    </div>
  )
}
