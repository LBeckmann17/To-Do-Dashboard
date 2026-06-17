import { useState, useRef, useEffect } from 'react'
import { useTasks } from '../context/TasksContext'
import { useShopping } from '../context/ShoppingContext'
import { useClaudeChat } from '../hooks/useClaudeChat'
import { LISTS, QUICK_PROMPTS } from '../utils/constants'
import Icon from '../components/Icon'

function formatMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^([^<].+)/, '<p>$1</p>')
}

export default function ClaudeChat() {
  const { tasks } = useTasks()
  const { items } = useShopping()
  const [contextEnabled, setContextEnabled] = useState({ work: true, private: true, cleaning: true, shopping: false })
  const [input, setInput] = useState('')
  const threadRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'
  }, [input])

  const allEnabled = Object.values(contextEnabled).some(v => v)
  const filteredTasks = allEnabled
    ? tasks.filter(t => contextEnabled[t.list_type])
    : []
  const filteredItems = contextEnabled.shopping ? items : []

  const { messages, loading, send, clear } = useClaudeChat({
    tasks: filteredTasks,
    shoppingItems: filteredItems,
    contextEnabled: allEnabled,
  })

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages, loading])

  async function handleSend() {
    if (!input.trim() || loading) return
    const text = input
    setInput('')
    await send(text)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="claude-view">
      <div className="cf-main">
        <div className="cf-head">
          <div className="claude-mark" style={{ width: 38, height: 38, borderRadius: 11 }}>
            <Icon name="Bot" size={18} />
          </div>
          <div className="asst-title">
            <b style={{ fontSize: 16 }}>Claude AI</b>
            <span style={{ fontSize: 12 }}>Persönlicher Assistent</span>
          </div>
          {messages.length > 0 && (
            <button
              className="icon-btn"
              style={{ marginLeft: 'auto' }}
              onClick={clear}
              title="Chat leeren"
            >
              <Icon name="Trash2" size={15} />
            </button>
          )}
        </div>

        <div className="cf-thread scroll" ref={threadRef}>
          <div className="cf-thread-inner">
            {messages.length === 0 && (
              <div style={{ color: 'var(--text-3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
                Stelle eine Frage oder wähle einen Vorschlag unten.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`cf-msg ${msg.role === 'user' ? 'user' : 'claude'}`}>
                {msg.role === 'assistant' && (
                  <div className="m-ava" style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--claude-soft)', color: 'var(--claude)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="Bot" size={16} />
                  </div>
                )}
                <div className="cf-bubble" dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
              </div>
            ))}
            {loading && (
              <div className="cf-msg claude">
                <div className="m-ava" style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--claude-soft)', color: 'var(--claude)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="Bot" size={16} />
                </div>
                <div className="cf-bubble"><div className="typing"><i/><i/><i/></div></div>
              </div>
            )}
          </div>
        </div>

        <div className="cf-composer">
          <div className="cf-composer-inner">
            <div className="prompts" style={{ marginBottom: 10 }}>
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="pchip" onClick={() => send(p)}>{p}</button>
              ))}
            </div>
            <div className="input-box">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Nachricht an Claude…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                style={{ overflow: 'hidden' }}
              />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
                <Icon name="Send" size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="cf-context">
        <h4>Kontext</h4>
        <p className="ctx-note">Welche Listen soll Claude kennen?</p>
        {LISTS.map(list => {
          const open = tasks.filter(t => t.list_type === list.api && !t.is_completed).length
          return (
            <div key={list.key} className="ctx-row">
              <span className="nav-dot" style={{ background: list.color, width: 9, height: 9 }} />
              <span className="ctx-name">{list.label}</span>
              <span className="ctx-cnt">{open}</span>
              <div
                className={`switch${contextEnabled[list.api] ? ' on' : ''}`}
                style={contextEnabled[list.api] ? { background: list.color } : {}}
                onClick={() => setContextEnabled(prev => ({ ...prev, [list.api]: !prev[list.api] }))}
              >
                <i />
              </div>
            </div>
          )
        })}

        <div className="cf-cap">
          <h4>Fähigkeiten</h4>
          {[
            ['Zap', 'Priorisierung & Planung'],
            ['BarChart2', 'Aufgaben strukturieren'],
            ['Calendar', 'Wochenübersicht'],
            ['List', 'Einkauf optimieren'],
          ].map(([icon, label]) => (
            <div key={label} className="cap-item">
              <Icon name={icon} size={14} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
