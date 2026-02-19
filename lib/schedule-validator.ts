import type { Ward, NurseSchedule } from '@/lib/types'

export interface ValidationIssue {
  /** Day number that triggered the warning */
  day: number
  message: string
}

function getShiftForDate(
  schedules: NurseSchedule[],
  memberId: string,
  date: number,
): string {
  const schedule = schedules.find((s) => s.memberId === memberId)
  if (!schedule) return ''
  const entry = schedule.entries.find((e) => e.date === date)
  return entry?.shiftCode || ''
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Validate schedule: for every day in the selected month+year,
 * there must be at least 1 nurse assigned to the "E" (Emergency) shift.
 *
 * Returns warnings sorted by day. Non-blocking -- save always succeeds.
 */
export function validateSchedule(ward: Ward): ValidationIssue[] {
  const warnings: ValidationIssue[] = []
  const daysInMonth = getDaysInMonth(ward.month, ward.year)

  for (let d = 1; d <= daysInMonth; d++) {
    const hasEmergency = ward.members.some((m) => {
      const shift = getShiftForDate(ward.schedules, m.id, d)
      return shift === 'E'
    })
    if (!hasEmergency) {
      warnings.push({
        day: d,
        message: `Day ${d}: No Emergency (E) shift assigned`,
      })
    }
  }

  return warnings
}
