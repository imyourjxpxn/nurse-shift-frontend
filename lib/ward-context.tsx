'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Ward, WardMember, ShiftConfig } from './types'

interface WardContextType {
  wards: Ward[]
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
  { name: 'เวรเช้า', code: 'ช', startTime: '', endTime: '', nursesRequired: 5 },
  { name: 'เวรบ่าย', code: 'บ', startTime: '', endTime: '', nursesRequired: 4 },
  { name: 'เวรดึก', code: 'ด', startTime: '', endTime: '', nursesRequired: 3 },
]

export function WardProvider({ children }: { children: ReactNode }) {
  const [wards, setWards] = useState<Ward[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  const saveWards = useCallback((newWards: Ward[]) => {
    setWards(newWards)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWards))
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

      const newWards = [...wards, newWard]
      saveWards(newWards)
      return newWard
    },
    [wards, saveWards]
  )

  const joinWard = useCallback(
    (
      code: string,
      userId: string,
      userName: string
    ): { success: boolean; ward?: Ward; error?: string } => {
      const ward = wards.find((w) => w.code === code)

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

      const updatedWards = wards.map((w) =>
        w.id === ward.id ? { ...w, members: [...w.members, newMember] } : w
      )

      saveWards(updatedWards)
      return {
        success: true,
        ward: { ...ward, members: [...ward.members, newMember] },
      }
    },
    [wards, saveWards]
  )

  const deleteWard = useCallback(
    (wardId: string, userId: string): boolean => {
      const ward = wards.find((w) => w.id === wardId)
      if (!ward || ward.createdById !== userId) {
        return false
      }

      const newWards = wards.filter((w) => w.id !== wardId)
      saveWards(newWards)
      return true
    },
    [wards, saveWards]
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
      const updatedWards = wards.map((w) =>
        w.id === wardId ? { ...w, shifts } : w
      )
      saveWards(updatedWards)
    },
    [wards, saveWards]
  )

  const updateSchedule = useCallback(
    (wardId: string, memberId: string, date: number, shiftCode: string) => {
      const updatedWards = wards.map((w) => {
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

      saveWards(updatedWards)
    },
    [wards, saveWards]
  )

  const clearSchedule = useCallback(
    (wardId: string) => {
      const updatedWards = wards.map((w) =>
        w.id === wardId ? { ...w, schedules: [] } : w
      )
      saveWards(updatedWards)
    },
    [wards, saveWards]
  )

  return (
    <WardContext.Provider
      value={{
        wards,
        createWard,
        joinWard,
        deleteWard,
        getWardsByHospital,
        getWardById,
        getUserRole,
        updateShiftConfig,
        updateSchedule,
        clearSchedule,
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
