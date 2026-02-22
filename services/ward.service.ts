import { MOCK_WARD_ID, defaultShifts, createMockMedWard } from '@/mocks/wards'

// Re-declare minimal types inline to avoid cross-module type resolution issues
// These match the canonical types in /types/index.ts
interface DayShifts { M: boolean; A: boolean; N: boolean; E: boolean; L: boolean; O: boolean }
interface ScheduleEntry { date: number; shifts: DayShifts }
interface NurseSchedule { memberId: string; entries: ScheduleEntry[] }
interface ShiftConfig { name: string; code: string; startHour: string; startMinute: string; endHour: string; endMinute: string; nursesRequired: number }
interface WardMember { id: string; name: string; role: 'head_nurse' | 'nurse'; userId: string }
interface Ward { id: string; name: string; hospitalId: string; hospitalName: string; code: string; createdById: string; createdByName: string; members: WardMember[]; shifts: ShiftConfig[]; schedules: NurseSchedule[]; month: number; year: number }
interface JoinWardResult { success: boolean; ward?: Ward; error?: string }

// ---------------------------------------------------------------------------
// In-memory data store
// Resets to default mock data every time the module is re-evaluated
// (i.e. on dev-server restart). Survives hot-reloads within a session.
// TODO: Replace with fetch('/api/wards') when the real backend is ready.
// ---------------------------------------------------------------------------

let mockWards: Ward[] = [createMockMedWard()]

function getWards(): Ward[] {
  return mockWards
}

function setWards(wards: Ward[]): void {
  mockWards = wards
}

// ---------------------------------------------------------------------------
// Track users who have been removed from wards (to prevent re-adding via mock seeding)
// ---------------------------------------------------------------------------
const removedUsersByWard = new Map<string, Set<string>>()

// ---------------------------------------------------------------------------
// Per-month data cache
// Stores schedules + shifts for each ward+month+year combo so switching
// months preserves data and members stay constant.
// ---------------------------------------------------------------------------

interface MonthSnapshot {
  schedules: NurseSchedule[]
  shifts: ShiftConfig[]
}

const monthDataStore = new Map<string, MonthSnapshot>()

function monthKey(wardId: string, month: number, year: number): string {
  return `${wardId}-${month}-${year}`
}

/** Save current ward schedules+shifts into the month cache */
function saveMonthSnapshot(ward: Ward): void {
  const key = monthKey(ward.id, ward.month, ward.year)
  monthDataStore.set(key, {
    schedules: ward.schedules,
    shifts: ward.shifts,
  })
}

/** Load previously saved schedules+shifts for a given month, or return defaults */
function loadMonthSnapshot(wardId: string, month: number, year: number, defaultShiftsArr: ShiftConfig[]): MonthSnapshot {
  const key = monthKey(wardId, month, year)
  const cached = monthDataStore.get(key)
  if (cached) return cached
  // No data for this month yet -- return empty schedules with the ward's shift config
  return { schedules: [], shifts: [...defaultShiftsArr] }
}

// ---------------------------------------------------------------------------
// Seed / bootstrap
// ---------------------------------------------------------------------------

/** Returns the current in-memory ward list (always includes the mock MED ward). */
export function getInitialWards(): Ward[] {
  if (!mockWards.find((w) => w.id === MOCK_WARD_ID)) {
    mockWards = [...mockWards, createMockMedWard()]
  }
  // Ensure initial month snapshots exist for all wards
  for (const w of mockWards) {
    const key = monthKey(w.id, w.month, w.year)
    if (!monthDataStore.has(key)) {
      saveMonthSnapshot(w)
    }
  }
  return mockWards
}

// ---------------------------------------------------------------------------
// CRUD operations (async to match future API shape)
// ---------------------------------------------------------------------------

export async function getWardsByHospital(hospitalId: string): Promise<Ward[]> {
  await new Promise((r) => setTimeout(r, 50))
  return getWards().filter((w) => w.hospitalId === hospitalId)
}

export async function getWardById(wardId: string): Promise<Ward | undefined> {
  await new Promise((r) => setTimeout(r, 50))
  return getWards().find((w) => w.id === wardId)
}

export async function createWard(
  name: string,
  hospitalId: string,
  userId: string,
  userName: string,
): Promise<Ward> {
  await new Promise((r) => setTimeout(r, 200))

  const code = generateWardCode()
  const newWard: Ward = {
    id: crypto.randomUUID(),
    name,
    hospitalId,
    hospitalName: "โรงพยาบาลสมมติ",
    code,
    createdById: userId,
    createdByName: userName,
    members: [
      { id: crypto.randomUUID(), name: userName, role: 'head_nurse', userId },
    ],
    shifts: defaultShifts,
    schedules: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  }

  const wards = getWards()
  setWards([...wards, newWard])
  return newWard
}

export async function joinWard(
  code: string,
  userId: string,
  userName: string,
): Promise<JoinWardResult> {
  await new Promise((r) => setTimeout(r, 200))

  const wards = getWards()
  const ward = wards.find((w) => w.code === code)

  if (!ward) return { success: false, error: 'รหัสหอผู้ป่วยไม่ถูกต้อง' }
  if (ward.members.some((m) => m.userId === userId)) {
    return { success: false, error: 'คุณเป็นสมาชิกของหอผู้ป่วยนี้แล้ว' }
  }

  const newMember: WardMember = {
    id: crypto.randomUUID(),
    name: userName,
    role: 'nurse',
    userId,
  }

  const updatedWard = { ...ward, members: [...ward.members, newMember] }
  setWards(wards.map((w) => (w.id === ward.id ? updatedWard : w)))
  return { success: true, ward: updatedWard }
}

export async function renameWard(wardId: string, userId: string, newName: string): Promise<boolean> {
  const wards = getWards()
  const ward = wards.find((w) => w.id === wardId)
  if (!ward) return false
  // Only the creator (head nurse who created) can rename
  if (ward.createdById !== userId) return false
  const member = ward.members.find((m) => m.userId === userId)
  if (!member || member.role !== 'head_nurse') return false
  setWards(wards.map((w) => (w.id === wardId ? { ...w, name: newName } : w)))
  return true
}

/** Remove a member from a ward. Only the creator (head nurse) can do this.
 *  Also removes the member's schedule data from the current month and all cached snapshots. */
export async function removeMember(
  wardId: string,
  requesterId: string,
  memberId: string,
): Promise<boolean> {
  const wards = getWards()
  const ward = wards.find((w) => w.id === wardId)
  if (!ward) return false

  // Only the ward creator can remove members
  if (ward.createdById !== requesterId) return false
  const requester = ward.members.find((m) => m.userId === requesterId)
  if (!requester || requester.role !== 'head_nurse') return false

  // Cannot remove self (the creator)
  const target = ward.members.find((m) => m.id === memberId)
  if (!target) return false
  if (target.userId === requesterId) return false

  // Track this user as removed so mock seeding won't re-add them
  if (!removedUsersByWard.has(wardId)) {
    removedUsersByWard.set(wardId, new Set())
  }
  removedUsersByWard.get(wardId)!.add(target.userId)

  // Remove member from the ward
  const updatedWard = {
    ...ward,
    members: ward.members.filter((m) => m.id !== memberId),
    schedules: ward.schedules.filter((s) => s.memberId !== memberId),
  }
  setWards(wards.map((w) => (w.id === wardId ? updatedWard : w)))

  // Also clean the member from ALL cached month snapshots for this ward
  for (const [key, snapshot] of monthDataStore.entries()) {
    if (key.startsWith(`${wardId}-`)) {
      monthDataStore.set(key, {
        ...snapshot,
        schedules: snapshot.schedules.filter((s) => s.memberId !== memberId),
      })
    }
  }

  return true
}

export async function deleteWard(wardId: string, userId: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 200))

  const wards = getWards()
  const ward = wards.find((w) => w.id === wardId)
  if (!ward || ward.createdById !== userId) return false

  setWards(wards.filter((w) => w.id !== wardId))
  return true
}

export async function getUserRole(
  wardId: string,
  userId: string,
): Promise<'head_nurse' | 'nurse' | null> {
  await new Promise((r) => setTimeout(r, 50))
  const ward = getWards().find((w) => w.id === wardId)
  if (!ward) return null
  const member = ward.members.find((m) => m.userId === userId)
  return member?.role ?? null
}

export async function updateWardMonthYear(wardId: string, month: number, year: number): Promise<void> {
  const wards = getWards()
  const ward = wards.find((w) => w.id === wardId)
  if (!ward) return

  // Save current month's schedules + shifts before switching
  saveMonthSnapshot(ward)

  // Load the target month's data (or fresh defaults)
  const snapshot = loadMonthSnapshot(wardId, month, year, ward.shifts)

  setWards(
    wards.map((w) =>
      w.id === wardId
        ? { ...w, month, year, schedules: snapshot.schedules, shifts: snapshot.shifts }
        : w,
    ),
  )
}

export async function updateShiftConfig(wardId: string, shifts: ShiftConfig[]): Promise<void> {
  await new Promise((r) => setTimeout(r, 100))
  const wards = getWards()
  setWards(wards.map((w) => (w.id === wardId ? { ...w, shifts } : w)))
  // Keep month snapshot in sync
  const ward = getWards().find((w) => w.id === wardId)
  if (ward) saveMonthSnapshot(ward)
}

/** Update a single day's shifts for a nurse. Pass the full DayShifts object.
 *  If all shifts are false the entry is removed. */
export async function updateSchedule(
  wardId: string,
  memberId: string,
  date: number,
  dayShifts: DayShifts,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 50))

  const allOff = !dayShifts.M && !dayShifts.A && !dayShifts.N && !dayShifts.E && !dayShifts.L && !dayShifts.O
  const wards = getWards()
  setWards(
    wards.map((w) => {
      if (w.id !== wardId) return w

      const idx = w.schedules.findIndex((s) => s.memberId === memberId)
      if (idx === -1) {
        if (allOff) return w
        return {
          ...w,
          schedules: [...w.schedules, { memberId, entries: [{ date, shifts: dayShifts }] }],
        }
      }

      const schedule = { ...w.schedules[idx] }
      const eIdx = schedule.entries.findIndex((e) => e.date === date)

      if (allOff) {
        schedule.entries = schedule.entries.filter((e) => e.date !== date)
      } else if (eIdx === -1) {
        schedule.entries = [...schedule.entries, { date, shifts: dayShifts }]
      } else {
        schedule.entries = schedule.entries.map((e) =>
          e.date === date ? { ...e, shifts: dayShifts } : e
        )
      }

      const updatedSchedules = [...w.schedules]
      updatedSchedules[idx] = schedule
      return { ...w, schedules: updatedSchedules }
    })
  )
  // Keep month snapshot in sync
  const ward = getWards().find((w) => w.id === wardId)
  if (ward) saveMonthSnapshot(ward)
}

export async function clearSchedule(wardId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 50))
  const wards = getWards()
  setWards(wards.map((w) => (w.id === wardId ? { ...w, schedules: [] } : w)))
  // Keep month snapshot in sync
  const ward = getWards().find((w) => w.id === wardId)
  if (ward) saveMonthSnapshot(ward)
}

/** Update a user's display name across ALL wards they belong to */
export async function updateMemberNameByUserId(userId: string, newName: string): Promise<void> {
  const wards = getWards()
  setWards(
    wards.map((w) => ({
      ...w,
      members: w.members.map((m) =>
        m.userId === userId ? { ...m, name: newName } : m,
      ),
    })),
  )
}

export async function ensureUserInMockWard(
  userId: string,
  userName: string,
  hospitalId: string,
): Promise<void> {
  if (hospitalId !== '1') return

  // Do NOT re-add users who were explicitly removed from this ward
  const removedUsers = removedUsersByWard.get(MOCK_WARD_ID)
  if (removedUsers?.has(userId)) return

  const wards = getWards()
  setWards(
    wards.map((w) => {
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
}

/** Map a legacy shift code (ช, บ, ด) to the DayShifts slot key */
function shiftCodeToSlot(code: string): keyof DayShifts | null {
  if (code === 'ช') return 'M'
  if (code === 'บ') return 'A'
  if (code === 'ด') return 'N'
  return null
}

/** Get current DayShifts for a member on a date, or a blank default */
function getCurrentDayShifts(wardId: string, memberId: string, date: number): DayShifts {
  const blank: DayShifts = { M: false, A: false, N: false, E: false, L: false, O: false }
  const ward = getWards().find((w) => w.id === wardId)
  if (!ward) return blank
  const schedule = ward.schedules.find((s) => s.memberId === memberId)
  if (!schedule) return blank
  const entry = schedule.entries.find((e) => e.date === date)
  return entry ? { ...entry.shifts } : blank
}

/** Swap two shift entries after an approval.
 *  Toggles the specific shift slot off for one nurse and on for the other. */
export async function applySwapToSchedule(
  wardId: string,
  fromMemberId: string,
  toMemberId: string,
  fromDate: number,
  toDate: number,
  fromShiftCode: string,
  toShiftCode: string,
): Promise<void> {
  const fromSlot = shiftCodeToSlot(fromShiftCode)
  const toSlot = shiftCodeToSlot(toShiftCode)

  // Nurse A on fromDate: remove fromShift, add toShift
  const nurseAShifts = getCurrentDayShifts(wardId, fromMemberId, fromDate)
  if (fromSlot) nurseAShifts[fromSlot] = false
  if (toSlot) nurseAShifts[toSlot] = true
  await updateSchedule(wardId, fromMemberId, fromDate, nurseAShifts)

  // Nurse B on toDate: remove toShift, add fromShift
  const nurseBShifts = getCurrentDayShifts(wardId, toMemberId, toDate)
  if (toSlot) nurseBShifts[toSlot] = false
  if (fromSlot) nurseBShifts[fromSlot] = true
  await updateSchedule(wardId, toMemberId, toDate, nurseBShifts)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateWardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
