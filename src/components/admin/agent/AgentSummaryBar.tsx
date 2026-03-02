'use client'

import MetricCard from '@/components/shared/MetricCard'

interface AgentSummaryBarProps {
  healthScore: number
  healthSummary: string
  autonomousActionsCount: number
  pendingReviewCount: number
  criticalAlertCount: number
}

export default function AgentSummaryBar({
  healthScore,
  healthSummary,
  autonomousActionsCount,
  pendingReviewCount,
  criticalAlertCount,
}: AgentSummaryBarProps) {
  const healthAccent: 'success' | 'warning' | 'default' =
    healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'default'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          label="Business Health"
          value={`${healthScore}/100`}
          accent={healthAccent}
        />
        <MetricCard
          label="Autonomous Actions"
          value={autonomousActionsCount}
        />
        <MetricCard
          label="Pending Review"
          value={pendingReviewCount}
          accent={pendingReviewCount > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          label="Critical Alerts"
          value={criticalAlertCount}
          accent={criticalAlertCount > 0 ? 'warning' : 'default'}
        />
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">{healthSummary}</p>
    </div>
  )
}
