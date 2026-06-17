import { useState, useEffect, useRef } from 'react'
import { useShopping } from '../context/ShoppingContext'
import { SHOP_CATS } from '../utils/constants'
import Icon from '../components/Icon'

export default function ShoppingList() {
  const { items, addItem, toggleItem, updateItem, deleteCompleted, loading } = useShopping()
  const [newName, setNewName] = useState('')
  const [collapsedCats, setCollapsedCats] = useState({})
  const [cartOpen, setCartOpen] = useState(true)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = () => inputRef.current?.focus()
    window.addEventListener('fab-click', handler)
    return () => window.removeEventListener('fab-click', handler)
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    await addItem({ name: newName.trim() })
    setNewName('')
  }

  function toggleCat(key) {
    setCollapsedCats(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const openItems = items.filter(i => !i.is_completed)
  const cartItems = items.filter(i => i.is_completed)
  const cartTotal = cartItems.reduce((s, i) => s + (i.estimated_price || 0), 0)
  const listTotal = openItems.reduce((s, i) => s + (i.estimated_price || 0), 0)

  return (
    <div className="view" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="view-head">
        <div className="view-title-row">
          <div className="view-dot" style={{ background: '#f97316' }} />
          <h1 className="view-title">Einkaufsliste</h1>
          <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-2)', background: 'var(--hover)', borderRadius: 99, padding: '3px 10px' }}>
            {openItems.length} offen
          </span>
        </div>
      </div>

      <div className="view-body scroll" style={{ flex: '1 1 auto', minHeight: 0, paddingBottom: 80 }}>
        <form onSubmit={handleAdd}>
          <div className="shop-add">
            <Icon name="Plus" size={16} />
            <input
              ref={inputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Produkt hinzufügen…"
              autoComplete="off"
            />
            {newName && (
              <span className="hint">
                <kbd>↵</kbd> hinzufügen · wird automatisch kategorisiert
              </span>
            )}
          </div>
        </form>

        {loading && (
          <div className="loading-state"><Icon name="Loader2" size={18} /> Lade…</div>
        )}

        {/* Offene Kategorien */}
        {SHOP_CATS.map(cat => {
          const catItems = openItems.filter(i => i.category === cat.api)
          if (catItems.length === 0) return null
          const closed = collapsedCats[cat.key]
          const sub = catItems.reduce((s, i) => s + (i.estimated_price || 0), 0)

          return (
            <div key={cat.key} className={`cat${closed ? ' closed' : ''}`}>
              <button className="cat-head" onClick={() => toggleCat(cat.key)}>
                <div className="cat-emoji">{cat.emoji}</div>
                <span className="cat-name">{cat.label}</span>
                <span className="cat-count">{catItems.length}</span>
                {sub > 0 && <span className="cat-sub">~{sub.toFixed(2)} €</span>}
                <span className="cat-chev"><Icon name="ChevronDown" size={15} /></span>
              </button>
              <div className="cat-items-wrap">
                <div className="cat-items-inner">
                  {catItems.map(item => (
                    <ShopItem key={item.id} item={item} onToggle={toggleItem} onUpdate={updateItem} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {/* Einkaufswagen */}
        {cartItems.length > 0 && (
          <div className={`cat${cartOpen ? '' : ' closed'}`} style={{ marginTop: 20, borderColor: 'var(--shop)' }}>
            <div className="cat-head" style={{ cursor: 'default' }}>
              {/* Titel + Toggle */}
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 auto', background: 'none', cursor: 'pointer' }}
                onClick={() => setCartOpen(o => !o)}
              >
                <div className="cat-emoji" style={{ background: 'var(--shop-soft)', fontSize: 17 }}>🛒</div>
                <span className="cat-name">Einkaufswagen</span>
                <span className="cat-count">{cartItems.length}</span>
                {cartTotal > 0 && (
                  <span className="cat-sub" style={{ color: 'var(--shop)', fontWeight: 600 }}>
                    {cartTotal.toFixed(2)} €
                  </span>
                )}
              </button>

              {/* Leeren-Button */}
              <button
                onClick={deleteCompleted}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12.5, fontWeight: 600, color: 'var(--p-urgent)',
                  border: '1px solid var(--p-urgent)', borderRadius: 99,
                  padding: '5px 12px', transition: 'background .14s', flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--p-urgent-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon name="Trash2" size={13} />
                <span className="cart-leeren-label">Leeren</span>
              </button>

              <span className="cat-chev" style={{ marginLeft: 8 }} onClick={() => setCartOpen(o => !o)}>
                <Icon name="ChevronDown" size={15} />
              </span>
            </div>

            <div className="cat-items-wrap">
              <div className="cat-items-inner">
                {cartItems.map(item => (
                  <ShopItem key={item.id} item={item} onToggle={toggleItem} onUpdate={updateItem} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gesamtleiste */}
      <div className="shop-total-bar">
        <span className="shop-total-label">
          <b>{openItems.length}</b> offen
          {listTotal > 0 && <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>· ~{listTotal.toFixed(2)} €</span>}
        </span>
        {cartItems.length > 0 && (
          <span className="shop-cart-count">
            🛒 {cartItems.length}
          </span>
        )}
        <span className="shop-total-amt">{cartTotal.toFixed(2)} €</span>
      </div>
    </div>
  )
}

function ShopItem({ item, onToggle, onUpdate }) {
  const [editPrice, setEditPrice] = useState(item.estimated_price ?? '')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) {
      setEditPrice(item.estimated_price ?? '')
    }
  }, [item.estimated_price, focused])

  async function handlePriceBlur() {
    setFocused(false)
    const raw = String(editPrice).trim().replace(',', '.')
    if (raw === '' || raw === String(item.estimated_price ?? '')) return
    const v = parseFloat(raw)
    if (!isNaN(v)) {
      await onUpdate(item.id, { estimated_price: v })
    }
  }

  return (
    <div className={`shop-item${item.is_completed ? ' done' : ''}`}>
      <div
        className={`checkbox${item.is_completed ? ' checked' : ''}`}
        style={{ '--c': '#f97316' }}
        onClick={() => onToggle(item.id)}
        role="checkbox"
      >
        <svg viewBox="0 0 16 16"><path d="M2.5 8.5L6.5 12L13.5 4" /></svg>
      </div>
      <span className="shop-name">{item.name}</span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: focused ? 'var(--surface)' : 'var(--hover)',
        border: `1px solid ${focused ? 'var(--border-2)' : 'transparent'}`,
        borderRadius: 7, padding: '3px 8px', transition: 'all .15s',
      }}>
        <input
          className="shop-price-input"
          value={editPrice}
          onChange={e => setEditPrice(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handlePriceBlur}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          placeholder="0.00"
          type="text"
          inputMode="decimal"
          style={{ width: 52 }}
          title="Preis bearbeiten"
        />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>€</span>
      </div>
    </div>
  )
}
