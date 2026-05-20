'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTheme } from 'next-themes'

export function useMountedTheme() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = useMemo(() => {
    if (mounted) return theme === 'dark'
    // Read the class next-themes already set on <html> before React mounts
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return true // SSR fallback
  }, [mounted, theme])

  return {
    isDark,
    mounted,
    theme: theme || 'dark',
    setTheme
  }
}
