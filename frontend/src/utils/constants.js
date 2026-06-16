// Backend enum → design key mappings
export const LIST_KEY_TO_API = { work: 'work', priv: 'private', clean: 'cleaning', shop: 'shopping' }
export const LIST_API_TO_KEY = { work: 'work', private: 'priv', cleaning: 'clean', shopping: 'shop' }
export const PRIO_KEY_TO_API = { urgent: 'urgent', high: 'high', med: 'medium', low: 'low' }
export const PRIO_API_TO_KEY = { urgent: 'urgent', high: 'high', medium: 'med', low: 'low' }
export const SHOP_KEY_TO_API = { meat: 'meat', dairy: 'dairy', veg: 'vegetables_fruits', spice: 'spices', house: 'household', other: 'other' }
export const SHOP_API_TO_KEY = { meat: 'meat', dairy: 'dairy', vegetables_fruits: 'veg', spices: 'spice', household: 'house', other: 'other' }

export const LISTS = [
  { key: 'work',  api: 'work',     label: 'Arbeit',    color: '#3b82f6', cssVar: '--work',  icon: 'Briefcase',  path: '/work' },
  { key: 'priv',  api: 'private',  label: 'Privat',    color: '#8b5cf6', cssVar: '--priv',  icon: 'User',       path: '/private' },
  { key: 'clean', api: 'cleaning', label: 'Putzen',    color: '#10b981', cssVar: '--clean', icon: 'Sparkles',   path: '/cleaning' },
  { key: 'shop',  api: 'shopping', label: 'Einkauf',   color: '#f97316', cssVar: '--shop',  icon: 'ShoppingCart', path: '/shopping' },
]

export const PRIO_LABEL = { urgent: 'Kritisch', high: 'Hoch', med: 'Mittel', low: 'Niedrig' }
export const PRIO_ORDER = { urgent: 0, high: 1, med: 2, low: 3 }

export const SHOP_CATS = [
  { key: 'meat',  api: 'meat',              label: 'Fleisch & Fisch', emoji: '🥩' },
  { key: 'dairy', api: 'dairy',             label: 'Kühlregal',       emoji: '🥛' },
  { key: 'veg',   api: 'vegetables_fruits', label: 'Obst & Gemüse',   emoji: '🥦' },
  { key: 'spice', api: 'spices',            label: 'Gewürze & Co',    emoji: '🧂' },
  { key: 'house', api: 'household',         label: 'Haushalt',        emoji: '🏠' },
  { key: 'other', api: 'other',             label: 'Sonstiges',       emoji: '🛒' },
]

export const QUICK_PROMPTS = [
  'Heute priorisieren',
  'Wochenzusammenfassung',
  'Erinnerungen anzeigen',
  'Aufgabe strukturieren',
]
