export interface User {
  id: string
  email: string
  displayName: string
  hospitalId: string
  hospitalName: string
  avatarUrl?: string
  isRegistered: boolean
}

export interface Hospital {
  id: string
  name: string
}

export type WardRole = 'head_nurse' | 'nurse'

export interface WardMember {
  id: string
  name: string
  role: WardRole
  userId: string
}

export interface ShiftConfig {
  name: string
  code: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  nursesRequired: number
}

/** Legacy single-shift entry (kept for swap request references) */
export interface LegacyScheduleEntry {
  date: number
  shiftCode: string
}

/**
 * Multi-slot shift entry per day.
 * Working shifts (M/A/N) support multi-select (up to 3).
 * Special statuses (E/L/O) are mutually exclusive single-select
 * and cannot be combined with working shifts.
 */
export interface DayShifts {
  M: boolean  // Morning (เช้า)
  A: boolean  // Afternoon (บ่าย)
  N: boolean  // Night (ดึก)
  E: boolean  // Emergency (ฉุกเฉิน) -- single-select special status
  L: boolean  // Leave (ลา) -- single-select special status
  O: boolean  // Off (วันหยุด) -- single-select special status
}

/** Helper: create a blank DayShifts with all false */
export function emptyDayShifts(): DayShifts {
  return { M: false, A: false, N: false, E: false, L: false, O: false }
}

/** Check if a DayShifts has any active slot */
export function hasAnyShift(s: DayShifts): boolean {
  return s.M || s.A || s.N || s.E || s.L || s.O
}

/** Check if a DayShifts has a special status active */
export function hasSpecialStatus(s: DayShifts): boolean {
  return s.E || s.L || s.O
}

/** Check if a DayShifts has any working shift active */
export function hasWorkingShift(s: DayShifts): boolean {
  return s.M || s.A || s.N
}

export interface ScheduleEntry {
  date: number
  shifts: DayShifts
}

export interface NurseSchedule {
  memberId: string
  entries: ScheduleEntry[]
}

export interface Ward {
  id: string
  name: string
  hospitalId: string
  hospitalName: string
  code: string
  createdById: string
  createdByName: string
  members: WardMember[]
  shifts: ShiftConfig[]
  schedules: NurseSchedule[]
  month: number
  year: number
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface SwapRequest {
  id: string
  wardId: string
  fromNurseId: string
  fromNurseName: string
  toNurseId: string
  toNurseName: string
  fromDate: number
  toDate: number
  fromShiftCode: string
  toShiftCode: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  createdAt: string
  month: number
  year: number
}

// Service response types for future API integration
export interface JoinWardResult {
  success: boolean
  ward?: Ward
  error?: string
}
