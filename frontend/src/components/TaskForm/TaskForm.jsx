import { useState } from 'react'
import { useTasks } from '../../context/TasksContext'
import { LISTS, PRIO_KEY_TO_API, LIST_KEY_TO_API } from '../../utils/constants'
import Icon from '../Icon'

export default function TaskForm({ listKey, onClose }) {
  const { addTask } = useTasks()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('med')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [list, setList] = useState(listKey || 'work')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({
      title: title.trim(),
      list_type: LIST_KEY_TO_API[list],
      priority: PRIO_KEY_TO_API[priority],
      deadline: deadline || null,
      description: description || null,
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
