'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { Ward, WardMember, ShiftConfig } from './types'

interface WardContextType {
  wards: Ward[]
  isHydrated: boolean
  createWard: (
    name: string,
    hospitalId: string,
    hospitalName: string,
    userId: string,
    userName: string
  ) => Ward
  joinWard: (
    code: string,
    userId: string,
    userName: string
  ) => { success: boolean; ward?: Ward; error?: string }
  deleteWard: (wardId: string, userId: string) => boolean
  getWardsByHospital: (hospitalId: string) => Ward[]
  getWardById: (wardId: string) => Ward | undefined
  getUserRole: (wardId: string, userId: string) => 'head_nurse' | 'nurse' | null
  updateShiftConfig: (wardId: string, shifts: ShiftConfig[]) => void
  updateSchedule: (
    wardId: string,
    memberId: string,
    date: number,
    shiftCode: string
  ) => void
  clearSchedule: (wardId: string) => void
  ensureUserInMockWard: (userId: string, userName: string, hospitalId: string) => void
}

const WardContext = createContext<WardContextType | undefined>(undefined)

const STORAGE_KEY = 'waneyen_wards'

function generateWardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const defaultShifts: ShiftConfig[] = [
  { name: 'เวรเช้า', code: 'ช', startHour: '8', startMinute: '00', endHour: '16', endMinute: '00', nursesRequired: 5 },
  { name: 'เวรบ่าย', code: 'บ', startHour: '16', startMinute: '00', endHour: '24', endMinute: '00', nursesRequired: 4 },
  { name: 'เวรดึก', code: 'ด', startHour: '0', startMinute: '00', endHour: '8', endMinute: '00', nursesRequired: 3 },
]

const MOCK_WARD_ID = 'mock-med-ward'

function createMockMedWard(): Ward {
  return {
    id: MOCK_WARD_ID,
    name: 'MED',
    hospitalId: '1',
    hospitalName: 'Inburi Hospital',
    code: 'MED12345',
    createdById: 'mock-head-nurse',
    createdByName: 'พว.สมหญิง จริงใจ',
    members: [
      { id: 'member-1', name: 'พว.สมหญิง จริงใจ', role: 'head_nurse', userId: 'mock-head-nurse' },
      { id: 'member-2', name: 'พว.ปรียา วงศ์กุล', role: 'nurse', userId: 'nurse-2' },
      { id: 'member-3', name: 'พว.นภา ศรีสุข', role: 'nurse', userId: 'nurse-3' },
      { id: 'member-4', name: 'พว.จันทร์ เพ็ญสว่าง', role: 'nurse', userId: 'nurse-4' },
      { id: 'member-5', name: 'พว.มาลี ดอกไม้', role: 'nurse', userId: 'nurse-5' },
      { id: 'member-6', name: 'พว.สุดา ใจดี', role: 'nurse', userId: 'nurse-6' },
    ],
    shifts: defaultShifts,
    schedules: [
      {
        memberId: 'member-1',
        entries: [
          { date: 1, shiftCode: 'ช' }, { date: 2, shiftCode: 'ช' }, { date: 3, shiftCode: 'ช' },
          { date: 4, shiftCode: 'ช' }, { date: 5, shiftCode: 'ช' }, { date: 6, shiftCode: 'ช' },
          { date: 9, shiftCode: 'ช' }, { date: 10, shiftCode: 'ช' }, { date: 11, shiftCode: 'ช' },
          { date: 12, shiftCode: 'ช' }, { date: 13, shiftCode: 'ช' }, { date: 14, shiftCode: 'ช' },
        ],
      },
      {
        memberId: 'member-2',
        entries: [
          { date: 1, shiftCode: 'บ' }, { date: 2, shiftCode: 'บ' }, { date: 3, shiftCode: 'ช' },
          { date: 4, shiftCode: 'ช' }, { date: 5, shiftCode: 'ด' }, { date: 6, shiftCode: 'บ' },
          { date: 7, shiftCode: 'ช' }, { date: 8, shiftCode: 'ช' }, { date: 9, shiftCode: 'บ' },
          { date: 10, shiftCode: 'บ' }, { date: 11, shiftCode: 'ด' }, { date: 12, shiftCode: 'ด' },
        ],
      },
      {
        memberId: 'member-3',
        entries: [
          { date: 1, shiftCode: 'ด' }, { date: 2, shiftCode: 'ด' }, { date: 3, shiftCode: 'บ' },
          { date: 4, shiftCode: 'บ' }, { date: 5, shiftCode: 'ช' }, { date: 6, shiftCode: 'ด' },
          { date: 7, shiftCode: 'บ' }, { date: 8, shiftCode: 'บ' }, { date: 9, shiftCode: 'ด' },
          { date: 10, shiftCode: 'ช' }, { date: 11, shiftCode: 'ช' }, { date: 12, shiftCode: 'E' },
        ],
      },
      {
        memberId: 'member-4',
        entries: [
          { date: 1, shiftCode: 'ช' }, { date: 2, shiftCode: 'บ' }, { date: 3, shiftCode: 'ด' },
          { date: 4, shiftCode: 'ช' }, { date: 5, shiftCode: 'บ' }, { date: 6, shiftCode: 'ช' },
          { date: 7, shiftCode: 'ด' }, { date: 8, shiftCode: 'ด' }, { date: 9, shiftCode: 'ช' },
          { date: 10, shiftCode: 'บ' },
        ],
      },
      {
        memberId: 'member-5',
        entries: [
          { date: 1, shiftCode: 'บ' }, { date: 2, shiftCode: 'ช' }, { date: 3, shiftCode: 'ช' },
          { date: 4, shiftCode: 'ด' }, { date: 5, shiftCode: 'ช' }, { date: 6, shiftCode: 'E' },
          { date: 7, shiftCode: 'ช' }, { date: 8, shiftCode: 'บ' }, { date: 9, shiftCode: 'บ' },
          { date: 10, shiftCode: 'ด' }, { date: 11, shiftCode: 'บ' },
        ],
      },
      {
        memberId: 'member-6',
        entries: [
          { date: 1, shiftCode: 'ด' }, { date: 2, shiftCode: 'ด' }, { date: 3, shiftCode: 'ด' },
          { date: 4, shiftCode: 'บ' }, { date: 5, shiftCode: 'ล' }, { date: 6, shiftCode: 'ช' },
          { date: 7, shiftCode: 'ช' }, { date: 8, shiftCode: 'ช' }, { date: 9, shiftCode: 'ช' },
          { date: 10, shiftCode: 'ล' },
        ],
      },
    ],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  }
}

export function WardProvider({ children }: { children: ReactNode }) {
  const [wards, setWards] = useState<Ward[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as Ward[]
          // Ensure mock MED ward always exists
          if (!parsed.find((w) => w.id === MOCK_WARD_ID)) {
            const withMock = [...parsed, createMockMedWard()]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(withMock))
            return withMock
          }
          return parsed
        }
        // First load - seed with mock ward
        const initial = [createMockMedWard()]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
        return initial
      } catch {
        return [createMockMedWard()]
      }
    }
    return []
  })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const saveWards = useCallback((updater: Ward[] | ((prev: Ward[]) => Ward[])) => {
    setWards((prev) => {
      const newWards = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWards))
      return newWards
    })
  }, [])

  const createWard = useCallback(
    (
      name: string,
      hospitalId: string,
      hospitalName: string,
      userId: string,
      userName: string
    ): Ward => {
      const newWard: Ward = {
        id: crypto.randomUUID(),
        name,
        hospitalId,
        hospitalName,
        code: generateWardCode(),
        createdById: userId,
        createdByName: userName,
        members: [
          {
            id: crypto.randomUUID(),
            name: userName,
            role: 'head_nurse',
            userId,
          },
        ],
        shifts: defaultShifts,
        schedules: [],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }

      saveWards((prev) => [...prev, newWard])
      return newWard
    },
    [saveWards]
  )

  const joinWard = useCallback(
    (
      code: string,
      userId: string,
      userName: string
    ): { success: boolean; ward?: Ward; error?: string } => {
      // Read directly from localStorage for the freshest data
      let currentWards: Ward[] = []
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        currentWards = stored ? JSON.parse(stored) : []
      } catch {
        currentWards = []
      }

      const ward = currentWards.find((w) => w.code === code)

      if (!ward) {
        return { success: false, error: 'รหัสหอผู้ป่วยไม่ถูกต้อง' }
      }

      const alreadyMember = ward.members.some((m) => m.userId === userId)
      if (alreadyMember) {
        return { success: false, error: 'คุณเป็นสมาชิกของหอผู้ป่วยนี้แล้ว' }
      }

      const newMember: WardMember = {
        id: crypto.randomUUID(),
        name: userName,
        role: 'nurse',
        userId,
      }

      saveWards((prev) =>
        prev.map((w) =>
          w.id === ward.id ? { ...w, members: [...w.members, newMember] } : w
        )
      )
      return {
        success: true,
        ward: { ...ward, members: [...ward.members, newMember] },
      }
    },
    [saveWards]
  )

  const deleteWard = useCallback(
    (wardId: string, userId: string): boolean => {
      let canDelete = false
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const currentWards: Ward[] = stored ? JSON.parse(stored) : []
        const ward = currentWards.find((w) => w.id === wardId)
        canDelete = !!ward && ward.createdById === userId
      } catch {
        return false
      }

      if (!canDelete) return false

      saveWards((prev) => prev.filter((w) => w.id !== wardId))
      return true
    },
    [saveWards]
  )

  const getWardsByHospital = useCallback(
    (hospitalId: string): Ward[] => {
      return wards.filter((w) => w.hospitalId === hospitalId)
    },
    [wards]
  )

  const getWardById = useCallback(
    (wardId: string): Ward | undefined => {
      return wards.find((w) => w.id === wardId)
    },
    [wards]
  )

  const getUserRole = useCallback(
    (wardId: string, userId: string): 'head_nurse' | 'nurse' | null => {
      const ward = wards.find((w) => w.id === wardId)
      if (!ward) return null
      const member = ward.members.find((m) => m.userId === userId)
      return member?.role || null
    },
    [wards]
  )

  const updateShiftConfig = useCallback(
    (wardId: string, shifts: ShiftConfig[]) => {
      saveWards((prev) =>
        prev.map((w) => (w.id === wardId ? { ...w, shifts } : w))
      )
    },
    [saveWards]
  )

  const updateSchedule = useCallback(
    (wardId: string, memberId: string, date: number, shiftCode: string) => {
      saveWards((prev) =>
        prev.map((w) => {
          if (w.id !== wardId) return w

          const existingScheduleIndex = w.schedules.findIndex(
            (s) => s.memberId === memberId
          )

          if (existingScheduleIndex === -1) {
            return {
              ...w,
              schedules: [
                ...w.schedules,
                {
                  memberId,
                  entries: [{ date, shiftCode }],
                },
              ],
            }
          }

          const updatedSchedules = [...w.schedules]
          const schedule = { ...updatedSchedules[existingScheduleIndex] }
          const entryIndex = schedule.entries.findIndex((e) => e.date === date)

          if (entryIndex === -1) {
            schedule.entries = [...schedule.entries, { date, shiftCode }]
          } else if (shiftCode === '') {
            schedule.entries = schedule.entries.filter((e) => e.date !== date)
          } else {
            schedule.entries = schedule.entries.map((e) =>
              e.date === date ? { ...e, shiftCode } : e
            )
          }

          updatedSchedules[existingScheduleIndex] = schedule
          return { ...w, schedules: updatedSchedules }
        })
      )
    },
    [saveWards]
  )

  const clearSchedule = useCallback(
    (wardId: string) => {
      saveWards((prev) =>
        prev.map((w) => (w.id === wardId ? { ...w, schedules: [] } : w))
      )
    },
    [saveWards]
  )

  const ensureUserInMockWard = useCallback(
    (userId: string, userName: string, hospitalId: string) => {
      if (hospitalId !== '1') return // Only for Inburi Hospital
      saveWards((prev) =>
        prev.map((w) => {
          if (w.id !== MOCK_WARD_ID) return w
          if (w.members.some((m) => m.userId === userId)) return w
          return {
            ...w,
            members: [
              ...w.members,
              { id: crypto.randomUUID(), name: userName, role: 'nurse' as const, userId },
            ],
          }
        })
      )
    },
    [saveWards]
  )

  return (
    <WardContext.Provider
      value={{
        wards,
        isHydrated,
        createWard,
        joinWard,
        deleteWard,
        getWardsByHospital,
        getWardById,
        getUserRole,
        updateShiftConfig,
        updateSchedule,
        clearSchedule,
        ensureUserInMockWard,
      }}
    >
      {children}
    </WardContext.Provider>
  )
}

export function useWard() {
  const context = useContext(WardContext)
  if (context === undefined) {
    throw new Error('useWard must be used within a WardProvider')
  }
  return context
}
