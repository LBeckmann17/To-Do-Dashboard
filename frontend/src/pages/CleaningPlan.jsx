import { useState, useEffect } from 'react'
import { useCleaning } from '../context/CleaningContext'
import Icon from '../components/Icon'

const CATS = [
  { key: 'general',     label: 'Allgemein',     emoji: '🏠' },
  { key: 'bathroom',    label: 'Bad',            emoji: '🚿' },
  { key: 'kitchen',     label: 'Küche',          emoji: '🍳' },
  { key: 'living_room', label: 'Wohnzimmer',     emoji: '🛋️' },
  { key: 'office',      label: 'Arbeitszimmer',  emoji: '💻' },
  { key: 'bedroom',     label: 'Schlafzimmer',   emoji: '🛏️' },
]

const INTERVALS = [
  { value: 'daily',     label: 'Täglich' },
  { value: 'weekly',    label: 'Wöchentlich' },
  { value: 'biweekly',  label: 'Alle 2 Wochen' },
  { value: 'monthly',   label: 'Monatlich' },
  { value: 'quarterly', label: 'Vierteljährlich' },
  { value: 'yearly',    label: 'Jährlich' },
]

const INTERVAL_SHORT = {
  daily: 'Tägl.', weekly: 'Wöch.', biweekly: '2-Wöch.',
  monthly: 'Monatl.', quarterly: 'Quartal', yearly: 'Jährl.',
}

function getDueStatus(task) {
  if (!task.next_due_at) return { type: 'never' }
  const diffDays = Math.floor((new Date(task.next_due_at) - Date.now()) / 86400000)
  if (diffDays < 0)  return { type: 'overdue', days: Math.abs(diffDays) }
  if (diffDays === 0) return { type: 'today' }
  if (diffDays <= 3) return { type: 'soon', days: diffDays }
  return { type: 'ok', days: diffDays }
}

function formatLastDone(isoDate) {
  if (!isoDate) return 'Noch nie'
  const diff = Math.floor((Date.now() - new Date(isoDate)) / 86400000)
  if (diff === 0) return 'Heute'
  if (diff === 1) return 'Gestern'
  if (diff < 7)  return `vor ${diff} Tagen`
  if (diff < 30) return `vor ${Math.floor(diff / 7)} Wo.`
  return `vor ${Math.floor(diff / 30)} Mon.`
}

function DueLabel({ task }) {
  const s = getDueStatus(task)
  if (s.type === 'never')   return <span className="clean-due neutral">Noch nie erledigt</span>
  if (s.type === 'overdue') return <span className="clean-due overdue">{s.days}d überfällig</span>
  if (s.type === 'today')   return <span className="clean-due soon">Heute fällig</span>
  if (s.type === 'soon')    return <span className="clean-due soon">in {s.days} Tagen</span>
  return <span className="clean-due ok">in {s.days} Tagen</span>
}

function CleanTaskCard({ task, onComplete, onUpdate, onDelete }) {
  const [completing, setCompleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  async function handleComplete() {
    setCompleting(true)
    await onComplete(task.id)
    setTimeout(() => setCompleting(false), 600)
  }

  function startEdit() {
    setEditData({
      title: task.title,
      category: task.category,
      recurrence_interval: task.recurrence_interval,
      notes: task.notes || '',
    })
    setEditing(true)
  }

  async function handleSave() {
    if (!editData.title.trim()) return
    await onUpdate(task.id, { ...editData, notes: editData.notes || null })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="clean-task editing">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            className="task-form-input"
            value={editData.title}
            onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <div className="task-form-row">
            <select className="task-form-select" value={editData.category}
              onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}>
              {CATS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </select>
            <select className="task-form-select" value={editData.recurrence_interval}
              onChange={e => setEditData(p => ({ ...p, recurrence_interval: e.target.value }))}>
              {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          <input
            className="task-form-input"
            style={{ fontSize: 13, color: 'var(--text-2)' }}
            placeholder="Notiz (optional)"
            value={editData.notes}
            onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))}
          />
          <div className="task-form-actions">
            <button className="btn-sm cancel" onClick={() => setEditing(false)}>Abbrechen</button>
            <button className="btn-sm submit" onClick={handleSave} disabled={!editData.title.trim()}>Speichern</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="clean-task">
      <button
        className={`clean-complete-btn${completing ? ' completing' : ''}`}
        onClick={handleComplete}
        title="Als erledigt markieren"
      >
        <Icon name="Check" size={14} />
      </button>

      <div className="clean-task-body">
        <div className="clean-task-title">{task.title}</div>
        <div className="clean-task-meta">
          <span className="clean-interval">{INTERVAL_SHORT[task.recurrence_interval]}</span>
          <span className="clean-sep">·</span>
          <span>Zuletzt: {formatLastDone(task.last_completed_at)}</span>
          <span className="clean-sep">·</span>
          <DueLabel task={task} />
        </div>
        {task.notes && <div className="clean-task-notes">{task.notes}</div>}
      </div>

      <div className="clean-task-actions">
        <button className="icon-btn" onClick={startEdit} title="Bearbeiten"
          style={{ width: 26, height: 26 }}>
          <Icon name="Edit3" size={13} />
        </button>
        <button className="icon-btn" onClick={() => onDelete(task.id)} title="Löschen"
          style={{ width: 26, height: 26, color: 'var(--text-3)' }}>
          <Icon name="Trash2" size={13} />
        </button>
      </div>
    </div>
  )
}

const STATUS_ORDER = { overdue: 0, today: 1, never: 2, soon: 3, ok: 4 }

export default function CleaningPlan() {
  const { tasks, loading, addTask, updateTask, completeTask, deleteTask } = useCleaning()
  const [adding, setAdding] = useState(false)
  const [newData, setNewData] = useState({ title: '', category: 'general', recurrence_interval: 'weekly', notes: '' })
  const [collapsed, setCollapsed] = useState({})

  useEffect(() => {
    const handler = () => setAdding(true)
    window.addEventListener('fab-click', handler)
    return () => window.removeEventListener('fab-click', handler)
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newData.title.trim()) return
    await addTask({ ...newData, notes: newData.notes || null })
    setNewData({ title: '', category: 'general', recurrence_interval: 'weekly', notes: '' })
    setAdding(false)
  }

  const overdueCount = tasks.filter(t => ['overdue', 'today', 'never'].includes(getDueStatus(t).type)).length

  return (
    <div className="view" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="view-head">
        <div className="view-title-row">
          <div className="view-dot" style={{ background: '#10b981' }} />
          <h1 className="view-title">Putzen</h1>
          {overdueCount > 0 && (
            <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--p-urgent)', background: 'var(--p-urgent-bg)', borderRadius: 99, padding: '3px 10px', fontWeight: 600 }}>
              {overdueCount} fällig
            </span>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-primary" style={{ background: '#10b981' }} onClick={() => setAdding(v => !v)}>
              <Icon name="Plus" size={15} /><span className="view-btn-label"> Aufgabe</span>
            </button>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
          {tasks.length} Aufgaben · erledigte Aufgaben starten automatisch neu
        </div>
      </div>

      <div className="view-body scroll" style={{ flex: '1 1 auto', minHeight: 0, paddingBottom: 80 }}>
        {adding && (
          <form className="task-form-card fade-in" onSubmit={handleAdd} style={{ marginBottom: 16 }}>
            <input
              className="task-form-input"
              placeholder="Neue Reinigungsaufgabe…"
              value={newData.title}
              onChange={e => setNewData(p => ({ ...p, title: e.target.value }))}
              autoFocus
            />
            <div className="task-form-row">
              <select className="task-form-select" value={newData.category}
                onChange={e => setNewData(p => ({ ...p, category: e.target.value }))}>
                {CATS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
              <select className="task-form-select" value={newData.recurrence_interval}
                onChange={e => setNewData(p => ({ ...p, recurrence_interval: e.target.value }))}>
                {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <input
              className="task-form-input"
              style={{ fontSize: 13, color: 'var(--text-2)' }}
              placeholder="Notiz (optional)"
              value={newData.notes}
              onChange={e => setNewData(p => ({ ...p, notes: e.target.value }))}
            />
            <div className="task-form-actions">
              <button type="button" className="btn-sm cancel" onClick={() => setAdding(false)}>Abbrechen</button>
              <button type="submit" className="btn-sm submit" disabled={!newData.title.trim()}>Erstellen</button>
            </div>
          </form>
        )}

        {loading && <div className="loading-state"><Icon name="Loader2" size={18} /> Lade…</div>}

        {CATS.map(cat => {
          const catTasks = tasks
            .filter(t => t.category === cat.key)
            .sort((a, b) => (STATUS_ORDER[getDueStatus(a).type] ?? 5) - (STATUS_ORDER[getDueStatus(b).type] ?? 5))
          if (catTasks.length === 0) return null
          const closed = collapsed[cat.key]
          const overdue = catTasks.filter(t => ['overdue', 'today'].includes(getDueStatus(t).type)).length

          return (
            <div key={cat.key} className={`cat${closed ? ' closed' : ''}`}>
              <button className="cat-head" onClick={() => setCollapsed(p => ({ ...p, [cat.key]: !p[cat.key] }))}>
                <div className="cat-emoji">{cat.emoji}</div>
                <span className="cat-name">{cat.label}</span>
                <span className="cat-count">{catTasks.length}</span>
                {overdue > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--p-urgent)', fontWeight: 700, marginLeft: 4 }}>
                    {overdue} fällig
                  </span>
                )}
                <span className="cat-chev"><Icon name="ChevronDown" size={15} /></span>
              </button>
              <div className="cat-items-wrap">
                <div className="cat-items-inner" style={{ padding: 0 }}>
                  {catTasks.map(task => (
                    <CleanTaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {!loading && tasks.length === 0 && (
          <div className="loading-state" style={{ color: 'var(--text-3)', flexDirection: 'column', gap: 8, marginTop: 40 }}>
            <Icon name="Sparkles" size={28} />
            Noch keine Aufgaben — füge deine erste Reinigungsaufgabe hinzu.
          </div>
        )}
      </div>
    </div>
  )
}
