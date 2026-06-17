import { useState } from 'react'
import { useTasks } from '../../context/TasksContext'
import { LISTS, PRIO_KEY_TO_API, LIST_KEY_TO_API } from '../../utils/constants'
import Icon from '../Icon'

const DURATION_OPTS = [
  { value: '',    label: 'Dauer' },
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

export default function TaskForm({ listKey, onClose }) {
  const { addTask } = useTasks()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('med')
  const [deadline, setDeadline] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [list, setList] = useState(listKey || 'work')

  const isShoppingList = (listKey || list) === 'shop'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({
      title: title.trim(),
      list_type: LIST_KEY_TO_API[list],
      priority: PRIO_KEY_TO_API[priority],
      deadline: deadline || null,
      duration_minutes: duration ? parseInt(duration) : null,
      notes: description || null,
    })
    onClose()
  }

  return (
    <form className="task-form-card fade-in" onSubmit={handleSubmit}>
      <input
        className="task-form-input"
        placeholder="Neue Aufgabe…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
      />
      <div className="task-form-row">
        {!listKey && (
          <select className="task-form-select" value={list} onChange={e => setList(e.target.value)}>
            {LISTS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
        )}
        <select className="task-form-select" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="urgent">Kritisch</option>
          <option value="high">Hoch</option>
          <option value="med">Mittel</option>
          <option value="low">Niedrig</option>
        </select>
        <input
          type="date"
          className="task-form-select"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          style={{ fontFamily: 'var(--sans)' }}
        />
        {!isShoppingList && (
          <select className="task-form-select" value={duration} onChange={e => setDuration(e.target.value)}>
            {DURATION_OPTS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
      </div>
      <input
        className="task-form-input"
        style={{ fontSize: 13, color: 'var(--text-2)' }}
        placeholder="Notizen (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div className="task-form-actions">
        <button type="button" className="btn-sm cancel" onClick={onClose}>Abbrechen</button>
        <button type="submit" className="btn-sm submit" disabled={!title.trim()}>Erstellen</button>
      </div>
    </form>
  )
}
