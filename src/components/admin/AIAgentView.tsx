'use client'

import { useState } from 'react'
import { AgentResponse } from '@/types/aiAgent'
import cachedResponse from '@/data/cachedAgentResponse.json'
import { useToast } from '@/components/shared/Toast'
import AgentSummaryBar from './agent/AgentSummaryBar'
import ActionQueue from './agent/ActionQueue'
import AutonomousLog from './agent/AutonomousLog'
import InsightsPanel from './agent/InsightsPanel'
import AgentLoading from './agent/AgentLoading'

type AgentTab = 'action-queue' | 'insights' | 'autonomous-log'

export default function AIAgentView() {
  const { showToast } = useToast()
  const [response, setResponse] = useState<AgentResponse>(cachedResponse as AgentResponse)
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [activeTab, setActiveTab] = useState<AgentTab>('action-queue')
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())

  const visibleActions = response.actionQueue.filter(
    a => !dismissedIds.has(a.id) && !approvedIds.has(a.id)
  )
  const pendingReviewCount = visibleActions.length
  const criticalAlertCount = visibleActions.filter(a => a.priority === 'critical').length

  function handleApprove(id: string) {
    setApprovedIds(prev => new Set(prev).add(id))
    showToast('Action approved — message queued', 'success')
  }

  function handleDismiss(id: string) {
    setDismissedIds(prev => new Set(prev).add(id))
    showToast('Dismissed', 'info')
  }

  function handleDismissAll() {
    setDismissedIds(new Set(response.actionQueue.map(a => a.id)))
    showToast('All actions dismissed', 'info')
  }

  async function handleReanalyze() {
    setLoading(true)
    // Simulate analysis delay (4–6 seconds) so it feels like real processing
    await new Promise(resolve => setTimeout(resolve, 4000 + Math.random() * 2000))
    setIsLive(true)
    setLoading(false)
    showToast('Analysis complete — no new actions found', 'success')
  }

  if (loading) {
    return <AgentLoading />
  }

  const subTabs: { key: AgentTab; label: string }[] = [
    { key: 'action-queue', label: 'Action Queue' },
    { key: 'insights', label: 'Insights' },
    { key: 'autonomous-log', label: 'Autonomous Log' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">AI Operations Agent</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {isLive ? 'Live analysis — no new actions' : 'Last scan: Today, 6:00 AM'} · Daily at 6:00 AM
          </p>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-[var(--color-accent)] border border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded-lg transition-colors disabled:opacity-50"
        >
          Re-analyze
        </button>
      </div>

      {/* Agent summary (Critical Alerts, Active Issues, Autonomous Actions) */}
      <AgentSummaryBar
        autonomousActionsCount={response.autonomousActionsCount}
        pendingReviewCount={pendingReviewCount}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Sub-tabs */}
      <div className="flex gap-0 border-b border-[var(--color-border)]">
        {subTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-[var(--color-accent)] border-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'action-queue' && (
          <ActionQueue
            actions={response.actionQueue}
            dismissedIds={dismissedIds}
            approvedIds={approvedIds}
            onApprove={handleApprove}
            onDismiss={handleDismiss}
            onDismissAll={handleDismissAll}
          />
        )}
        {activeTab === 'insights' && <InsightsPanel insights={response.insights} />}
        {activeTab === 'autonomous-log' && <AutonomousLog entries={response.autonomousLog} />}
      </div>
    </div>
  )
}
