'use client'

export default function AgentLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex gap-1.5 mb-4">
        <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
        <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full animate-[pulse_1.2s_ease-in-out_0.2s_infinite]" />
        <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full animate-[pulse_1.2s_ease-in-out_0.4s_infinite]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">
        Agent analyzing business operations...
      </p>
      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
        Processing 200 students · 25 tutors · 1,777 sessions
      </p>
    </div>
  )
}
