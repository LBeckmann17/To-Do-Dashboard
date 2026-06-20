// Backend enum → design key mappings
export const LIST_KEY_TO_API = { work: 'work', priv: 'private', clean: 'cleaning', shop: 'shopping' }
export const LIST_API_TO_KEY = { work: 'work', private: 'priv', cleaning: 'clean', shopping: 'shop' }
export const PRIO_KEY_TO_API = { urgent: 'urgent', high: 'high', med: 'medium', low: 'low' }
export const PRIO_API_TO_KEY = { urgent: 'urgent', high: 'high', medium: 'med', low: 'low' }

export const SHOP_KEY_TO_API = {
  meat: 'meat', dairy: 'dairy', veg: 'vegetables_fruits', spice: 'spices',
  bakery: 'bakery', beverages: 'beverages', frozen: 'frozen',
  snacks: 'snacks', pantry: 'pantry', drugstore: 'drugstore',
  house: 'household', other: 'other',
}
export const SHOP_API_TO_KEY = {
  meat: 'meat', dairy: 'dairy', vegetables_fruits: 'veg', spices: 'spice',
  bakery: 'bakery', beverages: 'beverages', frozen: 'frozen',
  snacks: 'snacks', pantry: 'pantry', drugstore: 'drugstore',
  household: 'house', other: 'other',
}

export const LISTS = [
  { key: 'priv',  api: 'private',  label: 'Aufgaben',  color: '#8b5cf6', cssVar: '--priv',  icon: 'User',       path: '/private' },
  { key: 'clean', api: 'cleaning', label: 'Putzen',    color: '#10b981', cssVar: '--clean', icon: 'Sparkles',   path: '/cleaning' },
  { key: 'shop',  api: 'shopping', label: 'Einkauf',   color: '#f97316', cssVar: '--shop',  icon: 'ShoppingCart', path: '/shopping' },
]

export const PRIO_LABEL = { urgent: 'Kritisch', high: 'Hoch', med: 'Mittel', low: 'Niedrig' }
export const PRIO_ORDER = { urgent: 0, high: 1, med: 2, low: 3 }

export const SHOP_CATS = [
  { key: 'veg',       api: 'vegetables_fruits', label: 'Obst & Gemüse',   emoji: '🥦' },
  { key: 'meat',      api: 'meat',              label: 'Fleisch & Fisch', emoji: '🥩' },
  { key: 'dairy',     api: 'dairy',             label: 'Kühlregal',       emoji: '🥛' },
  { key: 'bakery',    api: 'bakery',            label: 'Backwaren',       emoji: '🥖' },
  { key: 'beverages', api: 'beverages',         label: 'Getränke',        emoji: '🥤' },
  { key: 'frozen',    api: 'frozen',            label: 'Tiefkühl',        emoji: '🧊' },
  { key: 'snacks',    api: 'snacks',            label: 'Snacks & Süßes',  emoji: '🍫' },
  { key: 'pantry',    api: 'pantry',            label: 'Vorrat',          emoji: '🍝' },
  { key: 'spice',     api: 'spices',            label: 'Gewürze & Co',    emoji: '🧂' },
  { key: 'drugstore', api: 'drugstore',         label: 'Drogerie',        emoji: '💊' },
  { key: 'house',     api: 'household',         label: 'Haushalt',        emoji: '🏠' },
  { key: 'other',     api: 'other',             label: 'Sonstiges',       emoji: '📦' },
]

export const QUICK_PROMPTS = [
  'Heute priorisieren',
  'Wochenzusammenfassung',
  'Erinnerungen anzeigen',
  'Aufgabe strukturieren',
]
