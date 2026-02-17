'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ShiftSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (shiftCode: string) => void
  currentShift: string
  shifts: { code: string; name: string; startTime: string; endTime: string }[]
}

const shiftBadgeColors: Record<string, string> = {

    ช: 'bg-sky-100 text-sky-700',
    บ: 'bg-orange-100 text-orange-700',
    ด: 'bg-indigo-100 text-indigo-700',
    E: 'bg-rose-100 text-rose-700',
    ล: 'bg-gray-100 text-gray-500',
    O: 'bg-emerald-100 text-emerald-700'
}


const allShifts = [
    { code: 'ช', name: 'เวรเช้า', sub: '8.00-16.00' },
    { code: 'บ', name: 'เวรบ่าย', sub: '16.00-24.00' },
    { code: 'ด', name: 'เวรดึก', sub: '24.00-8.00' },
    { code: 'E', name: 'Emergency', sub: 'เวรฉุกเฉิน' },
    { code: 'ล', name: 'ลา', sub: 'ลางาน' },
    {code : 'O' , name: 'off', sub: 'วันหยุดทำงาน' }
]

export function ShiftSelectorModal({
  open,
  onOpenChange,
  onSelect,
  currentShift,
  shifts,
}: ShiftSelectorModalProps) {
  const [selected, setSelected] = useState<string>(currentShift)

  useEffect(() => {
    setSelected(currentShift)
  }, [currentShift, open])

  const displayShifts = allShifts.map((s) => {
    const match = shifts.find((sh) => sh.code === s.code)
    if (match && match.startTime && match.endTime) {
      return { ...s, sub: `${match.startTime}-${match.endTime}` }
    }
    return s
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            มอบหมายเวร
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            เลือกเวรให้กับพยาบาลในวอร์ดคุณ
          </p>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {displayShifts.map((shift) => (
            <button
              key={shift.code}
              type="button"
              onClick={() => setSelected(shift.code)}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
              selected === shift.code
                ? 'border-sky-400 ring-2 ring-sky-200 bg-white'
                : 'border-border bg-white hover:border-muted-foreground/30'
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${shiftBadgeColors[shift.code] || 'bg-gray-100 text-gray-600'}`}
              >
                {shift.code}
              </span>
              <div>
                <p className="font-semibold text-foreground">{shift.name}</p>
                <p className="text-xs text-muted-foreground">{shift.sub}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            className="min-w-[100px] rounded-full border-red-300 text-red-500 hover:bg-red-50 bg-transparent"
            onClick={() => {
              onSelect('')
              onOpenChange(false)
            }}
          >
            Clear
          </Button>
          <Button
            className="min-w-[100px] rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              onSelect(selected)
              onOpenChange(false)
            }}
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
