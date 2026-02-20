'use client'

import type { Ward, NurseSchedule } from '@/lib/types'

interface ShiftSummaryProps {
  ward: Ward
}

function getShiftCounts(
  schedules: NurseSchedule[],
  memberId: string,
): { M: number; A: number; N: number; E: number; L: number; O: number } {
  const schedule = schedules.find((s) => s.memberId === memberId)
  const counts = { M: 0, A: 0, N: 0, E: 0, L: 0, O: 0 }
  if (!schedule) return counts

  for (const entry of schedule.entries) {
    if (entry.shifts.M) counts.M++
    if (entry.shifts.A) counts.A++
    if (entry.shifts.N) counts.N++
    if (entry.shifts.E) counts.E++
    if (entry.shifts.L) counts.L++
    if (entry.shifts.O) counts.O++
  }
  return counts
}

export function ShiftSummary({ ward }: ShiftSummaryProps) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-bold text-foreground">
          {'สรุปเวรของพยาบาลแต่ละคนเดือนนี้'}
        </h3>
      </div>
      <div className="divide-y divide-border/40">
        {ward.members.map((member) => {
          const counts = getShiftCounts(ward.schedules, member.id)
          const totalWork = counts.M + counts.A + counts.N

          return (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
            >
              <span className="text-sm font-medium text-foreground min-w-[160px]">
                {member.name}
              </span>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>{'เช้า : '}{counts.M}</span>
                <span>{'บ่าย : '}{counts.A}</span>
                <span>{'ดึก : '}{counts.N}</span>
                {counts.E > 0 && <span className="text-rose-600">{'ER : '}{counts.E}</span>}
                {counts.L > 0 && <span className="text-gray-500">{'ลา : '}{counts.L}</span>}
                {counts.O > 0 && <span className="text-emerald-600">{'Off : '}{counts.O}</span>}
                <span className="font-bold text-foreground">
                  {'รวมเวรทำงาน : '}{totalWork}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
