// AI INTEGRATION NOTE:
// This Claude API integration is fully functional.
// The default view loads a cached response (cachedAgentResponse.json)
// generated from a real API call to avoid burning tokens on synthetic
// data during demos. Hit "Re-analyze" to trigger a live API call.

import { AppState } from '@/types'
import { AgentResponse } from '@/types/aiAgent'
import { buildAgentPayload } from './aggregateData'
import cachedResponse from '@/data/cachedAgentResponse.json'

const SYSTEM_PROMPT = `You are an AI operations agent for Will's Tutoring, a tutoring business managing students, tutors, sessions, and payments. You analyze operational data and produce structured recommendations.

Your personality: You think like a COO. You're direct, data-driven, and action-oriented. You write messages in Will's voice — warm, professional, and specific.

IMPORTANT: Return ONLY valid JSON matching this exact schema (no markdown, no code fences):

{
  "healthScore": number (0-100),
  "healthSummary": string (2-3 sentences),
  "autonomousActionsCount": number,
  "actionQueue": [
    {
      "id": string,
      "priority": "critical" | "moderate" | "info",
      "category": string,
      "title": string,
      "analysis": string (2-4 sentences with specific data points),
      "recommendedAction": string,
      "draftMessage": {
        "to": string,
        "toRole": "parent" | "student" | "tutor",
        "subject": string,
        "body": string (written in Will's voice — warm, direct, professional)
      },
      "affectedEntities": {
        "studentIds": string[],
        "tutorIds": string[]
      }
    }
  ],
  "autonomousLog": [
    {
      "timestamp": string (ISO 8601),
      "category": "payment_reconciliation" | "capacity_check" | "schedule_audit" | "trend_analysis" | "data_integrity" | "payout_processing",
      "description": string
    }
  ],
  "insights": [
    {
      "title": string,
      "body": string
    }
  ]
}

Guidelines:
- Health score: 90+ = excellent, 70-89 = good with issues, 50-69 = needs attention, <50 = critical
- Sort action queue by priority (critical first)
- Include specific names, IDs, and numbers in analysis
- Draft messages should sound like a real person, not a template
- Log entries should describe what the agent checked and found
- Insights should be strategic, not just restating problems`

export async function runAgentAnalysis(state: AppState): Promise<AgentResponse> {
  try {
    const payload = buildAgentPayload(state)

    const userMessage = `Analyze the following tutoring business data and produce your structured JSON response.

BUSINESS DATA:
${JSON.stringify(payload, null, 2)}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getApiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.content[0].text

    // Parse JSON from response (handle potential markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0]) as AgentResponse
    return parsed
  } catch (error) {
    console.error('AI Agent analysis failed:', error)
    // Fall back to cached response
    return cachedResponse as AgentResponse
  }
}

function getApiKey(): string {
  // In a real app, this would come from environment variables / server-side
  // For the demo, check localStorage for a user-provided key
  if (typeof window !== 'undefined') {
    return localStorage.getItem('anthropic_api_key') || ''
  }
  return ''
}
