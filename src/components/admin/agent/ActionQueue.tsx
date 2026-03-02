'use client'

import { useState } from 'react'
import { ActionItem } from '@/types/aiAgent'
import { useToast } from '@/components/shared/Toast'
import ActionCard from './ActionCard'

interface ActionQueueProps {
  actions: ActionItem[]
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  moderate: 1,
  info: 2,
}

export default function ActionQueue({ actions }: ActionQueueProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const { showToast } = useToast()

  const visibleActions = actions
    .filter(a => !dismissedIds.has(a.id) && !approvedIds.has(a.id))
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2))

  function handleApprove(id: string) {
    setApprovedIds(prev => new Set(prev).add(id))
    showToast('Action approved — message queued', 'success')
  }

  function handleDismiss(id: string) {
    setDismissedIds(prev => new Set(prev).add(id))
    showToast('Dismissed', 'info')
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Action Queue</h2>
        {visibleActions.length > 0 && (
          <span className="bg-[var(--color-warning-bg)] text-[var(--color-warning)] text-xs font-medium px-2 py-0.5 rounded-full">
            {visibleActions.length}
          </span>
        )}
      </div>

      {visibleActions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-secondary)]">All caught up — no pending actions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onApprove={handleApprove}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  )
}
