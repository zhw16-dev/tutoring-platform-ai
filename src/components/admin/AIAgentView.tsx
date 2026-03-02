'use client'

import { useState } from 'react'
import { AgentResponse } from '@/types/aiAgent'
import cachedResponse from '@/data/cachedAgentResponse.json'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/shared/Toast'
import { runAgentAnalysis } from '@/lib/aiAgent'
import AgentSummaryBar from './agent/AgentSummaryBar'
import ActionQueue from './agent/ActionQueue'
import AutonomousLog from './agent/AutonomousLog'
import InsightsPanel from './agent/InsightsPanel'
import AgentLoading from './agent/AgentLoading'

export default function AIAgentView() {
  const { state } = useApp()
  const { showToast } = useToast()
  const [response, setResponse] = useState<AgentResponse>(cachedResponse as AgentResponse)
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)

  const pendingReviewCount = response.actionQueue.length
  const criticalAlertCount = response.actionQueue.filter(a => a.priority === 'critical').length

  async function handleReanalyze() {
    setLoading(true)
    try {
      const result = await runAgentAnalysis(state)
      setResponse(result)
      setIsLive(true)
      showToast('Live analysis complete', 'success')
    } catch {
      showToast('Analysis failed — showing cached results', 'error')
      setResponse(cachedResponse as AgentResponse)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AgentLoading />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">AI Operations Agent</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {isLive ? 'Live analysis' : 'Cached analysis'} · Feb 7, 2025
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

      {/* Summary */}
      <AgentSummaryBar
        healthScore={response.healthScore}
        healthSummary={response.healthSummary}
        autonomousActionsCount={response.autonomousActionsCount}
        pendingReviewCount={pendingReviewCount}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Action Queue */}
      <ActionQueue actions={response.actionQueue} />

      {/* Autonomous Log */}
      <AutonomousLog entries={response.autonomousLog} />

      {/* Insights */}
      <InsightsPanel insights={response.insights} />
    </div>
  )
}
