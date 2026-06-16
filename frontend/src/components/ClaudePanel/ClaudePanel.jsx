import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../../context/TasksContext'
import { useShopping } from '../../context/ShoppingContext'
import { useClaudeChat } from '../../hooks/useClaudeChat'
import { QUICK_PROMPTS } from '../../utils/constants'
import Icon from '../Icon'

export default function ClaudePanel({ open, onClose }) {
  const { tasks } = useTasks()
  const { items } = useShopping()
  const [contextEnabled, setContextEnabled] = useState(true)
  const [ctxOpen, setCtxOpen] = useState(false)
  const [input, setInput] = useState('')
  const threadRef = useRef(null)
  const navigate = useNavigate()
  const { messages, loading, send } = useClaudeChat({ tasks, shoppingItems: items, contextEnabled })

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
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

  const openTasks = tasks.filter(t => !t.is_completed)
  const openItems = items.filter(i => !i.is_completed)

  return (
    <aside className={`assistant${open ? '' : ' collapsed'}`}>
      <div className="asst-head">
        <div className="claude-mark">
          <Icon name="Bot" size={16} />
        </div>
        <div className="asst-title">
          <b>Claude</b>
          <span>Bereit</span>
        </div>
        <button className="icon-btn" onClick={() => navigate('/chat')} title="Vollansicht öffnen" style={{ marginLeft: 'auto', width: 32, height: 32 }}>
          <Icon name="ArrowRight" size={15} />
        </button>
        <button className="icon-btn" onClick={onClose} title="Schließen" style={{ width: 32, height: 32 }}>
          <Icon name="X" size={15} />
        </button>
      </div>

      <div className={`ctx${ctxOpen ? ' open' : ''}`}>
        <button className="ctx-toggle" onClick={() => setCtxOpen(o => !o)}>
          <Icon name="Zap" size={13} />
          Kontext
          <Icon name="ChevronDown" size={13} />
        </button>
        <div className="ctx-body-wrap">
          <div className="ctx-body-inner">
            <div className="ctx-body">
              <div className="ctx-row">
                <span className="ctx-name">Aufgaben einbeziehen</span>
                <span className="ctx-cnt">{openTasks.length} offen</span>
                <div
                  className={`switch${contextEnabled ? ' on' : ''}`}
                  onClick={() => setContextEnabled(v => !v)}
                >
                  <i />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="thread scroll" ref={threadRef}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '8px 0' }}>
            Wie kann ich dir heute helfen?
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role === 'user' ? 'user' : 'claude'}`}>
            {msg.role === 'assistant' && (
              <div className="m-ava"><Icon name="Bot" size={14} /></div>
            )}
            <div className="bubble" dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
          </div>
        ))}
        {loading && (
          <div className="msg claude">
            <div className="m-ava"><Icon name="Bot" size={14} /></div>
            <div className="bubble"><div className="typing"><i/><i/><i/></div></div>
          </div>
        )}
      </div>

      <div className="composer">
        <div className="prompts">
          {QUICK_PROMPTS.map(p => (
            <button key={p} className="pchip" onClick={() => send(p)}>{p}</button>
          ))}
        </div>
        <div className="input-box">
          <textarea
            rows={1}
            placeholder="Nachricht…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{ paddingTop: 6 }}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Icon name="Send" size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function formatMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^([^<].+)/, '<p>$1</p>')
}
