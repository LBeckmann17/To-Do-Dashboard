import { useState, useRef } from 'react'
import { useTasks } from '../../context/TasksContext'
import { fireConfetti } from '../../utils/confetti'
import { formatDeadlineLabel, isOverdue } from '../../utils/dateUtils'
import { PRIO_API_TO_KEY, PRIO_LABEL } from '../../utils/constants'
import Icon from '../Icon'

const LIST_COLORS = { work: '#3b82f6', private: '#8b5cf6', cleaning: '#10b981', shopping: '#f97316' }
const LIST_LABELS = { work: 'Arbeit', private: 'Privat', cleaning: 'Putzen', shopping: 'Einkauf' }
const PRIO_CLASS = { urgent: 'urgent', high: 'high', medium: 'med', low: 'low' }

const DURATION_OPTS = [
  { value: '',    label: 'Dauer' },
  { value: '2',   label: '< 5 Min' },
  { value: '5',   label: '5 Min' },
  { value: '10',  label: '10 Min' },
  { value: '15',  label: '15 Min' },
  { value: '30',  label: '30 Min' },
  { value: '45',  label: '45 Min' },
  { value: '60',  label: '1h' },
  { value: '90',  label: '1h 30Min' },
  { value: '120', label: '2h' },
  { value: '180', label: '3h' },
  { value: '240', label: '4h' },
  { value: '480', label: '8h' },
]

function formatDuration(minutes) {
  if (!minutes) return null
  if (minutes === 2) return '< 5 Min'
  if (minutes < 60) return `${minutes} Min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}Min` : `${h}h`
}

export default function TaskCard({ task, showList = false }) {
  const { toggleTask, toggleSubtask, addSubtask, deleteTask, updateTask } = useTasks()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [newSub, setNewSub] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const cbRef = useRef(null)

  const overdue = isOverdue(task.deadline)
  const prioKey = PRIO_API_TO_KEY[task.priority]
  const deadlineLabel = formatDeadlineLabel(task.deadline)
  const color = LIST_COLORS[task.list_type]
  const completedSubs = task.subtasks?.filter(s => s.is_completed).length || 0
  const totalSubs = task.subtasks?.length || 0

  async function handleCheck(e) {
    e.stopPropagation()
    const rect = cbRef.current?.getBoundingClientRect()
    if (rect && !task.is_completed) {
      fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, color)
    }
    cbRef.current?.classList.add('pop')
    cbRef.current?.addEventListener('animationend', () => cbRef.current?.classList.remove('pop'), { once: true })
    await toggleTask(task.id)
  }

  async function handleSubCheck(e, subId) {
    e.stopPropagation()
    await toggleSubtask(task.id, subId)
  }

  async function handleAddSub(e) {
    e.preventDefault()
    if (!newSub.trim()) return
    await addSubtask(task.id, newSub.trim())
    setNewSub('')
    setAddingSubtask(false)
  }

  function startEdit(e) {
    e.stopPropagation()
    setEditData({
      title: task.title,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      duration_minutes: task.duration_minutes ? String(task.duration_minutes) : '',
      description: task.notes || '',
    })
    setEditing(true)
    setOpen(true)
  }

  async function handleSave() {
    if (!editData.title.trim()) return
    await updateTask(task.id, {
      title: editData.title.trim(),
      priority: editData.priority,
      deadline: editData.deadline || null,
      duration_minutes: editData.duration_minutes ? parseInt(editData.duration_minutes) : null,
      notes: editData.description || null,
    })
    setEditing(false)
  }

  function handleCancel() {
    setEditing(false)
  }

  function set(field) {
    return e => setEditData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className={`task-card${open ? ' open' : ''}${task.is_completed ? ' done' : ''}${overdue && !task.is_completed ? ' overdue' : ''}`}>
      <div className="task-row">
        <div
          ref={cbRef}
          className={`checkbox${task.is_completed ? ' checked' : ''}`}
          style={{ '--c': color }}
          onClick={handleCheck}
          role="checkbox"
          aria-checked={task.is_completed}
          tabIndex={0}
          onKeyDown={e => e.key === ' ' && handleCheck(e)}
        >
          <svg viewBox="0 0 16 16">
            <path d="M2.5 8.5L6.5 12L13.5 4" />
          </svg>
        </div>

        <div className="task-body" onClick={() => !editing && setOpen(o => !o)}>
          <div className="task-title-row">
            <span className="task-title">
              <span className="strike">{task.title}</span>
            </span>
            {showList && (
              <span
                className="list-tag"
                style={{ background: LIST_COLORS[task.list_type] + '22', color: LIST_COLORS[task.list_type] }}
              >
                {LIST_LABELS[task.list_type]}
              </span>
            )}
          </div>
          <div className="task-meta">
            {task.priority && (
              <span className={`prio ${PRIO_CLASS[task.priority] || 'low'}`}>
                <i />
                {PRIO_LABEL[prioKey] || task.priority}
              </span>
            )}
            {deadlineLabel && (
              <span className={`meta-badge${overdue && !task.is_completed ? ' over' : ''}`}>
                <Icon name="Clock" size={13} />
                {deadlineLabel}
              </span>
            )}
            {task.duration_minutes && (
              <span className="meta-badge">
                <Icon name="Timer" size={13} />
                {formatDuration(task.duration_minutes)}
              </span>
            )}
            {totalSubs > 0 && (
              <span className="meta-badge">
                <Icon name="Check" size={13} />
                {completedSubs}/{totalSubs}
              </span>
            )}
            {task.tags?.map(tag => (
              <span key={tag.id} className="tag-chip">{tag.name}</span>
            ))}
          </div>
        </div>

        <button className="expand-btn" onClick={() => !editing && setOpen(o => !o)} aria-label="Details">
          <Icon name="ChevronDown" size={16} />
        </button>
      </div>

      <div className="detail-wrap">
        <div className="detail-inner">
          <div className="detail">
            {editing ? (
              /* ── Edit-Formular ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div className="detail-label">Titel</div>
                  <input
                    className="task-form-input"
                    style={{ border: '1px solid var(--border-2)', borderRadius: 8, padding: '8px 10px', fontSize: 14, width: '100%' }}
                    value={editData.title}
                    onChange={set('title')}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 110px' }}>
                    <div className="detail-label">Priorität</div>
                    <select className="task-form-select" style={{ width: '100%' }} value={editData.priority} onChange={set('priority')}>
                      <option value="urgent">Kritisch</option>
                      <option value="high">Hoch</option>
                      <option value="medium">Mittel</option>
                      <option value="low">Niedrig</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 130px' }}>
                    <div className="detail-label">Fälligkeit</div>
                    <input
                      type="date"
                      className="task-form-select"
                      style={{ width: '100%', fontFamily: 'var(--sans)' }}
                      value={editData.deadline}
                      onChange={set('deadline')}
                    />
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <div className="detail-label">Dauer</div>
                    <select className="task-form-select" style={{ width: '100%' }} value={editData.duration_minutes} onChange={set('duration_minutes')}>
                      {DURATION_OPTS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="detail-label">Notizen</div>
                  <textarea
                    style={{
                      width: '100%', border: '1px solid var(--border-2)', borderRadius: 8,
                      padding: '8px 10px', fontSize: 13, background: 'var(--surface-2)',
                      color: 'var(--text)', resize: 'vertical', minHeight: 64,
                      fontFamily: 'var(--sans)', lineHeight: 1.5,
                    }}
                    value={editData.description}
                    onChange={set('description')}
                    placeholder="Notizen…"
                  />
                </div>

                <div className="task-form-actions">
                  <button className="btn-sm cancel" onClick={handleCancel}>Abbrechen</button>
                  <button className="btn-sm submit" onClick={handleSave} disabled={!editData.title.trim()}>
                    Speichern
                  </button>
                </div>
              </div>
            ) : (
              /* ── Normal-Ansicht ── */
              <>
                {task.description && (
                  <>
                    <div className="detail-label">Notizen</div>
                    <div className="notes">{task.description}</div>
                  </>
                )}

                {(totalSubs > 0 || addingSubtask) && (
                  <div className="subtask-head">
                    <div className="detail-label" style={{ marginBottom: 0 }}>
                      <Icon name="List" size={13} /> Unteraufgaben
                    </div>
                    {totalSubs > 0 && (
                      <div className="subtask-prog">
                        <div className="bar" style={{ marginLeft: 8 }}>
                          <i style={{ width: `${(completedSubs / totalSubs) * 100}%`, background: color }} />
                        </div>
                      </div>
                    )}
                    <span className="subtask-pct">{completedSubs}/{totalSubs}</span>
                  </div>
                )}

                {totalSubs > 0 && (
                  <div className="subtasks" style={{ marginBottom: 12 }}>
                    {task.subtasks.map(sub => (
                      <div key={sub.id} className={`subtask${sub.is_completed ? ' done' : ''}`}>
                        <div
                          className={`checkbox${sub.is_completed ? ' checked' : ''}`}
                          style={{ '--c': color }}
                          onClick={e => handleSubCheck(e, sub.id)}
                          role="checkbox"
                          tabIndex={0}
                        >
                          <svg viewBox="0 0 16 16"><path d="M2.5 8.5L6.5 12L13.5 4" /></svg>
                        </div>
                        <span>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {addingSubtask ? (
                  <form onSubmit={handleAddSub} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      className="task-form-input"
                      style={{ border: '1px solid var(--border-2)', borderRadius: 8, padding: '6px 10px', fontSize: 13 }}
                      placeholder="Unteraufgabe…"
                      value={newSub}
                      onChange={e => setNewSub(e.target.value)}
                      autoFocus
                    />
                    <button className="btn-sm submit" type="submit">+</button>
                    <button className="btn-sm cancel" type="button" onClick={() => setAddingSubtask(false)}>✕</button>
                  </form>
                ) : (
                  <button className="add-sub" onClick={() => setAddingSubtask(true)}>
                    <div className="ph" />
                    Unteraufgabe hinzufügen
                  </button>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8 }}>
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28, color: 'var(--text-2)' }}
                    onClick={startEdit}
                    title="Aufgabe bearbeiten"
                  >
                    <Icon name="Edit3" size={14} />
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28, color: 'var(--text-3)' }}
                    onClick={() => deleteTask(task.id)}
                    title="Aufgabe löschen"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
