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

export function ShiftConfigCard({
  shift,
  onChange,
  disabled = false,
  borderColor,
}: ShiftConfigCardProps) {
  return (
    <div
      className={`rounded-lg border-2 bg-white p-4 ${borderColor}`}
    >
    <div className="mb-3 flex items-center space-x-2">
      <ClockIcon className="h-4 w-4 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground m-0">
        {shift.name} : {shift.code}
      </p>
    </div>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-red-500 font-medium">
            เริ่ม
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="--:-- --"
              value={shift.startTime}
              onChange={(e) =>{

                const value = e.target.value

                 if (/^[0-9:]*$/.test(value)) {
                onChange({ ...shift, startTime: e.target.value })
                }
            }}
              disabled={disabled}
              className="pr-8 bg-white"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-red-500 font-medium">
            ถึง
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="--:-- --"
              value={shift.endTime}
              onChange={(e) =>
                onChange({ ...shift, endTime: e.target.value })
              }
              disabled={disabled}
              className="pr-8 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
