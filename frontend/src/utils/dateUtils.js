import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'
import { de } from 'date-fns/locale'

export function formatGermanDate(dateStr) {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de })
}

export function formatDeadlineLabel(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isToday(d)) return 'Heute'
  if (isTomorrow(d)) return 'Morgen'
  const diff = differenceInDays(d, new Date())
  if (diff > 0 && diff <= 7) return `in ${diff} Tagen`
  return format(d, 'dd.MM.yyyy', { locale: de })
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return isPast(d) && !isToday(d)
}

export function formatMonthYear(date) {
  return format(date, 'MMMM yyyy', { locale: de })
}
