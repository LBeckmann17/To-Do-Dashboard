import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tasker-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tasker-theme', theme)
  }, [theme])

  function toggle() {
    document.documentElement.classList.add('theming')
    setTimeout(() => document.documentElement.classList.remove('theming'), 320)
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggle }
}
