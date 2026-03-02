'use client'

import MetricCard from '@/components/shared/MetricCard'

interface AgentSummaryBarProps {
  autonomousActionsCount: number
  pendingReviewCount: number
  criticalAlertCount: number
}

export default function AgentSummaryBar({
  autonomousActionsCount,
  pendingReviewCount,
  criticalAlertCount,
}: AgentSummaryBarProps) {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6">
      <MetricCard
        label="Critical Alerts"
        value={criticalAlertCount}
        accent={criticalAlertCount > 0 ? 'error' : 'default'}
      />
      <MetricCard
        label="Active Issues"
        value={pendingReviewCount}
        accent={pendingReviewCount > 0 ? 'warning' : 'default'}
      />
      <MetricCard
        label="Autonomous Actions"
        value={autonomousActionsCount}
      />
    </div>
  )
}
