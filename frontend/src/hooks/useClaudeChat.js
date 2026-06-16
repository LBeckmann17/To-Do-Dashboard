import { useState, useCallback } from 'react'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM = `Du bist ein persönlicher Aufgaben-Assistent für ein To-Do Dashboard (Tasker).
Du hilfst dem Nutzer dabei, Aufgaben zu priorisieren, den Tag zu planen und Aufgaben zu strukturieren.
Antworte auf Deutsch, knapp und hilfreich. Verwende Markdown wenn passend (fett, Listen).
Kenne die vier Listen: Arbeit (blau), Privat (lila), Putzen (grün), Einkauf (orange).`

function buildContextBlock(tasks, shoppingItems) {
  if (!tasks?.length && !shoppingItems?.length) return ''
  const lines = []
  if (tasks?.length) {
    lines.push('## Offene Aufgaben')
    tasks.filter(t => !t.is_completed).slice(0, 25).forEach(t => {
      lines.push(`- [${t.list_type}/${t.priority}] ${t.title}${t.deadline ? ' (bis ' + t.deadline.slice(0,10) + ')' : ''}`)
    })
  }
  if (shoppingItems?.length) {
    lines.push('\n## Einkaufsliste')
    shoppingItems.filter(s => !s.is_completed).slice(0, 20).forEach(s => {
      lines.push(`- ${s.name} (${s.category})`)
    })
  }
  return lines.join('\n')
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
      const apiMessages = [...messages, userMsg]
      let systemPrompt = SYSTEM
      if (contextEnabled) {
        const ctx = buildContextBlock(tasks, shoppingItems)
        if (ctx) systemPrompt += '\n\n## Aktueller Kontext\n' + ctx
      }

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages,
      })

      const assistantText = response.content[0]?.text || ''
      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Fehler: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, tasks, shoppingItems, contextEnabled])

  function clear() { setMessages([]) }

  return { messages, loading, send, clear }
}
