'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export default function DashboardClient({ progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [displayed, setDisplayed] = useState(0)

  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (displayed / 100) * circ

  useEffect(() => {
    if (!inView) return
    const duration = 1200
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(eased * progress))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, progress])

  return (
    <div ref={ref} className="flex items-center justify-center my-2">
      <div className="relative">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke="url(#progGrad)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
          <defs>
            <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white">{displayed}%</span>
          <span className="text-white/40 text-xs">tugallandi</span>
        </div>
      </div>
    </div>
  )
}
