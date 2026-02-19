import { MOCK_WARD_ID, defaultShifts, createMockMedWard } from '@/mocks/wards'

// Re-declare minimal types inline to avoid cross-module type resolution issues
// These match the canonical types in /types/index.ts
interface ScheduleEntry { date: number; shiftCode: string }
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
// Seed / bootstrap
// ---------------------------------------------------------------------------

/** Returns the current in-memory ward list (always includes the mock MED ward). */
export function getInitialWards(): Ward[] {
  if (!mockWards.find((w) => w.id === MOCK_WARD_ID)) {
    mockWards = [...mockWards, createMockMedWard()]
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
  hospitalName: string,
  userId: string,
  userName: string,
): Promise<Ward> {
  await new Promise((r) => setTimeout(r, 200))

  const code = generateWardCode()
  const newWard: Ward = {
    id: crypto.randomUUID(),
    name,
    hospitalId,
    hospitalName,
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
  setWards(wards.map((w) => (w.id === wardId ? { ...w, month, year } : w)))
}

export async function updateShiftConfig(wardId: string, shifts: ShiftConfig[]): Promise<void> {
  await new Promise((r) => setTimeout(r, 100))
  const wards = getWards()
  setWards(wards.map((w) => (w.id === wardId ? { ...w, shifts } : w)))
}

export async function updateSchedule(
  wardId: string,
  memberId: string,
  date: number,
  shiftCode: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 50))

  const wards = getWards()
  setWards(
    wards.map((w) => {
      if (w.id !== wardId) return w

      const idx = w.schedules.findIndex((s) => s.memberId === memberId)
      if (idx === -1) {
        return {
          ...w,
          schedules: [...w.schedules, { memberId, entries: [{ date, shiftCode }] }],
        }
      }

      const schedule = { ...w.schedules[idx] }
      const eIdx = schedule.entries.findIndex((e) => e.date === date)

      if (shiftCode === '') {
        schedule.entries = schedule.entries.filter((e) => e.date !== date)
      } else if (eIdx === -1) {
        schedule.entries = [...schedule.entries, { date, shiftCode }]
      } else {
        schedule.entries = schedule.entries.map((e) =>
          e.date === date ? { ...e, shiftCode } : e
        )
      }

      const updatedSchedules = [...w.schedules]
      updatedSchedules[idx] = schedule
      return { ...w, schedules: updatedSchedules }
    })
  )
}

export async function clearSchedule(wardId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 50))
  const wards = getWards()
  setWards(wards.map((w) => (w.id === wardId ? { ...w, schedules: [] } : w)))
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

/** Swap two shift entries after an approval:
 *  Nurse A (fromMemberId) on fromDate gets toShiftCode
 *  Nurse B (toMemberId) on toDate gets fromShiftCode */
export async function applySwapToSchedule(
  wardId: string,
  fromMemberId: string,
  toMemberId: string,
  fromDate: number,
  toDate: number,
  fromShiftCode: string,
  toShiftCode: string,
): Promise<void> {
  // Set Nurse A's shift on fromDate to what Nurse B had (toShiftCode)
  await updateSchedule(wardId, fromMemberId, fromDate, toShiftCode)
  // Set Nurse B's shift on toDate to what Nurse A had (fromShiftCode)
  await updateSchedule(wardId, toMemberId, toDate, fromShiftCode)
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
