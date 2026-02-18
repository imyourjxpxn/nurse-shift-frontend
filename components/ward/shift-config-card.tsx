'use client'

import { Clock as ClockIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { ShiftConfig } from '@/lib/types'

interface ShiftConfigCardProps {
  shift: ShiftConfig
  onChange: (shift: ShiftConfig) => void
  disabled?: boolean
  borderColor: string
}

function clampValue(val: string, min: number, max: number): string {
  if (val === '') return ''
  const num = Number.parseInt(val, 10)
  if (Number.isNaN(num)) return ''
  if (num < min) return String(min)
  if (num > max) return String(max)
  return String(num)
}

export function ShiftConfigCard({
  shift,
  onChange,
  disabled = false,
  borderColor,
}: ShiftConfigCardProps) {
  const handleHourChange = (field: 'startHour' | 'endHour', value: string) => {
    if (value !== '' && !/^\d{0,2}$/.test(value)) return
    onChange({ ...shift, [field]: value })
  }

  const handleMinuteChange = (field: 'startMinute' | 'endMinute', value: string) => {
    if (value !== '' && !/^\d{0,2}$/.test(value)) return
    onChange({ ...shift, [field]: value })
  }

  const handleHourBlur = (field: 'startHour' | 'endHour') => {
    onChange({ ...shift, [field]: clampValue(shift[field], 0, 23) })
  }

  const handleMinuteBlur = (field: 'startMinute' | 'endMinute') => {
    const clamped = clampValue(shift[field], 0, 59)
    onChange({ ...shift, [field]: clamped !== '' ? clamped.padStart(2, '0') : '' })
  }

  return (
    <div className={`rounded-lg border-2 bg-white p-4 ${borderColor}`}>
      <div className="mb-3 flex items-center gap-2">
        <ClockIcon className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {shift.name} : {shift.code}
        </p>
      </div>

      <div className="flex items-end gap-4">
        {/* Start time */}
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-red-500">
            เริ่ม
          </label>
          <div className="flex items-center gap-1">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="HH"
              value={shift.startHour}
              onChange={(e) => handleHourChange('startHour', e.target.value)}
              onBlur={() => handleHourBlur('startHour')}
              disabled={disabled}
              className="w-14 bg-white text-center"
              maxLength={2}
            />
            <span className="text-sm font-bold text-muted-foreground">:</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="MM"
              value={shift.startMinute}
              onChange={(e) => handleMinuteChange('startMinute', e.target.value)}
              onBlur={() => handleMinuteBlur('startMinute')}
              disabled={disabled}
              className="w-14 bg-white text-center"
              maxLength={2}
            />
          </div>
        </div>

        {/* End time */}
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-red-500">
            ถึง
          </label>
          <div className="flex items-center gap-1">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="HH"
              value={shift.endHour}
              onChange={(e) => handleHourChange('endHour', e.target.value)}
              onBlur={() => handleHourBlur('endHour')}
              disabled={disabled}
              className="w-14 bg-white text-center"
              maxLength={2}
            />
            <span className="text-sm font-bold text-muted-foreground">:</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="MM"
              value={shift.endMinute}
              onChange={(e) => handleMinuteChange('endMinute', e.target.value)}
              onBlur={() => handleMinuteBlur('endMinute')}
              disabled={disabled}
              className="w-14 bg-white text-center"
              maxLength={2}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
