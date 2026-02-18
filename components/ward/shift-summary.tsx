'use client'

import type { Ward, NurseSchedule } from '@/lib/types'

interface ShiftSummaryProps {
  ward: Ward
}

function getShiftCounts(
  schedules: NurseSchedule[],
  memberId: string
): Record<string, number> {
  const schedule = schedules.find((s) => s.memberId === memberId)
  if (!schedule) return { ช: 0, บ: 0, ด: 0, E: 0, ล: 0, O: 0 }

  const counts: Record<string, number> = { ช: 0, บ: 0, ด: 0, E: 0, ล: 0, O: 0 }
  for (const entry of schedule.entries) {
    if (entry.shiftCode in counts) {
      counts[entry.shiftCode]++
    }
  }
  return counts
}

export function ShiftSummary({ ward }: ShiftSummaryProps) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-bold text-foreground">
          สรุปเวรของพยาบาลแต่ละคนเดือนนี้
        </h3>
      </div>
      <div className="divide-y divide-border/40">
        {ward.members.map((member) => {
          const counts = getShiftCounts(ward.schedules, member.id)
          const totalWork = counts['ช'] + counts['บ'] + counts['ด'] + counts['E']

          return (
            <div
              key={member.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <span className="text-sm font-medium text-foreground min-w-[160px]">
                {member.name}
              </span>
              <div className="flex items-center gap-5 text-sm text-muted-foreground">
                <span>เวรเช้า : {counts['ช']}</span>
                <span>เวรบ่าย : {counts['บ']}</span>
                <span>เวรดึก : {counts['ด']}</span>
                <span>Emergeny : {counts['E']}</span>
                <span>ลา : {counts['ล']}</span>
                <span>Off : {counts['O']}</span>
                <span className="font-bold text-foreground">
                  รวม : {totalWork}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
