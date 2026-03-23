// import { useState, useEffect } from 'react'

import { Sun, Moon } from 'lucide-react'

import useDarkMode from '@/hooks/use-dark-mode'

export function Header() {
  const [isDark, toggleTheme] = useDarkMode()

  return (
    <header className="flex justify-between items-center px-4 h-14 bg-(--bg-main) text-(--text-primary) border-b border-(--border)">
      <h1 className="text-lg font-semibold">MCP JSON Builder</h1>
      <button onClick={toggleTheme} aria-label="Toggle theme">
        {isDark ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  )
}
