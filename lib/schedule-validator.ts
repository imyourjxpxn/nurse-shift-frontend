import type { Ward, NurseSchedule, ShiftConfig, DayShifts } from '@/lib/types'
import { emptyDayShifts } from '@/lib/types'

export type IssueType = 'daily' | 'consecutive'

export interface ValidationIssue {
  type: IssueType
  message: string
}

const MAX_CONSECUTIVE_HOURS = 16
const MIN_REST_MINUTES = 8 * 60

type WorkingSlot = 'M' | 'A' | 'N'

const SLOT_TO_CODE: Record<WorkingSlot, string> = {
  M: 'ช',
  A: 'บ',
  N: 'ด',
}

function getShiftsForDate(
  schedules: NurseSchedule[],
  memberId: string,
  date: number,
): DayShifts {
  const schedule = schedules.find((s) => s.memberId === memberId)
  if (!schedule) return emptyDayShifts()
  const entry = schedule.entries.find((e) => e.date === date)
  return entry?.shifts ?? emptyDayShifts()
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

export function validateSchedule(ward: Ward): ValidationIssue[] {
  const warnings: ValidationIssue[] = []
  const daysInMonth = getDaysInMonth(ward.month, ward.year)

  // =========================
  // DAILY VALIDATION
  // =========================
  for (let d = 1; d <= daysInMonth; d++) {
    const slotCounts: Record<WorkingSlot, number> = { M: 0, A: 0, N: 0 }
    let emergencyCount = 0

    for (const member of ward.members) {
      const shifts = getShiftsForDate(ward.schedules, member.id, d)

      if (shifts.M) slotCounts.M++
      if (shifts.A) slotCounts.A++
      if (shifts.N) slotCounts.N++

      // Emergency = standby column
      if ('E' in shifts && shifts.E) {
        emergencyCount++
      }
    }

    const problems: string[] = []

    // Emergency ต้องมีอย่างน้อย 1 คน
    if (emergencyCount === 0) {
      problems.push('ไม่มีเวร Emergency (Standby)')
    }

    // ตรวจ M/A/N assign ไม่ครบ
    for (const shiftConfig of ward.shifts) {
      const slotKey = (['M', 'A', 'N'] as WorkingSlot[]).find(
        (k) => SLOT_TO_CODE[k] === shiftConfig.code,
      )

      if (!slotKey) continue

      const assigned = slotCounts[slotKey]

      if (assigned < shiftConfig.nursesRequired) {
        problems.push(
          `เวร${shiftConfig.name}ไม่ครบ (${assigned}/${shiftConfig.nursesRequired})`,
        )
      }
    }

    if (problems.length > 0) {
      warnings.push({
        type: 'daily',
        message: `วันที่ ${d} ${problems.join(' และ ')}`,
      })
    }
  }

  // =========================
  // CONSECUTIVE VALIDATION
  // =========================
  warnings.push(...validateConsecutiveHours(ward))

  return warnings
}

// =======================================================
// CONSECUTIVE VALIDATION (อยู่นอก function หลัก)
// =======================================================

function validateConsecutiveHours(ward: Ward): ValidationIssue[] {
  const warnings: ValidationIssue[] = []
  const daysInMonth = new Date(ward.year, ward.month, 0).getDate()

  const shiftMap = new Map<string, ShiftConfig>(
    ward.shifts.map((s) => [s.code, s]),
  )

  function toMinutes(h: string, m: string) {
    return parseInt(h, 10) * 60 + parseInt(m, 10)
  }

  function getDurationHours(cfg: ShiftConfig): number {
    const start = toMinutes(cfg.startHour, cfg.startMinute)
    let end = toMinutes(cfg.endHour, cfg.endMinute)
    if (end <= start) end += 24 * 60
    return (end - start) / 60
  }

  function absStart(cfg: ShiftConfig, day: number) {
    return (day - 1) * 24 * 60 + toMinutes(cfg.startHour, cfg.startMinute)
  }

  function absEnd(cfg: ShiftConfig, day: number) {
    const start = toMinutes(cfg.startHour, cfg.startMinute)
    let end = toMinutes(cfg.endHour, cfg.endMinute)
    if (end <= start) end += 24 * 60
    return (day - 1) * 24 * 60 + end
  }

  interface Interval {
    start: number
    end: number
    day: number
    hours: number
  }

  for (const member of ward.members) {
    const schedule = ward.schedules.find((s) => s.memberId === member.id)
    if (!schedule) continue

    const intervals: Interval[] = []

    for (const entry of schedule.entries) {
      if (entry.date < 1 || entry.date > daysInMonth) continue

      for (const slotKey of ['M', 'A', 'N'] as WorkingSlot[]) {
        if (!entry.shifts[slotKey]) continue

        const code = SLOT_TO_CODE[slotKey]
        const cfg = shiftMap.get(code)
        if (!cfg) continue

        intervals.push({
          start: absStart(cfg, entry.date),
          end: absEnd(cfg, entry.date),
          day: entry.date,
          hours: getDurationHours(cfg),
        })
      }
    }

    if (intervals.length === 0) continue
    intervals.sort((a, b) => a.start - b.start)

    let runStartDay = intervals[0].day
    let runEndMinutes = intervals[0].end
    let runHours = intervals[0].hours

    const violationRanges: string[] = []

    const emit = (endDay: number) => {
      if (runHours > MAX_CONSECUTIVE_HOURS) {
        if (runStartDay === endDay) {
          violationRanges.push(`${runStartDay}`)
        } else {
          violationRanges.push(`${runStartDay}-${endDay}`)
        }
      }
    }

    for (let i = 1; i < intervals.length; i++) {
      const iv = intervals[i]
      const restGap = iv.start - runEndMinutes

      if (restGap < MIN_REST_MINUTES) {
        runEndMinutes = Math.max(runEndMinutes, iv.end)
        runHours += iv.hours
      } else {
        emit(intervals[i - 1].day)
        runStartDay = iv.day
        runEndMinutes = iv.end
        runHours = iv.hours
      }
    }

    emit(intervals[intervals.length - 1].day)

    if (violationRanges.length > 0) {
      warnings.push({
        type: 'consecutive',
        message: `พยาบาล ${member.name} ขึ้นเวรเกิน ${MAX_CONSECUTIVE_HOURS} ชม. วันที่ ${violationRanges.join(
          ', ',
        )}`,
      })
    }
  }

  return warnings
}