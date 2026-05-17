'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export function useMountedTheme() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Force dark mode on mount
    if (theme !== 'dark') {
      setTheme('dark')
    }
  }, [theme, setTheme])

  // Always dark for now - prevents flash
  const isDark = true

  return { isDark, mounted, theme: 'dark', setTheme }
}