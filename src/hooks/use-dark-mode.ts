import { useState, useEffect } from 'react'

function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('mcp-builder-theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    return stored !== null ? stored === 'dark' : prefersDark
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = () => {
    const newValue = !isDark
    setIsDark(newValue)
    document.documentElement.classList.toggle('dark', newValue)
    localStorage.setItem('mcp-builder-theme', newValue ? 'dark' : 'light')
  }

  return [isDark, toggleTheme]
}

export default useDarkMode
