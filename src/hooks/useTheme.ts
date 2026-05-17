'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTheme } from 'next-themes'

export function useMountedTheme() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent flash by rendering nothing until mounted
  // After mount, use theme state properly
  const isDark = useMemo(() => {
    if (!mounted) return true // Default to dark during SSR
    return theme === 'dark'
  }, [mounted, theme])

  return { 
    isDark, 
    mounted, 
    theme: theme || 'dark', 
    setTheme 
  }
}