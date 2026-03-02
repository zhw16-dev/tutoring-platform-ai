'use client'

import { useState } from 'react'
import { ActionItem } from '@/types/aiAgent'

interface ActionCardProps {
  action: ActionItem
  onApprove: (id: string) => void
  onDismiss: (id: string) => void
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  moderate: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  info: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  moderate: 'Moderate',
  info: 'Info',
}

export default function ActionCard({ action, onApprove, onDismiss }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedBody, setEditedBody] = useState(action.draftMessage.body)

  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden transition-all">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors"
      >
        <span className={`${PRIORITY_STYLES[action.priority]} text-xs font-medium px-2.5 py-1 rounded-full shrink-0 mt-0.5`}>
          {PRIORITY_LABELS[action.priority]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{action.title}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">{action.category}</p>
        </div>
        <svg
          className={`w-4 h-4 text-[var(--color-text-tertiary)] shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--color-border)]">
          {/* Analysis */}
          <div className="mt-4">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5">Analysis</p>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{action.analysis}</p>
          </div>

          {/* Recommended action */}
          <div className="mt-4">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5">Recommended Action</p>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{action.recommendedAction}</p>
          </div>

          {/* Draft message */}
          <div className="mt-4">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5">
              Draft Message — To: {action.draftMessage.to} ({action.draftMessage.toRole})
            </p>
            <div className="border-l-2 border-[var(--color-accent-muted)] bg-[var(--color-accent-light)]/50 rounded-r-md px-4 py-3">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Subject: {action.draftMessage.subject}
              </p>
              {editing ? (
                <textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full text-sm text-[var(--color-text-primary)] leading-relaxed bg-white border border-[var(--color-border)] rounded-md px-3 py-2 mt-1 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                />
              ) : (
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
                  {action.draftMessage.body}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => { onApprove(action.id); setEditing(false) }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg transition-colors"
                >
                  Send Edited
                </button>
                <button
                  onClick={() => { setEditing(false); setEditedBody(action.draftMessage.body) }}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Cancel Edit
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onApprove(action.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-accent)] border border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDismiss(action.id)}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
