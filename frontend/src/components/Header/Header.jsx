import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../Icon'

export default function Header({ theme, onThemeToggle, onAssistantToggle, assistantOpen }) {
  const [search, setSearch] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') inputRef.current?.blur()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="topbar">
      <label className="search">
        <Icon name="Search" size={15} />
        <input
          ref={inputRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Aufgaben suchen…"
        />
        <kbd>⌘K</kbd>
      </label>
      <div className="topbar-spacer" />

      <button
        className="theme-toggle"
        onClick={onThemeToggle}
        aria-label="Theme wechseln"
      >
        <div className="knob">
          <Icon name={theme === 'dark' ? 'Moon' : 'Sun'} size={13} />
        </div>
      </button>

      <button
        className="icon-btn"
        onClick={onAssistantToggle}
        title="Claude Assistent"
        style={assistantOpen ? { background: 'var(--claude-soft)', color: 'var(--claude)' } : {}}
      >
        <Icon name="Bot" size={17} />
      </button>
    </header>
  )
}
