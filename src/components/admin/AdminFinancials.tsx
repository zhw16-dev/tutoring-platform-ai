'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/shared/Toast'
import { DEMO_TODAY, isSameMonth } from '@/utils/dates'
import MetricCard from '@/components/shared/MetricCard'
import EmptyState from '@/components/shared/EmptyState'

type FinTab = 'student-payments' | 'tutor-payments'

export default function AdminFinancials() {
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const { sessions, payments, students, tutors } = state
  const [activeTab, setActiveTab] = useState<FinTab>('student-payments')

  const completedPayments = payments.filter(p => {
    const session = sessions.find(s => s.id === p.sessionId)
    return session?.status === 'completed' && p.amount > 0
  })

  const revenueThisMonth = completedPayments
    .filter(p => {
      const session = sessions.find(s => s.id === p.sessionId)
      return session && isSameMonth(session.date, DEMO_TODAY)
    })
    .reduce((sum, p) => sum + p.amount, 0)
  const collectedFromStudents = completedPayments
    .filter(p => p.studentPaid)
    .reduce((sum, p) => sum + p.amount, 0)
  const owedToTutors = completedPayments
    .filter(p => p.studentPaid && !p.tutorPaid)
    .reduce((sum, p) => sum + p.tutorAmount, 0)

  // Aggregate outstanding student payments by student
  const outstandingByStudent = new Map<string, { studentName: string; totalOwed: number; sessionCount: number; paymentIds: string[] }>()
  completedPayments.filter(p => !p.studentPaid).forEach(p => {
    const session = sessions.find(s => s.id === p.sessionId)
    if (!session) return
    const student = students.find(s => s.id === session.studentId)
    if (!student) return
    const existing = outstandingByStudent.get(student.id)
    if (existing) {
      existing.totalOwed += p.amount
      existing.sessionCount += 1
      existing.paymentIds.push(p.id)
    } else {
      outstandingByStudent.set(student.id, {
        studentName: student.name,
        totalOwed: p.amount,
        sessionCount: 1,
        paymentIds: [p.id],
      })
    }
  })
  const studentRows = [...outstandingByStudent.values()].sort((a, b) => b.totalOwed - a.totalOwed)

  // Aggregate pending tutor payouts by tutor
  const pendingByTutor = new Map<string, { tutorName: string; totalOwed: number; sessionCount: number; paymentIds: string[] }>()
  completedPayments.filter(p => p.studentPaid && !p.tutorPaid).forEach(p => {
    const session = sessions.find(s => s.id === p.sessionId)
    if (!session) return
    const tutor = tutors.find(t => t.id === session.tutorId)
    if (!tutor) return
    const existing = pendingByTutor.get(tutor.id)
    if (existing) {
      existing.totalOwed += p.tutorAmount
      existing.sessionCount += 1
      existing.paymentIds.push(p.id)
    } else {
      pendingByTutor.set(tutor.id, {
        tutorName: tutor.name,
        totalOwed: p.tutorAmount,
        sessionCount: 1,
        paymentIds: [p.id],
      })
    }
  })
  const tutorRows = [...pendingByTutor.values()].sort((a, b) => b.totalOwed - a.totalOwed)

  function handleMarkStudentPaid(paymentIds: string[], studentName: string) {
    paymentIds.forEach(id => dispatch({ type: 'MARK_PAYMENT_STUDENT_PAID', payload: { paymentId: id } }))
    showToast(`All payments from ${studentName} marked as received`)
  }

  function handleMarkTutorPaid(paymentIds: string[], tutorName: string) {
    paymentIds.forEach(id => dispatch({ type: 'MARK_PAYMENT_TUTOR_PAID', payload: { paymentId: id } }))
    showToast(`All payouts to ${tutorName} marked as sent`)
  }

  const tabs: { key: FinTab; label: string }[] = [
    { key: 'student-payments', label: 'Student Payments' },
    { key: 'tutor-payments', label: 'Tutor Payments' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Financials</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <MetricCard label="Revenue (Month)" value={`$${revenueThisMonth.toLocaleString()}`} accent="success" />
        <MetricCard label="Collected from Students" value={`$${collectedFromStudents.toLocaleString()}`} />
        <MetricCard
          label="Owed to Tutors"
          value={`$${owedToTutors.toLocaleString()}`}
          accent={owedToTutors > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 border-b border-[var(--color-border)]">
        {tabs.map(tab => (
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

      {/* Student Payments tab */}
      {activeTab === 'student-payments' && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Outstanding Student Payments</h2>
          {studentRows.length === 0 ? (
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
              <EmptyState message="All student payments are up to date." />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Student', 'Sessions Owed', 'Total Outstanding', 'Action'].map(col => (
                        <th key={col} className="text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-3 pr-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentRows.map(row => (
                      <tr key={row.studentName} className="hover:bg-[var(--color-bg)] transition-colors">
                        <td className="py-4 border-b border-[var(--color-border)] pr-4 text-sm text-[var(--color-text-primary)]">{row.studentName}</td>
                        <td className="py-4 border-b border-[var(--color-border)] pr-4 text-sm text-[var(--color-text-secondary)]">{row.sessionCount} session{row.sessionCount !== 1 ? 's' : ''}</td>
                        <td className="py-4 border-b border-[var(--color-border)] pr-4 text-sm font-medium text-[var(--color-text-primary)]">${row.totalOwed}</td>
                        <td className="py-4 border-b border-[var(--color-border)]">
                          <button
                            onClick={() => handleMarkStudentPaid(row.paymentIds, row.studentName)}
                            className="bg-[var(--color-accent)] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
                          >
                            Mark All Paid
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {studentRows.map(row => (
                  <div key={row.studentName} className="bg-white rounded-lg border border-[var(--color-border)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{row.studentName}</span>
                      <span className="text-sm font-medium">${row.totalOwed}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">{row.sessionCount} unpaid session{row.sessionCount !== 1 ? 's' : ''}</p>
                    <button
                      onClick={() => handleMarkStudentPaid(row.paymentIds, row.studentName)}
                      className="bg-[var(--color-accent)] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                      Mark All Paid
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tutor Payments tab */}
      {activeTab === 'tutor-payments' && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Pending Tutor Payouts</h2>
          {tutorRows.length === 0 ? (
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
              <EmptyState message="All tutor payouts are up to date." />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Tutor', 'Sessions Owed', 'Total Payout', 'Action'].map(col => (
                        <th key={col} className="text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-[var(--color-border)] pb-3 pr-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tutorRows.map(row => (
                      <tr key={row.tutorName} className="hover:bg-[var(--color-bg)] transition-colors">
                        <td className="py-4 border-b border-[var(--color-border)] pr-4 text-sm text-[var(--color-text-primary)]">{row.tutorName}</td>
                        <td className="py-4 border-b border-[var(--color-border)] pr-4 text-sm text-[var(--color-text-secondary)]">{row.sessionCount} session{row.sessionCount !== 1 ? 's' : ''}</td>
                        <td className="py-4 border-b border-[var(--color-border)] pr-4 text-sm font-medium text-[var(--color-text-primary)]">${row.totalOwed}</td>
                        <td className="py-4 border-b border-[var(--color-border)]">
                          <button
                            onClick={() => handleMarkTutorPaid(row.paymentIds, row.tutorName)}
                            className="bg-[var(--color-accent)] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
                          >
                            Mark All Paid
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {tutorRows.map(row => (
                  <div key={row.tutorName} className="bg-white rounded-lg border border-[var(--color-border)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{row.tutorName}</span>
                      <span className="text-sm font-medium">${row.totalOwed}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">{row.sessionCount} session{row.sessionCount !== 1 ? 's' : ''}</p>
                    <button
                      onClick={() => handleMarkTutorPaid(row.paymentIds, row.tutorName)}
                      className="bg-[var(--color-accent)] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                      Mark All Paid
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
