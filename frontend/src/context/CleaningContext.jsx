import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const CleaningContext = createContext()

export function CleaningProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/cleaning-tasks')
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function addTask(data) {
    const res = await api.post('/cleaning-tasks', data)
    setTasks(prev => [...prev, res.data])
    return res.data
  }

  async function updateTask(id, data) {
    const res = await api.put(`/cleaning-tasks/${id}`, data)
    setTasks(prev => prev.map(t => t.id === id ? res.data : t))
    return res.data
  }

  async function completeTask(id) {
    const res = await api.patch(`/cleaning-tasks/${id}/complete`)
    setTasks(prev => prev.map(t => t.id === id ? res.data : t))
    return res.data
  }

  async function deleteTask(id) {
    await api.delete(`/cleaning-tasks/${id}`)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <CleaningContext.Provider value={{ tasks, loading, fetchTasks, addTask, updateTask, completeTask, deleteTask }}>
      {children}
    </CleaningContext.Provider>
  )
}

export function useCleaning() {
  return useContext(CleaningContext)
}
