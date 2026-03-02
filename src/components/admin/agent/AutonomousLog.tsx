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

function formatLogTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function AutonomousLog({ entries }: AutonomousLogProps) {
  const [showAll, setShowAll] = useState(false)

  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const visible = showAll ? sorted : sorted.slice(0, 5)

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Autonomous Log</h2>

      <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
        {visible.map((entry, i) => (
          <div
            key={`${entry.timestamp}-${i}`}
            className={`flex items-start gap-3 px-5 py-3 text-sm ${
              i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]'
            } ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
          >
            <span className="shrink-0">{CATEGORY_EMOJI[entry.category] ?? '📋'}</span>
            <span className="shrink-0 text-xs text-[var(--color-text-tertiary)] mt-0.5 w-20">
              {formatLogTime(entry.timestamp)}
            </span>
            <p className="text-[var(--color-text-primary)] leading-relaxed">{entry.description}</p>
          </div>
        ))}
      </div>

      {sorted.length > 5 && (
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
