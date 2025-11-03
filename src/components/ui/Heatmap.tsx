/**
 * Heatmap Component (demo)
 * Displays a small month heatmap of availability counts per day
 */

'use client'

import { useMemo } from 'react'

interface HeatmapProps {
  dates: Array<{ date: string; count: number }>
  title?: string
  selectedDate?: string
  onDateClick?: (date: string) => void
}

export function Heatmap({ dates, title, selectedDate, onDateClick }: HeatmapProps) {
  const byDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of dates) map[d.date] = (map[d.date] || 0) + d.count
    return map
  }, [dates])

  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const cells: string[] = []
  for (let d = 1; d <= end.getDate(); d++) {
    const ds = new Date(today.getFullYear(), today.getMonth(), d)
    cells.push(ds.toISOString().split('T')[0])
  }

  const level = (count: number) => {
    if (count >= 5) return 'bg-mint-600'
    if (count >= 3) return 'bg-mint-400'
    if (count >= 1) return 'bg-mint-200'
    return 'bg-graphite-100'
  }

  return (
    <div>
      {title && <div className="text-sm font-medium text-graphite-800 mb-2">{title}</div>}
      <div className="grid grid-cols-7 gap-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((w) => (
          <div key={w} className="text-[10px] text-graphite-500 text-center mb-1">{w}</div>
        ))}
        {cells.map((date) => {
          const c = byDate[date] || 0
          const isSelected = selectedDate === date
          return (
            <button
              key={date}
              type="button"
              onClick={() => onDateClick && onDateClick(date)}
              className={`h-6 w-6 rounded ${level(c)} border ${isSelected ? 'border-mint-700 ring-2 ring-mint-400' : 'border-white'} transition-transform hover:scale-105`}
              title={`${date} • ${c} slots`}
            />
          )
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-graphite-600">
        <span>Less</span>
        <div className="h-3 w-3 rounded bg-graphite-100" />
        <div className="h-3 w-3 rounded bg-mint-200" />
        <div className="h-3 w-3 rounded bg-mint-400" />
        <div className="h-3 w-3 rounded bg-mint-600" />
        <span>More</span>
      </div>
    </div>
  )
}


