// AI INTEGRATION NOTE:
// The Claude API integration below is fully functional but commented out
// to avoid burning tokens on synthetic data during demos. The default flow
// loads a cached response generated from a real API call, with a brief
// simulated delay to mimic live analysis. Uncomment the API block and
// remove the simulation to enable live calls.

import { AppState } from '@/types'
import { AgentResponse } from '@/types/aiAgent'
import cachedResponse from '@/data/cachedAgentResponse.json'

export async function runAgentAnalysis(_state: AppState): Promise<AgentResponse> {
  // Simulate analysis delay (4–6 seconds) so it feels like real processing
  await new Promise(resolve => setTimeout(resolve, 4000 + Math.random() * 2000))

  return cachedResponse as AgentResponse

  // ---------------------------------------------------------------
  // LIVE API INTEGRATION (uncomment to enable real Claude analysis)
  // ---------------------------------------------------------------
  // const { buildAgentPayload } = await import('./aggregateData')
  // const payload = buildAgentPayload(state)
  //
  // const SYSTEM_PROMPT = `You are an AI operations agent for Will's Tutoring...`
  //
  // const response = await fetch('https://api.anthropic.com/v1/messages', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'x-api-key': getApiKey(),
  //     'anthropic-version': '2023-06-01',
  //     'anthropic-dangerous-direct-browser-access': 'true',
  //   },
  //   body: JSON.stringify({
  //     model: 'claude-sonnet-4-20250514',
  //     max_tokens: 4096,
  //     system: SYSTEM_PROMPT,
  //     messages: [{ role: 'user', content: JSON.stringify(payload, null, 2) }],
  //   }),
  // })
  //
  // if (!response.ok) {
  //   throw new Error(`API error: ${response.status}`)
  // }
  //
  // const data = await response.json()
  // const text = data.content[0].text
  // const jsonMatch = text.match(/\{[\s\S]*\}/)
  // if (!jsonMatch) throw new Error('No JSON found in response')
  // return JSON.parse(jsonMatch[0]) as AgentResponse
}

// function getApiKey(): string {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('anthropic_api_key') || ''
//   }
//   return ''
// }
