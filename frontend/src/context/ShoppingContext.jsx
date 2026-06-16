import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ShoppingContext = createContext(null)

export function ShoppingProvider({ children }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState({ total_price: 0, item_count: 0 })
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    try {
      const [{ data: itemsData }, { data: totalData }] = await Promise.all([
        api.get('/shopping-items'),
        api.get('/shopping-items/total'),
      ])
      setItems(itemsData)
      setTotal(totalData)
    } catch {
      toast.error('Einkaufsliste konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function addItem(payload) {
    try {
      const { data } = await api.post('/shopping-items', payload)
      setItems(prev => [...prev, data])
      await refreshTotal()
      return data
    } catch {
      toast.error('Fehler beim Hinzufügen')
    }
  }

  async function updateItem(id, payload) {
    try {
      const { data } = await api.put(`/shopping-items/${id}`, payload)
      setItems(prev => prev.map(i => i.id === id ? data : i))
      await refreshTotal()
      return data
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  async function toggleItem(id) {
    try {
      const { data } = await api.patch(`/shopping-items/${id}/complete`)
      setItems(prev => prev.map(i => i.id === id ? data : i))
      await refreshTotal()
      return data
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  async function deleteItem(id) {
    try {
      await api.delete(`/shopping-items/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      await refreshTotal()
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  async function deleteCompleted() {
    try {
      await api.delete('/shopping-items/completed')
      setItems(prev => prev.filter(i => !i.is_completed))
      await refreshTotal()
      toast.success('Erledigte gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  async function refreshTotal() {
    try {
      const { data } = await api.get('/shopping-items/total')
      setTotal(data)
    } catch {}
  }

  // Derived helpers
  function getCompleted() { return items.filter(i => i.is_completed).length }
  function getRemaining() { return items.filter(i => !i.is_completed).length }

  return (
    <ShoppingContext.Provider value={{ items, total, loading, fetchItems, addItem, updateItem, toggleItem, deleteItem, deleteCompleted, getCompleted, getRemaining }}>
      {children}
    </ShoppingContext.Provider>
  )
}

export function useShopping() {
  const ctx = useContext(ShoppingContext)
  if (!ctx) throw new Error('useShopping must be used within ShoppingProvider')
  return ctx
}
