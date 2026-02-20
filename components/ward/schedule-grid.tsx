'use client'

import type { Ward, NurseSchedule, DayShifts } from '@/lib/types'
import { emptyDayShifts, hasAnyShift, hasSpecialStatus } from '@/lib/types'

interface ScheduleGridProps {
  ward: Ward
  isHeadNurse: boolean
  isCreator?: boolean
  onCellClick: (memberId: string, date: number, currentShifts: DayShifts) => void
  onRemoveMember?: (memberId: string, memberName: string) => void
}

/** Label map for display inside cells */
const SHIFT_LABELS: { key: keyof DayShifts; label: string }[] = [
  { key: 'M', label: 'เช้า' },
  { key: 'A', label: 'บ่าย' },
  { key: 'N', label: 'ดึก' },
]

const SPECIAL_LABELS: Record<string, string> = {
  E: 'ER',
  L: 'ลา',
  O: 'Off',
}

/** Color styling per cell content */
function getCellStyle(shifts: DayShifts): { bg: string; text: string } {
  if (shifts.E) return { bg: 'bg-rose-100', text: 'text-rose-700' }
  if (shifts.L) return { bg: 'bg-gray-100', text: 'text-gray-500' }
  if (shifts.O) return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
  // Working shifts -- determine dominant color
  const count = [shifts.M, shifts.A, shifts.N].filter(Boolean).length
  if (count === 0) return { bg: '', text: 'text-muted-foreground/30' }
  if (shifts.M && !shifts.A && !shifts.N) return { bg: 'bg-sky-100', text: 'text-sky-700' }
  if (!shifts.M && shifts.A && !shifts.N) return { bg: 'bg-orange-100', text: 'text-orange-700' }
  if (!shifts.M && !shifts.A && shifts.N) return { bg: 'bg-indigo-100', text: 'text-indigo-700' }
  // Multi-shift: use a neutral accent
  return { bg: 'bg-blue-50', text: 'text-blue-800' }
}

/** Build cell display text */
function getCellText(shifts: DayShifts): string {
  if (hasSpecialStatus(shifts)) {
    if (shifts.E) return SPECIAL_LABELS.E
    if (shifts.L) return SPECIAL_LABELS.L
    if (shifts.O) return SPECIAL_LABELS.O
  }
  const parts: string[] = []
  for (const { key, label } of SHIFT_LABELS) {
    if (shifts[key]) parts.push(label)
  }
  return parts.join(' ')
}

const legendItems = [
  { label: 'เวรเช้า', color: 'bg-sky-100 border-sky-300' },
  { label: 'เวรบ่าย', color: 'bg-orange-100 border-orange-300' },
  { label: 'เวรดึก', color: 'bg-indigo-100 border-indigo-300' },
  { label: 'ER', color: 'bg-rose-100 border-rose-300' },
  { label: 'ลา', color: 'bg-gray-100 border-gray-300' },
  { label: 'Off', color: 'bg-emerald-100 border-emerald-300' },
]

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

const thaiMonthsShort = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export function ScheduleGrid({ ward, isHeadNurse, isCreator, onCellClick, onRemoveMember }: ScheduleGridProps) {
  const daysInMonth = getDaysInMonth(ward.month, ward.year)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const monthLabel = thaiMonthsShort[ward.month - 1] || ''

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-bold text-foreground">
          {'จัดตารางเวรพยาบาล'}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`inline-block size-4 rounded border ${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0" style={{ minWidth: '1100px' }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-20 min-w-[140px] bg-sky-500 rounded-tl-2xl px-3 py-2.5 text-left text-sm font-medium text-white border-r border-slate-300">
                  {'วันที่ (เดือน ' + monthLabel + ')'}
                </th>
                {days.map((day, index) => (
                  <th
                    key={day}
                    className={`min-w-[56px] bg-sky-500 px-0.5 py-2.5 text-center text-sm font-medium text-white ${
                      index === days.length - 1 ? 'rounded-tr-2xl' : ''
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ward.members.map((member, memberIndex) => {
                const rowBg = memberIndex % 2 === 0 ? 'bg-sky-50/60' : 'bg-white'

                return (
                  <tr key={member.id} className={rowBg}>
                    <td className={`sticky left-0 z-10 px-3 py-2 text-sm font-medium ${rowBg}`}>
                      <span className="flex items-center gap-1.5">
                        <span
                          className={
                            member.role === 'head_nurse'
                              ? 'text-sky-600 font-semibold'
                              : 'text-foreground'
                          }
                        >
                          {member.name}
                        </span>
                        {isCreator && member.role !== 'head_nurse' && onRemoveMember && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveMember(member.id, member.name)
                            }}
                            className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-red-100 hover:text-red-600"
                            aria-label={`Remove ${member.name}`}
                          >
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </span>
                    </td>

                    {days.map((day) => {
                      const dayShifts = getShiftsForDate(ward.schedules, member.id, day)
                      const hasShift = hasAnyShift(dayShifts)
                      const cellText = getCellText(dayShifts)
                      const style = getCellStyle(dayShifts)

                      return (
                        <td key={day} className="border-l border-border/40 px-0 py-1 text-center">
                          <button
                            type="button"
                            onClick={() => onCellClick(member.id, day, dayShifts)}
                            className={`mx-auto flex min-h-[28px] w-[52px] items-center justify-center rounded-md px-0.5 py-0.5 text-[9px] font-bold leading-tight transition-colors ${
                              hasShift
                                ? `${style.bg} ${style.text}`
                                : 'text-muted-foreground/20 hover:bg-muted/40'
                            } cursor-pointer`}
                            aria-label={`Day ${day} shift`}
                          >
                            {hasShift ? cellText : '-'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
