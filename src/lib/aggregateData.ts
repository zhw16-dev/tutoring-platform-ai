import { AppState } from '@/types'

export interface AgentPayload {
  overview: {
    totalStudents: number
    activeStudents: number
    totalTutors: number
    activeTutors: number
    totalSessions: number
    completedSessions: number
    cancelledSessions: number
    noShowSessions: number
    scheduledSessions: number
    totalRevenue: number
    collectedRevenue: number
    outstandingRevenue: number
    owedToTutors: number
  }
  tutorSummaries: TutorSummary[]
  studentSummaries: StudentSummary[]
  weeklyRollups: WeeklyRollup[]
  anomalies: string[]
}

interface TutorSummary {
  id: string
  name: string
  activeStudentCount: number
  totalSessions: number
  completedSessions: number
  noShowCount: number
  noShowRate: number
  avgRating: number
  pendingPayoutSessions: number
  pendingPayoutAmount: number
  subjects: string[]
}

interface StudentSummary {
  id: string
  name: string
  grade: string
  totalSessions: number
  completedCount: number
  cancelledCount: number
  noShowCount: number
  attendanceRate: number
  paymentRate: number
  lastSessionDate: string
  subjects: string[]
  assignedTutors: string[]
}

interface WeeklyRollup {
  weekStart: string
  sessionsCount: number
  completedCount: number
  revenue: number
  attendanceRate: number
  noShowRate: number
}

const DEMO_TODAY = new Date('2025-02-07T12:00:00')
const THIRTY_DAYS_AGO = new Date(DEMO_TODAY)
THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30)

export function buildAgentPayload(state: AppState): AgentPayload {
  const { tutors, students, sessions, payments } = state

  // ── Overview ──
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled')
  const noShowSessions = sessions.filter(s => s.status === 'no-show')
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled')

  const activeStudentIds = new Set(
    sessions
      .filter(s => new Date(s.date) >= THIRTY_DAYS_AGO && new Date(s.date) <= DEMO_TODAY)
      .map(s => s.studentId)
  )
  const activeTutorIds = new Set(
    sessions
      .filter(s => new Date(s.date) >= THIRTY_DAYS_AGO && new Date(s.date) <= DEMO_TODAY && s.status !== 'cancelled')
      .map(s => s.tutorId)
  )

  const totalRevenue = completedSessions.length * 50
  const collectedRevenue = payments.filter(p => p.studentPaid && p.amount > 0).length * 50
  const outstandingRevenue = payments.filter(p => !p.studentPaid && p.amount > 0).length * 50
  const owedToTutors = payments.filter(p => p.studentPaid && !p.tutorPaid && p.amount > 0).length * 25

  // ── Tutor Summaries ──
  const tutorSummaries: TutorSummary[] = tutors.map(t => {
    const tutorSessions = sessions.filter(s => s.tutorId === t.id)
    const completed = tutorSessions.filter(s => s.status === 'completed')
    const noShows = tutorSessions.filter(s => s.status === 'no-show')
    const pastSessions = tutorSessions.filter(s => new Date(s.date) <= DEMO_TODAY)
    const uniqueStudents = new Set(
      tutorSessions
        .filter(s => new Date(s.date) >= THIRTY_DAYS_AGO && new Date(s.date) <= DEMO_TODAY)
        .map(s => s.studentId)
    )

    const tutorPayments = payments.filter(p => {
      const session = sessions.find(s => s.id === p.sessionId)
      return session && session.tutorId === t.id && p.studentPaid && !p.tutorPaid && p.amount > 0
    })

    return {
      id: t.id,
      name: t.name,
      activeStudentCount: uniqueStudents.size,
      totalSessions: tutorSessions.length,
      completedSessions: completed.length,
      noShowCount: noShows.length,
      noShowRate: pastSessions.length > 0 ? noShows.length / pastSessions.length : 0,
      avgRating: t.rating,
      pendingPayoutSessions: tutorPayments.length,
      pendingPayoutAmount: tutorPayments.length * 25,
      subjects: t.subjects.map(s => s.name),
    }
  })

  // ── Student Summaries ──
  const studentSummaries: StudentSummary[] = students.map(st => {
    const studentSessions = sessions.filter(s => s.studentId === st.id)
    const completed = studentSessions.filter(s => s.status === 'completed')
    const cancelled = studentSessions.filter(s => s.status === 'cancelled')
    const noShows = studentSessions.filter(s => s.status === 'no-show')
    const pastSessions = studentSessions.filter(s => new Date(s.date) <= DEMO_TODAY && s.status !== 'scheduled')

    const studentPayments = payments.filter(p => {
      const session = sessions.find(s => s.id === p.sessionId)
      return session && session.studentId === st.id && p.amount > 0
    })
    const paidPayments = studentPayments.filter(p => p.studentPaid)

    const lastSession = studentSessions
      .filter(s => new Date(s.date) <= DEMO_TODAY)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const subjects = [...new Set(studentSessions.map(s => s.subject))]
    const tutorIds = [...new Set(studentSessions.map(s => s.tutorId))]
    const tutorNames = tutorIds.map(tid => tutors.find(t => t.id === tid)?.name ?? tid)

    return {
      id: st.id,
      name: st.name,
      grade: st.grade,
      totalSessions: studentSessions.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      noShowCount: noShows.length,
      attendanceRate: pastSessions.length > 0 ? completed.length / pastSessions.length : 0,
      paymentRate: studentPayments.length > 0 ? paidPayments.length / studentPayments.length : 0,
      lastSessionDate: lastSession?.date ?? '',
      subjects,
      assignedTutors: tutorNames,
    }
  })

  // ── Weekly Rollups ──
  const weeklyRollups: WeeklyRollup[] = []
  const startDate = new Date('2024-09-01')
  const endDate = new Date(DEMO_TODAY)

  const weekStart = new Date(startDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // align to Sunday

  while (weekStart <= endDate) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weekSessions = sessions.filter(s => {
      const d = new Date(s.date)
      return d >= weekStart && d < weekEnd && d <= DEMO_TODAY
    })

    const wCompleted = weekSessions.filter(s => s.status === 'completed')
    const wNoShows = weekSessions.filter(s => s.status === 'no-show')
    const wPast = weekSessions.filter(s => s.status !== 'scheduled')

    if (wPast.length > 0) {
      weeklyRollups.push({
        weekStart: weekStart.toISOString().split('T')[0],
        sessionsCount: wPast.length,
        completedCount: wCompleted.length,
        revenue: wCompleted.length * 50,
        attendanceRate: wCompleted.length / wPast.length,
        noShowRate: wNoShows.length / wPast.length,
      })
    }

    weekStart.setDate(weekStart.getDate() + 7)
  }

  // ── Anomalies ──
  const anomalies: string[] = []

  // Overloaded tutors
  tutorSummaries.filter(t => t.activeStudentCount > 15).forEach(t => {
    anomalies.push(`Tutor ${t.name} (${t.id}) has ${t.activeStudentCount} active students — overloaded.`)
  })

  // High no-show tutors
  tutorSummaries.filter(t => t.noShowRate > 0.10 && t.totalSessions > 10).forEach(t => {
    anomalies.push(`Tutor ${t.name} (${t.id}) has ${(t.noShowRate * 100).toFixed(0)}% no-show rate.`)
  })

  // Rating outliers
  tutorSummaries.filter(t => t.avgRating < 4.5).forEach(t => {
    anomalies.push(`Tutor ${t.name} (${t.id}) has a ${t.avgRating} rating — below team average.`)
  })

  // Payout backlogs
  tutorSummaries.filter(t => t.pendingPayoutSessions >= 8).forEach(t => {
    anomalies.push(`Tutor ${t.name} (${t.id}) has ${t.pendingPayoutSessions} sessions awaiting payout ($${t.pendingPayoutAmount}).`)
  })

  // Inactive students
  const twoMonthsAgo = new Date(DEMO_TODAY)
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  studentSummaries.filter(s => {
    if (!s.lastSessionDate) return true
    return new Date(s.lastSessionDate) < twoMonthsAgo
  }).forEach(s => {
    anomalies.push(`Student ${s.name} (${s.id}, ${s.grade}) has no sessions in the last 2 months.`)
  })

  // Chronic late payers
  studentSummaries.filter(s => s.paymentRate < 0.40 && s.totalSessions > 3).forEach(s => {
    anomalies.push(`Student ${s.name} (${s.id}) has a ${(s.paymentRate * 100).toFixed(0)}% payment rate.`)
  })

  // Missing payment records
  const paymentSessionIds = new Set(payments.map(p => p.sessionId))
  const orphanedSessions = completedSessions.filter(s => !paymentSessionIds.has(s.id))
  if (orphanedSessions.length > 0) {
    anomalies.push(`${orphanedSessions.length} completed sessions have no payment record.`)
  }

  return {
    overview: {
      totalStudents: students.length,
      activeStudents: activeStudentIds.size,
      totalTutors: tutors.length,
      activeTutors: activeTutorIds.size,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      cancelledSessions: cancelledSessions.length,
      noShowSessions: noShowSessions.length,
      scheduledSessions: scheduledSessions.length,
      totalRevenue,
      collectedRevenue,
      outstandingRevenue,
      owedToTutors,
    },
    tutorSummaries,
    studentSummaries,
    weeklyRollups,
    anomalies,
  }
}
