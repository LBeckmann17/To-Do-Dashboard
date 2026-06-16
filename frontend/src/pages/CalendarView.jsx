import { useState, useEffect } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, format, addMonths, subMonths,
  startOfWeek as startW, endOfWeek as endW,
} from 'date-fns'
import { de } from 'date-fns/locale'
import api from '../api/axios'
import { LISTS } from '../utils/constants'
import Icon from '../components/Icon'

const LIST_COLORS = { work: '#3b82f6', private: '#8b5cf6', cleaning: '#10b981', shopping: '#f97316' }

export default function CalendarView() {
  const [current, setCurrent] = useState(new Date())
  const [mode, setMode] = useState('month')
  const [events, setEvents] = useState({})
  const [popover, setPopover] = useState(null)
  const [visibleLists, setVisibleLists] = useState({ work: true, private: true, cleaning: true, shopping: false })

  useEffect(() => {
    const month = format(current, 'yyyy-MM')
    api.get(`/calendar?month=${month}`)
      .then(({ data }) => setEvents(data))
      .catch(() => {})
  }, [current])

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const weekStart = startW(current, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: endW(current, { weekStartsOn: 1 }) })

  const DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  function getTasksForDay(date) {
    const key = format(date, 'yyyy-MM-dd')
    return (events[key] || []).filter(t => visibleLists[t.list_type])
  }

  function toggleList(key) {
    setVisibleLists(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleCellClick(e, date) {
    const tasks = getTasksForDay(date)
    if (tasks.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPopover({ date, tasks, x: rect.left + rect.width / 2, y: rect.bottom + 8 })
  }

  return (
    <div className="view">
      <div className="view-head">
        <div className="view-title-row">
          <div className="view-dot" style={{ background: 'var(--text-2)' }} />
          <h1 className="view-title">Kalender</h1>
        </div>
      </div>

      <div className="cal-wrap" style={{ flex: '1 1 auto', minHeight: 0 }}>
        <div className="cal-main">
          <div className="cal-toolbar">
            <button className="icon-btn" onClick={() => setCurrent(d => subMonths(d, 1))}><Icon name="ChevronLeft" size={16} /></button>
            <h2 className="cal-month">{format(current, 'MMMM yyyy', { locale: de })}</h2>
            <button className="icon-btn" onClick={() => setCurrent(d => addMonths(d, 1))}><Icon name="ChevronRight" size={16} /></button>
            <button className="icon-btn" onClick={() => setCurrent(new Date())} style={{ fontSize: 12, width: 'auto', padding: '0 10px' }}>Heute</button>
            <div className="seg" style={{ marginLeft: 'auto' }}>
              <button className={mode === 'month' ? 'on' : ''} onClick={() => setMode('month')}>Monat</button>
              <button className={mode === 'week' ? 'on' : ''} onClick={() => setMode('week')}>Woche</button>
            </div>
          </div>

          {mode === 'month' ? (
            <div className="cal-grid">
              <div className="cal-dow">
                {DOW.map(d => <span key={d}>{d}</span>)}
              </div>
              <div className="cal-days">
                {days.map(day => {
                  const tasks = getTasksForDay(day)
                  const inMonth = isSameMonth(day, current)
                  return (
                    <div
                      key={day.toISOString()}
                      className={`cal-cell${!inMonth ? ' muted' : ''}${isToday(day) ? ' today' : ''}`}
                      onClick={e => inMonth && handleCellClick(e, day)}
                    >
                      <div className="cal-daynum">{format(day, 'd')}</div>
                      {tasks.slice(0, 3).map(t => (
                        <div
                          key={t.id}
                          className="cal-chip"
                          style={{ background: LIST_COLORS[t.list_type] + '25', color: LIST_COLORS[t.list_type] }}
                          title={t.title}
                        >
                          {t.title}
                        </div>
                      ))}
                      {tasks.length > 3 && <div className="cal-more">+{tasks.length - 3} weitere</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="cal-week">
              {weekDays.map(day => {
                const tasks = getTasksForDay(day)
                return (
                  <div key={day.toISOString()} className={`week-col${isToday(day) ? ' today' : ''}`}>
                    <div className="week-col-head">
                      <div className="wd">{format(day, 'EEE', { locale: de })}</div>
                      <div className="wn">{format(day, 'd')}</div>
                    </div>
                    <div className="week-col-body scroll">
                      {tasks.map(t => (
                        <div
                          key={t.id}
                          className="week-event"
                          style={{
                            background: LIST_COLORS[t.list_type] + '20',
                            borderLeftColor: LIST_COLORS[t.list_type],
                            color: 'var(--text)',
                          }}
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="cal-side">
          <h4>Listen</h4>
          {LISTS.map(list => (
            <div key={list.key} className="ctx-row">
              <span className="nav-dot" style={{ background: list.color, width: 9, height: 9 }} />
              <span className="ctx-name">{list.label}</span>
              <div
                className={`switch${visibleLists[list.api] ? ' on' : ''}`}
                style={visibleLists[list.api] ? { background: list.color } : {}}
                onClick={() => toggleList(list.api)}
              >
                <i />
              </div>
            </div>
          ))}
        </div>
      </div>

      {popover && (
        <>
          <div className="pop-backdrop" onClick={() => setPopover(null)} />
          <div
            className="popover"
            style={{
              left: Math.min(popover.x - 150, window.innerWidth - 320),
              top: Math.min(popover.y, window.innerHeight - 200),
            }}
          >
            <h5>{format(popover.date, 'EEEE, d. MMMM', { locale: de })}</h5>
            {popover.tasks.map(t => (
              <div key={t.id} className={`pop-item${t.is_completed ? ' done' : ''}`}>
                <span
                  className="nav-dot"
                  style={{ background: LIST_COLORS[t.list_type], width: 8, height: 8 }}
                />
                <span className="pname">{t.title}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
