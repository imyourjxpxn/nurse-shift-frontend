'use client'

import { Input } from '@/components/ui/input'
import type { ShiftConfig } from '@/lib/types'

interface WardNurseCountsProps {
  shifts: ShiftConfig[]
  disabled: boolean
  onNursesRequiredChange: (index: number, value: string) => void
}

export function WardNurseCounts({
  shifts,
  disabled,
  onNursesRequiredChange,
}: WardNurseCountsProps) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-6">
      {shifts.map((shift, index) => (
        <div key={shift.code}>
          <label className="mb-1.5 block text-sm text-muted-foreground">
            {'จำนวนพยาบาล' + shift.name}
          </label>
          <Input
            type="number"
            value={shift.nursesRequired}
            onChange={(e) => onNursesRequiredChange(index, e.target.value)}
            disabled={disabled}
            className="bg-white"
          />
        </div>
      ))}
    </div>
  )
}
