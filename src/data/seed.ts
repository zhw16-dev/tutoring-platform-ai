import { Tutor, Student, Session, Payment } from '@/types'
import generatedData from './generatedData.json'

export const DEMO_STUDENT_ID = 'st1'
export const DEMO_TUTOR_ID = 't1'

export const seedTutors = generatedData.tutors as Tutor[]
export const seedStudents = generatedData.students as Student[]
export const seedSessions = generatedData.sessions as Session[]
export const seedPayments = generatedData.payments as Payment[]
