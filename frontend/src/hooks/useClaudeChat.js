import { useState, useCallback } from 'react'
import api from '../api/axios'

function buildContext(tasks, shoppingItems, contextEnabled) {
  if (!contextEnabled) return {}
  return {
    tasks: (tasks || [])
      .filter(t => !t.is_completed)
      .slice(0, 25)
      .map(t => ({ title: t.title, list_type: t.list_type, priority: t.priority, deadline: t.deadline || null })),
    shopping: (shoppingItems || [])
      .filter(s => !s.is_completed)
      .slice(0, 20)
      .map(s => ({ name: s.name, category: s.category })),
  }
}

export function useClaudeChat({ tasks, shoppingItems, contextEnabled } = {}) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (userText) => {
    if (!userText.trim() || loading) return

    const userMsg = { role: 'user', content: userText.trim() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { data } = await api.post('/chat', {
        message: userText.trim(),
        history: messages,
        context: buildContext(tasks, shoppingItems, contextEnabled),
      })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const detail = err.response?.data?.detail || err.message
      setMessages(prev => [...prev, { role: 'assistant', content: `Fehler: ${detail}` }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, tasks, shoppingItems, contextEnabled])

  function clear() { setMessages([]) }

  return { messages, loading, send, clear }
}
