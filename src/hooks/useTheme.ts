'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export function useMountedTheme() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR paytida default dark, mounted bo'lgandan so'ng resolvedTheme ishlat
  const isDark = mounted 
    ? (resolvedTheme === 'dark')
    : true

  return { 
    isDark, 
    mounted, 
    theme: resolvedTheme || 'dark', 
    setTheme 
  }
}