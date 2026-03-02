'use client'

import { useState } from 'react'
import { LogEntry } from '@/types/aiAgent'

interface AutonomousLogProps {
  entries: LogEntry[]
}

const CATEGORY_EMOJI: Record<string, string> = {
  payment_reconciliation: '💰',
  capacity_check: '👥',
  schedule_audit: '📅',
  trend_analysis: '📈',
  data_integrity: '🔍',
  payout_processing: '💳',
}

function formatLogDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDateKey(iso: string): string {
  return iso.split('T')[0]
}

export default function AutonomousLog({ entries }: AutonomousLogProps) {
  const [showAll, setShowAll] = useState(false)

  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const visible = showAll ? sorted : sorted.slice(0, 10)

  // Group by date
  const grouped: { date: string; label: string; entries: LogEntry[] }[] = []
  for (const entry of visible) {
    const key = getDateKey(entry.timestamp)
    const last = grouped[grouped.length - 1]
    if (last && last.date === key) {
      last.entries.push(entry)
    } else {
      grouped.push({ date: key, label: formatLogDate(entry.timestamp), entries: [entry] })
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Autonomous Log</h2>

      <div className="space-y-4">
        {grouped.map(group => (
          <div key={group.date}>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
              {group.label}
            </p>
            <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
              {group.entries.map((entry, i) => (
                <div
                  key={`${entry.timestamp}-${i}`}
                  className={`flex items-start gap-3 px-5 py-3 text-sm ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]'
                  } ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
                >
                  <span className="shrink-0">{CATEGORY_EMOJI[entry.category] ?? '📋'}</span>
                  <p className="text-[var(--color-text-primary)] leading-relaxed">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {sorted.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
        >
          {showAll ? 'Show less' : `Show all (${sorted.length})`}
        </button>
      )}
    </div>
  )
}
