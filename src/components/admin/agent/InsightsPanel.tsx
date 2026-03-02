'use client'

import { Insight } from '@/types/aiAgent'

interface InsightsPanelProps {
  insights: Insight[]
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Insights</h2>
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="border-l-2 border-[var(--color-accent-muted)] bg-white rounded-r-lg px-5 py-4 border border-[var(--color-border)]"
          >
            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{insight.title}</p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{insight.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
