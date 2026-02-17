'use client'

import type { Ward, NurseSchedule } from '@/lib/types'

interface ScheduleGridProps {
  ward: Ward
  isHeadNurse: boolean
  onCellClick: (memberId: string, date: number, currentShift: string) => void
}

const shiftCellColors: Record<string, string> = {
  ช: 'bg-sky-100 text-sky-700',
  บ: 'bg-orange-100 text-orange-700',
  ด: 'bg-indigo-100 text-indigo-700',
  E: 'bg-rose-100 text-rose-700',
  ล: 'bg-gray-100 text-gray-500',
  O: 'bg-emerald-100 text-emerald-700'
}

const legendItems = [
  { code: 'ช', label: 'เวรเช้า : ช', color: 'bg-sky-100 border-sky-200' },
  { code: 'บ', label: 'เวรบ่าย : บ', color: 'bg-orange-100 border-orange-200' },
  { code: 'ด', label: 'เวรดึก : ด', color: 'bg-indigo-100 border-indigo-200' },
  { code: 'E', label: 'Emergeny : E', color: 'bg-rose-100 border-rose-200' },
  { code: 'ล', label: 'ลา : ล', color: 'bg-gray-100 border-gray-200' },
  { code: 'O', label: 'Off : O', color: 'bg-emerald-100 border-emerald-200' },
]

function getShiftForDate(
  schedules: NurseSchedule[],
  memberId: string,
  date: number
): string {
  const schedule = schedules.find((s) => s.memberId === memberId)
  if (!schedule) return ''
  const entry = schedule.entries.find((e) => e.date === date)
  return entry?.shiftCode || ''
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

const thaiMonthsShort = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

export function ScheduleGrid({ ward, isHeadNurse, onCellClick }: ScheduleGridProps) {
  const daysInMonth = getDaysInMonth(ward.month, ward.year)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const monthLabel = thaiMonthsShort[ward.month - 1] || ''

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-bold text-foreground">
          จัดตารางเวรพยาบาล
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {legendItems.map((item) => (
            <div key={item.code} className="flex items-center gap-2">
              <span
                className={`inline-block size-5 rounded border ${item.color}`}
              />
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="p-3">
        <div className="overflow-x-auto">
          <table
            className="w-full border-separate border-spacing-0"
            style={{ minWidth: '900px' }}
          >
            <thead className="border-t-2 border-b-4 border-slate-00">


              <tr>
                <th className="sticky left-0 z-20 min-w-[140px] 
                    bg-sky-500 
                    rounded-tl-2xl 
                    px-3 py-2.5 
                    text-left text-sm font-medium text-white
                    border-r border-slate-300
">
                  {'วันที่ (เดือน ' + monthLabel + ')'}
                </th>

                {days.map((day, index) => (
                  <th
                    key={day}
                    className={`min-w-[36px] bg-sky-500 px-1 py-2.5 text-center text-sm font-medium text-white 
                      ${index === days.length - 1 ? 'rounded-tr-2xl' : ''
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ward.members.map((member, memberIndex) => {
                const rowBg =
                  memberIndex % 2 === 0 ? 'bg-sky-50/60' : 'bg-white'

                return (
                  <tr key={member.id} className={`${rowBg}`}>
                    <td
                      className={`sticky left-0 z-10 px-3 py-2.5 text-sm font-medium ${rowBg}`}
                    >
                      <span
                        className={
                          member.role === 'head_nurse'
                            ? 'text-sky-600 font-semibold'
                            : 'text-foreground'
                        }
                      >
                        {member.name}
                      </span>
                    </td>

                    {days.map((day) => {
                      const shift = getShiftForDate(
                        ward.schedules,
                        member.id,
                        day
                      )

                      const cellColor = shift
                        ? shiftCellColors[shift] || 'bg-gray-100 text-gray-600'
                        : ''

                      return (
                        <td
                          key={day}
                          className={`border-l border-border-400 px-1 py-2.5 text-center text-xs font-semibold ${cellColor} ${
                            isHeadNurse
                              ? 'cursor-pointer hover:brightness-90 transition-all'
                              : ''
                          }`}
                          onClick={() =>
                            isHeadNurse &&
                            onCellClick(member.id, day, shift)
                          }
                        >
                          {shift}
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
