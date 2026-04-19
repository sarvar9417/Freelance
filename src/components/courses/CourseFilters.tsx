'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'

export interface FilterState {
  search: string
  category: string
  level: string
}

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
  totalResults: number
}

const CATEGORIES = ['Barchasi', 'Freelancing', 'Dizayn', 'Marketing', 'Dasturlash', 'Copywriting', 'SMM']
const LEVELS = ['Barchasi', "Boshlang'ich", "O'rta", 'Yuqori']

export default function CourseFilters({ filters, onChange, totalResults }: Props) {
  const set = (key: keyof FilterState) => (val: string) =>
    onChange({ ...filters, [key]: val })

  const hasActive = filters.category !== 'Barchasi' || filters.level !== 'Barchasi' || filters.search !== ''

  const reset = () => onChange({ search: '', category: 'Barchasi', level: 'Barchasi' })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          value={filters.search}
          onChange={e => set('search')(e.target.value)}
          placeholder="Kurs qidirish..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-white text-sm placeholder:text-white/25 outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
        />
        {filters.search && (
          <button onClick={() => set('search')('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-white/40 flex-shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Filtr:</span>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => set('category')(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filters.category === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-white/40 hover:text-white hover:bg-white/8'
              }`}
              style={filters.category !== cat ? { background: 'rgba(255,255,255,0.05)' } : {}}>
              {cat}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-white/10 hidden sm:block flex-shrink-0" />

        {/* Level chips */}
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(lvl => (
            <button key={lvl} onClick={() => set('level')(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filters.level === lvl
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'text-white/40 hover:text-white hover:bg-white/8'
              }`}
              style={filters.level !== lvl ? { background: 'rgba(255,255,255,0.05)' } : {}}>
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Results + reset */}
      <div className="flex items-center justify-between">
        <p className="text-white/30 text-xs">
          <span className="text-white/60 font-semibold">{totalResults}</span> ta kurs topildi
        </p>
        {hasActive && (
          <button onClick={reset}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors">
            <X className="h-3 w-3" /> Filtrni tozalash
          </button>
        )}
      </div>
    </div>
  )
}
