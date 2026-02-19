'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import {
  getInitialWards,
  createWard as serviceCreateWard,
  joinWard as serviceJoinWard,
  deleteWard as serviceDeleteWard,
  renameWard as serviceRenameWard,
  updateWardMonthYear as serviceUpdateWardMonthYear,
  updateShiftConfig as serviceUpdateShiftConfig,
  updateSchedule as serviceUpdateSchedule,
  clearSchedule as serviceClearSchedule,
  updateMemberNameByUserId as serviceUpdateMemberNameByUserId,
  ensureUserInMockWard as serviceEnsureUserInMockWard,
  applySwapToSchedule as serviceApplySwapToSchedule,
} from '@/services/ward.service'

interface ScheduleEntry { date: number; shiftCode: string }
interface NurseSchedule { memberId: string; entries: ScheduleEntry[] }
interface ShiftConfig { name: string; code: string; startHour: string; startMinute: string; endHour: string; endMinute: string; nursesRequired: number }
interface WardMember { id: string; name: string; role: 'head_nurse' | 'nurse'; userId: string }
interface Ward { id: string; name: string; hospitalId: string; hospitalName: string; code: string; createdById: string; createdByName: string; members: WardMember[]; shifts: ShiftConfig[]; schedules: NurseSchedule[]; month: number; year: number }
interface JoinWardResult { success: boolean; ward?: Ward; error?: string }

interface WardContextType {
  wards: Ward[]
  isHydrated: boolean
  createWard: (
    name: string,
    hospitalId: string,
    hospitalName: string,
    userId: string,
    userName: string,
  ) => Promise<Ward>
  joinWard: (code: string, userId: string, userName: string) => Promise<JoinWardResult>
  deleteWard: (wardId: string, userId: string) => Promise<boolean>
  renameWard: (wardId: string, userId: string, newName: string) => Promise<boolean>
  getWardsByHospital: (hospitalId: string) => Ward[]
  getWardById: (wardId: string) => Ward | undefined
  getUserRole: (wardId: string, userId: string) => 'head_nurse' | 'nurse' | null
  updateWardMonthYear: (wardId: string, month: number, year: number) => Promise<void>
  updateShiftConfig: (wardId: string, shifts: ShiftConfig[]) => void
  updateSchedule: (wardId: string, memberId: string, date: number, shiftCode: string) => void
  clearSchedule: (wardId: string) => void
  updateMemberNameByUserId: (userId: string, newName: string) => Promise<void>
  ensureUserInMockWard: (userId: string, userName: string, hospitalId: string) => void
  applySwapToSchedule: (wardId: string, fromMemberId: string, toMemberId: string, fromDate: number, toDate: number, fromShiftCode: string, toShiftCode: string) => Promise<void>
}

const WardContext = createContext<WardContextType | undefined>(undefined)

export function WardProvider({ children }: { children: ReactNode }) {
  const [wards, setWards] = useState<Ward[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return getInitialWards()
      } catch {
        return []
      }
    }
    return []
  })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Helper: sync local state after a service mutation
  const refreshWards = useCallback(() => {
    setWards(getInitialWards())
  }, [])

  const createWard = useCallback(
    async (
      name: string,
      hospitalId: string,
      hospitalName: string,
      userId: string,
      userName: string,
    ): Promise<Ward> => {
      const newWard = await serviceCreateWard(name, hospitalId, hospitalName, userId, userName)
      refreshWards()
      return newWard
    },
    [refreshWards],
  )

  const joinWard = useCallback(
    async (code: string, userId: string, userName: string): Promise<JoinWardResult> => {
      const result = await serviceJoinWard(code, userId, userName)
      if (result.success) refreshWards()
      return result
    },
    [refreshWards],
  )

  const deleteWard = useCallback(
    async (wardId: string, userId: string): Promise<boolean> => {
      const ok = await serviceDeleteWard(wardId, userId)
      if (ok) refreshWards()
      return ok
    },
    [refreshWards],
  )

  const renameWard = useCallback(
    async (wardId: string, userId: string, newName: string): Promise<boolean> => {
      const ok = await serviceRenameWard(wardId, userId, newName)
      if (ok) refreshWards()
      return ok
    },
    [refreshWards],
  )

  const getWardsByHospital = useCallback(
    (hospitalId: string): Ward[] => wards.filter((w) => w.hospitalId === hospitalId),
    [wards],
  )

  const getWardById = useCallback(
    (wardId: string): Ward | undefined => wards.find((w) => w.id === wardId),
    [wards],
  )

  const getUserRole = useCallback(
    (wardId: string, userId: string): 'head_nurse' | 'nurse' | null => {
      const ward = wards.find((w) => w.id === wardId)
      if (!ward) return null
      return ward.members.find((m) => m.userId === userId)?.role ?? null
    },
    [wards],
  )

  const updateWardMonthYear = useCallback(
    async (wardId: string, month: number, year: number) => {
      await serviceUpdateWardMonthYear(wardId, month, year)
      refreshWards()
    },
    [refreshWards],
  )

  const updateShiftConfig = useCallback(
    async (wardId: string, shifts: ShiftConfig[]) => {
      await serviceUpdateShiftConfig(wardId, shifts)
      refreshWards()
    },
    [refreshWards],
  )

  const updateSchedule = useCallback(
    async (wardId: string, memberId: string, date: number, shiftCode: string) => {
      await serviceUpdateSchedule(wardId, memberId, date, shiftCode)
      refreshWards()
    },
    [refreshWards],
  )

  const clearSchedule = useCallback(
    async (wardId: string) => {
      await serviceClearSchedule(wardId)
      refreshWards()
    },
    [refreshWards],
  )

  const updateMemberNameByUserId = useCallback(
    async (userId: string, newName: string) => {
      await serviceUpdateMemberNameByUserId(userId, newName)
      refreshWards()
    },
    [refreshWards],
  )

  const ensureUserInMockWard = useCallback(
    async (userId: string, userName: string, hospitalId: string) => {
      await serviceEnsureUserInMockWard(userId, userName, hospitalId)
      refreshWards()
    },
    [refreshWards],
  )

  const applySwapToSchedule = useCallback(
    async (wardId: string, fromMemberId: string, toMemberId: string, fromDate: number, toDate: number, fromShiftCode: string, toShiftCode: string) => {
      await serviceApplySwapToSchedule(wardId, fromMemberId, toMemberId, fromDate, toDate, fromShiftCode, toShiftCode)
      refreshWards()
    },
    [refreshWards],
  )

  return (
    <WardContext.Provider
      value={{
        wards,
        isHydrated,
        createWard,
        joinWard,
        deleteWard,
        renameWard,
        getWardsByHospital,
        getWardById,
        getUserRole,
        updateWardMonthYear,
        updateShiftConfig,
        updateSchedule,
        clearSchedule,
        updateMemberNameByUserId,
        ensureUserInMockWard,
        applySwapToSchedule,
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
