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

export interface ScheduleEntry {
  date: number
  shiftCode: string
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
