'use client'

import { ShiftConfigCard } from './shift-config-card'
import type { ShiftConfig } from '@/lib/types'

const shiftBorderColors = [
  'border-sky-300',
  'border-orange-300',
  'border-indigo-300',
]

interface WardShiftConfigsProps {
  shifts: ShiftConfig[]
  disabled: boolean
  onShiftConfigChange: (index: number, newShift: ShiftConfig) => void
}

export function WardShiftConfigs({
  shifts,
  disabled,
  onShiftConfigChange,
}: WardShiftConfigsProps) {
  return (
    <div className="mb-8 grid grid-cols-3 gap-6">
      {shifts.map((shift, index) => (
        <ShiftConfigCard
          key={shift.code}
          shift={shift}
          onChange={(newShift) => onShiftConfigChange(index, newShift)}
          disabled={disabled}
          borderColor={shiftBorderColors[index]}
        />
      ))}
    </div>
  )
}
