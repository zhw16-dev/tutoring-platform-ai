export interface AgentResponse {
  autonomousActionsCount: number
  actionQueue: ActionItem[]
  autonomousLog: LogEntry[]
  insights: Insight[]
}

export interface ActionItem {
  id: string
  priority: 'critical' | 'moderate' | 'info'
  category: string
  title: string
  analysis: string
  recommendedAction: string
  draftMessage: {
    to: string
    toRole: 'parent' | 'student' | 'tutor'
    subject: string
    body: string
  }
  affectedEntities: {
    studentIds: string[]
    tutorIds: string[]
  }
}

export interface LogEntry {
  timestamp: string
  category: 'payment_reconciliation' | 'capacity_check' | 'schedule_audit' | 'trend_analysis' | 'data_integrity' | 'payout_processing'
  description: string
}

export interface Insight {
  title: string
  body: string
}
