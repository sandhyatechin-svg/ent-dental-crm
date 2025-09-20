import { REVISIT_FEES, DOCTORS } from './constants'

export interface VisitData {
  id: string
  patient_id: string
  visit_date: string
  doctor_id?: string
  doctor_fee?: number
  created_at: string
}

export interface PatientVisit {
  id: string
  visit_date: string
  doctor_id?: string
  doctor_fee?: number
  created_at: string
}

/**
 * Calculate automatic revisit fee based on days since last visit
 */
export function calculateRevisitFee(lastVisitDate: string, currentVisitDate: string = new Date().toISOString()): number {
  const lastVisit = new Date(lastVisitDate)
  const currentVisit = new Date(currentVisitDate)
  const daysDifference = Math.floor((currentVisit.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
  
  // Under 7 days: no fee
  if (daysDifference < 7) {
    return 0
  }
  // 7+ days but less than 30: Rs 100 (revisit fee only)
  else if (daysDifference >= 7 && daysDifference < 30) {
    return REVISIT_FEES.SEVEN_DAYS
  }
  // 30+ days: no revisit fee (only doctor fee)
  else {
    return 0
  }
}

/**
 * Calculate doctor change fee
 */
export function calculateDoctorChangeFee(lastDoctorId: string, currentDoctorId: string): number {
  // If doctor changes, add Rs 200 fee
  if (lastDoctorId && currentDoctorId && lastDoctorId !== currentDoctorId) {
    return 200
  }
  return 0
}

/**
 * Get doctor information by ID
 */
export function getDoctorById(doctorId: string) {
  return DOCTORS.find(doctor => doctor.id === doctorId)
}

/**
 * Get doctor name by ID
 */
export function getDoctorName(doctorId: string): string {
  const doctor = getDoctorById(doctorId)
  return doctor?.name || 'Unknown Doctor'
}

/**
 * Get default doctor fee by ID
 */
export function getDefaultDoctorFee(doctorId: string): number {
  const doctor = getDoctorById(doctorId)
  return doctor?.defaultFee || 500
}

/**
 * Check if a visit is a revisit (has previous visits)
 */
export function isRevisit(patientVisits: PatientVisit[], currentVisitId?: string): boolean {
  const filteredVisits = currentVisitId 
    ? patientVisits.filter(visit => visit.id !== currentVisitId)
    : patientVisits
  
  return filteredVisits.length > 0
}

/**
 * Get the most recent visit for a patient (excluding current visit)
 */
export function getLastVisit(patientVisits: PatientVisit[], currentVisitId?: string): PatientVisit | null {
  const filteredVisits = currentVisitId 
    ? patientVisits.filter(visit => visit.id !== currentVisitId)
    : patientVisits
  
  if (filteredVisits.length === 0) return null
  
  return filteredVisits.sort((a, b) => 
    new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
  )[0]
}

/**
 * Calculate total visit fee including doctor fee, revisit fee, and doctor change fee
 */
export function calculateTotalVisitFee(
  doctorFee: number,
  lastVisitDate?: string,
  currentVisitDate: string = new Date().toISOString(),
  lastDoctorId?: string,
  currentDoctorId?: string
): { doctorFee: number; revisitFee: number; doctorChangeFee: number; totalFee: number } {
  if (!lastVisitDate) {
    // First visit - only doctor fee
    return {
      doctorFee,
      revisitFee: 0,
      doctorChangeFee: 0,
      totalFee: doctorFee
    }
  }

  const lastVisit = new Date(lastVisitDate)
  const currentVisit = new Date(currentVisitDate)
  const daysDifference = Math.floor((currentVisit.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
  
  let finalDoctorFee = 0
  let revisitFee = 0
  let doctorChangeFee = 0
  
  if (daysDifference < 7) {
    // Under 7 days: No fee at all
    finalDoctorFee = 0
    revisitFee = 0
  } else if (daysDifference >= 7 && daysDifference < 30) {
    // 7+ days: Only Rs 100 revisit fee (no doctor fee)
    finalDoctorFee = 0
    revisitFee = REVISIT_FEES.SEVEN_DAYS
  } else {
    // 30+ days: Only doctor fee (no revisit fee)
    finalDoctorFee = doctorFee
    revisitFee = 0
  }
  
  // Calculate doctor change fee if doctor changed
  if (lastDoctorId && currentDoctorId) {
    doctorChangeFee = calculateDoctorChangeFee(lastDoctorId, currentDoctorId)
  }
  
  return {
    doctorFee: finalDoctorFee,
    revisitFee,
    doctorChangeFee,
    totalFee: finalDoctorFee + revisitFee + doctorChangeFee
  }
}
