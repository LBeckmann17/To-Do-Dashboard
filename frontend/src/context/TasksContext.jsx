import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks')
      setTasks(data)
    } catch {
      toast.error('Aufgaben konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function addTask(payload) {
    try {
      const { data } = await api.post('/tasks', payload)
      setTasks(prev => [data, ...prev])
      toast.success('Aufgabe erstellt')
      return data
    } catch {
      toast.error('Fehler beim Erstellen')
    }
  }

  async function updateTask(id, payload) {
    try {
      const { data } = await api.put(`/tasks/${id}`, payload)
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  async function toggleTask(id) {
    try {
      const { data } = await api.patch(`/tasks/${id}/complete`)
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  async function deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`)
      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Aufgabe gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  async function toggleSubtask(taskId, subtaskId) {
    try {
      const { data } = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/complete`)
      setTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t
        return { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? data : s) }
      }))
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  async function addSubtask(taskId, title) {
    try {
      const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title })
      setTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t
        return { ...t, subtasks: [...(t.subtasks || []), data] }
      }))
      return data
    } catch {
      toast.error('Fehler beim Erstellen')
    }
  }

  return (
    <TasksContext.Provider value={{ tasks, loading, fetchTasks, addTask, updateTask, toggleTask, deleteTask, toggleSubtask, addSubtask }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used within TasksProvider')
  return ctx
}
