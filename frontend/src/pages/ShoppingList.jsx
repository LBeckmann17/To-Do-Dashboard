import { useState } from 'react'
import { useShopping } from '../context/ShoppingContext'
import { SHOP_CATS } from '../utils/constants'
import Icon from '../components/Icon'

export default function ShoppingList() {
  const { items, total, addItem, toggleItem, updateItem, deleteCompleted, loading } = useShopping()
  const [newName, setNewName] = useState('')
  const [collapsedCats, setCollapsedCats] = useState({})

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    await addItem({ name: newName.trim() })
    setNewName('')
  }

  function toggleCat(key) {
    setCollapsedCats(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const doneItems = items.filter(i => i.is_completed)
  const totalOpen = items.filter(i => !i.is_completed).length
  const totalDone = doneItems.length

  return (
    <div className="view" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="view-head">
        <div className="view-title-row">
          <div className="view-dot" style={{ background: '#f97316' }} />
          <h1 className="view-title">Einkaufsliste</h1>
          <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-2)', background: 'var(--hover)', borderRadius: 99, padding: '3px 10px' }}>
            {totalOpen} offen
          </span>
        </div>
      </div>

      <div className="view-body scroll" style={{ flex: '1 1 auto', minHeight: 0, paddingBottom: 80 }}>
        <form onSubmit={handleAdd}>
          <div className="shop-add">
            <Icon name="Plus" size={16} />
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Produkt hinzufügen…"
              autoComplete="off"
            />
            {newName && (
              <span className="hint">
                <kbd>↵</kbd> um hinzuzufügen · wird automatisch kategorisiert
              </span>
            )}
          </div>
        </form>

        {loading && (
          <div className="loading-state"><Icon name="Loader2" size={18} /> Lade…</div>
        )}

        {SHOP_CATS.map(cat => {
          const catItems = items.filter(i => i.category === cat.api && !i.is_completed)
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

        {doneItems.length > 0 && (
          <div className="cat done-section" style={{ marginTop: 16 }}>
            <button className="cat-head" onClick={() => toggleCat('_done')}>
              <div className="cat-emoji">✅</div>
              <span className="cat-name">Erledigt</span>
              <span className="cat-count">{doneItems.length}</span>
              <button
                className="clear-done-btn"
                style={{ marginLeft: 'auto', marginRight: 8 }}
                onClick={e => { e.stopPropagation(); deleteCompleted() }}
              >
                Löschen
              </button>
              <span className="cat-chev"><Icon name="ChevronDown" size={15} /></span>
            </button>
            <div className="cat-items-wrap">
              <div className="cat-items-inner">
                {doneItems.map(item => (
                  <ShopItem key={item.id} item={item} onToggle={toggleItem} onUpdate={updateItem} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="shop-total-bar">
        <span className="shop-total-label">
          <b>{totalDone}</b> von {totalOpen + totalDone} erledigt
        </span>
        <span className="shop-cart-count">{totalOpen} im Wagen</span>
        <span className="shop-total-amt">{(total.total_price || 0).toFixed(2)} €</span>
      </div>
    </div>
  )
}

function ShopItem({ item, onToggle, onUpdate }) {
  const [editPrice, setEditPrice] = useState(item.estimated_price ?? '')

  function handlePriceBlur() {
    const v = parseFloat(String(editPrice).replace(',', '.'))
    if (!isNaN(v) && v !== item.estimated_price) {
      onUpdate(item.id, { estimated_price: v })
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
      <input
        className="shop-price-input"
        value={editPrice}
        onChange={e => setEditPrice(e.target.value)}
        onBlur={handlePriceBlur}
        placeholder="0.00"
        type="text"
        inputMode="decimal"
      />
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>€</span>
    </div>
  )
}
