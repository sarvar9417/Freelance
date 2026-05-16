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
  isDark?: boolean
}

const CATEGORIES = ['Barchasi', 'Freelancing', 'Dizayn', 'Marketing', 'Dasturlash', 'Copywriting', 'SMM']
const LEVELS = ['Barchasi', "Boshlang'ich", "O'rta", 'Yuqori']

export default function CourseFilters({ filters, onChange, totalResults, isDark = true }: Props) {
  const set = (key: keyof FilterState) => (val: string) =>
    onChange({ ...filters, [key]: val })

  const hasActive = filters.category !== 'Barchasi' || filters.level !== 'Barchasi' || filters.search !== ''

  const reset = () => onChange({ search: '', category: 'Barchasi', level: 'Barchasi' })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
          isDark ? 'text-white/30' : 'text-gray-400'
        }`} />
        <input
          value={filters.search}
          onChange={e => set('search')(e.target.value)}
          placeholder="Kurs qidirish..."
          className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-colors ${
            isDark
              ? 'text-white placeholder:text-white/25 bg-white/5'
              : 'text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200'
          }`}
          style={isDark ? { border: '1px solid rgba(255,255,255,0.09)' } : {}}
        />
        {filters.search && (
          <button onClick={() => set('search')('')}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
              isDark ? 'text-white/30 hover:text-white' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className={`flex items-center gap-2 flex-shrink-0 ${
          isDark ? 'text-white/40' : 'text-gray-500'
        }`}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Filtr:</span>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => set('category')(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filters.category === cat
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-blue-600 text-white shadow-sm'
                  : isDark
                    ? 'text-white/40 hover:text-white hover:bg-white/8'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={filters.category !== cat ? (isDark ? { background: 'rgba(255,255,255,0.05)' } : { background: 'transparent' }) : {}}>
              {cat}
            </button>
          ))}
        </div>

        <div className={`h-4 w-px hidden sm:block flex-shrink-0 ${
          isDark ? 'bg-white/10' : 'bg-gray-200'
        }`} />

        {/* Level chips */}
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(lvl => (
            <button key={lvl} onClick={() => set('level')(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filters.level === lvl
                  ? isDark
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                    : 'bg-purple-600 text-white shadow-sm'
                  : isDark
                    ? 'text-white/40 hover:text-white hover:bg-white/8'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={filters.level !== lvl ? (isDark ? { background: 'rgba(255,255,255,0.05)' } : { background: 'transparent' }) : {}}>
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Results + reset */}
      <div className="flex items-center justify-between">
        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
          <span className={`font-semibold ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{totalResults}</span> ta kurs topildi
        </p>
        {hasActive && (
          <button onClick={reset}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isDark ? 'text-white/40 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
            }`}>
            <X className="h-3 w-3" /> Filtrni tozalash
          </button>
        )}
      </div>
    </div>
  )
}
