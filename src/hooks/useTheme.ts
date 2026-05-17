'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export function useMountedTheme() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render content until mounted to prevent flash
  // Default to dark before mount to match SSR
  const isDark = mounted 
    ? (theme === 'dark') 
    : true

  return { isDark, mounted, theme, setTheme }
}