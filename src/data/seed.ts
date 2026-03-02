import { Tutor, Student, Session, Payment } from '@/types'
import generatedData from './generatedData.json'

export const DEMO_STUDENT_ID = 'st1'
export const DEMO_TUTOR_ID = 't1'

export const seedTutors = generatedData.tutors as Tutor[]
export const seedStudents = generatedData.students as Student[]
export const seedPayments = generatedData.payments as Payment[]

// Add a future session for the tutor demo view so it has an upcoming session visible
export const seedSessions: Session[] = [
  ...(generatedData.sessions as Session[]),
  {
    id: 's1778',
    studentId: 'st11',
    tutorId: 't1',
    subject: 'Mathematics',
    date: '2025-02-10T16:00:00',
    duration: 60,
    status: 'scheduled',
    price: 50,
    notes: '',
  },
]
