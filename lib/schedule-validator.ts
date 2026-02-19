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
 * Validate schedule -- grouped per day.
 * For each day, collect all shift types where assigned < required.
 * If at least one shift is incomplete, produce ONE warning for that day
 * listing all insufficient shift names.
 *
 * Returns warnings sorted by day. Non-blocking -- save always succeeds.
 */
export function validateSchedule(ward: Ward): ValidationIssue[] {
  const warnings: ValidationIssue[] = []
  const daysInMonth = getDaysInMonth(ward.month, ward.year)

  for (let d = 1; d <= daysInMonth; d++) {
    // Count how many nurses are assigned to each shift code on this day
    const shiftCountMap = new Map<string, number>()
    for (const member of ward.members) {
      const shift = getShiftForDate(ward.schedules, member.id, d)
      if (shift) {
        shiftCountMap.set(shift, (shiftCountMap.get(shift) || 0) + 1)
      }
    }

    // Collect all shift names where assigned < required
    const incompleteShifts: string[] = []
    for (const shiftConfig of ward.shifts) {
      if (shiftConfig.nursesRequired <= 0) continue
      const assigned = shiftCountMap.get(shiftConfig.code) || 0
      if (assigned < shiftConfig.nursesRequired) {
        incompleteShifts.push(shiftConfig.name)
      }
    }

    // Check Emergency (E) coverage separately -- at least 1 nurse required
    const hasEmergency = (shiftCountMap.get('E') || 0) >= 1
    // Avoid double-reporting if E is already caught by shift config check
    const emergencyAlreadyCounted = incompleteShifts.some((name) => {
      const cfg = ward.shifts.find((s) => s.code === 'E')
      return cfg && name === cfg.name
    })

    // Build the combined message parts
    const parts: string[] = []
    if (incompleteShifts.length > 0) {
      parts.push(
        `${incompleteShifts.join(', ')} shift${incompleteShifts.length > 1 ? 's are' : ' is'} not fully assigned`,
      )
    }
    if (!hasEmergency && !emergencyAlreadyCounted) {
      parts.push('No emergency shift')
    }

    // One warning per day if any issue exists
    if (parts.length > 0) {
      warnings.push({
        day: d,
        message: `Day ${d}: ${parts.join(', ')}`,
      })
    }
  }

  return warnings
}
