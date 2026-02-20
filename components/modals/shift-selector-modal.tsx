'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/components/ui/use-mobile'
import type { DayShifts } from '@/lib/types'
import {
  emptyDayShifts,
  hasWorkingShift,
  hasSpecialStatus,
} from '@/lib/types'

interface ShiftSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (shifts: DayShifts) => void
  currentShifts: DayShifts
  shifts: {
    code: string
    name: string
    startHour: string
    startMinute: string
    endHour: string
    endMinute: string
  }[]
}

const workingShifts = [
  { key: 'M', code: 'ช', name: 'เวรเช้า', defaultSub: '08.00-16.00' },
  { key: 'A', code: 'บ', name: 'เวรบ่าย', defaultSub: '16.00-24.00' },
  { key: 'N', code: 'ด', name: 'เวรดึก', defaultSub: '00.00-08.00' },
] as const

const specialStatuses = [
  { key: 'E', code: 'E', name: 'Emergency', sub: 'เวรฉุกเฉิน' },
  { key: 'L', code: 'ล', name: 'ลา', sub: 'ลางาน' },
  { key: 'O', code: 'O', name: 'Off', sub: 'วันหยุดทำงาน' },
] as const

const badgeColors: Record<string, string> = {
  M: 'bg-sky-100 text-sky-700',
  A: 'bg-orange-100 text-orange-700',
  N: 'bg-indigo-100 text-indigo-700',
  E: 'bg-rose-100 text-rose-700',
  L: 'bg-gray-100 text-gray-600',
  O: 'bg-emerald-100 text-emerald-700',
}

const activeBorderColors: Record<string, string> = {
  M: 'border-sky-400 ring-sky-200',
  A: 'border-orange-400 ring-orange-200',
  N: 'border-indigo-400 ring-indigo-200',
  E: 'border-rose-400 ring-rose-200',
  L: 'border-gray-400 ring-gray-200',
  O: 'border-emerald-400 ring-emerald-200',
}

const checkColors: Record<string, string> = {
  M: 'border-sky-500 bg-sky-500',
  A: 'border-orange-500 bg-orange-500',
  N: 'border-indigo-500 bg-indigo-500',
}

const radioColors: Record<string, string> = {
  E: 'border-rose-500',
  L: 'border-gray-500',
  O: 'border-emerald-500',
}

const radioDotColors: Record<string, string> = {
  E: 'bg-rose-500',
  L: 'bg-gray-500',
  O: 'bg-emerald-500',
}

// -----------------------------------------------------

function ShiftSelectorContent({
  selected,
  onToggleWork,
  onSelectSpecial,
  onClear,
  onConfirm,
  getSubLabel,
}: any) {
  const isWorkActive = hasWorkingShift(selected)
  const isSpecialActive = hasSpecialStatus(selected)

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">

        {/* Working shifts */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            เวรทำงาน (เลือกได้หลายเวร)
          </p>

          <div className="grid grid-cols-2 gap-2">
            {workingShifts.map((ws) => {
              const isActive = selected[ws.key]
              const isDisabled = isSpecialActive

              return (
                <button
                  key={ws.key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onToggleWork(ws.key)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-2 py-2 text-left transition-all active:scale-[0.98]
                  ${
                    isActive
                      ? `${activeBorderColors[ws.key]} ring-1 bg-card`
                      : isDisabled
                      ? 'border-border bg-muted/40 opacity-50 cursor-not-allowed'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold ${badgeColors[ws.key]}`}
                  >
                    {ws.code}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {ws.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {getSubLabel(ws.code, ws.defaultSub)}
                    </p>
                  </div>

                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border
                    ${
                      isActive
                        ? `${checkColors[ws.key]} text-white`
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {isActive && (
                      <svg
                        className="size-2.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Special statuses */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            สถานะพิเศษ (เลือกได้ 1 อย่าง)
          </p>

          <div className="grid grid-cols-2 gap-2">
            {specialStatuses.map((ss) => {
              const isActive = selected[ss.key]
              const isDisabled = isWorkActive

              return (
                <button
                  key={ss.key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectSpecial(ss.key)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-2 py-2 text-left transition-all active:scale-[0.98]
                  ${
                    isActive
                      ? `${activeBorderColors[ss.key]} ring-1 bg-card`
                      : isDisabled
                      ? 'border-border bg-muted/40 opacity-50 cursor-not-allowed'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold ${badgeColors[ss.key]}`}
                  >
                    {ss.code}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {ss.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {ss.sub}
                    </p>
                  </div>

                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border
                    ${
                      isActive
                        ? radioColors[ss.key]
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {isActive && (
                      <span
                        className={`size-2 rounded-full ${radioDotColors[ss.key]}`}
                      />
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-background pt-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-red-300 text-red-500 hover:bg-red-50"
            onClick={onClear}
          >
            Clear
          </Button>

          <Button
            className="flex-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={onConfirm}
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------

export function ShiftSelectorModal({
  open,
  onOpenChange,
  onSelect,
  currentShifts,
  shifts,
}: ShiftSelectorModalProps) {
  const isMobile = useIsMobile()
  const [selected, setSelected] = useState<DayShifts>({
    ...currentShifts,
  })

  useEffect(() => {
    if (open) setSelected({ ...currentShifts })
  }, [currentShifts, open])

  const getSubLabel = (code: string, defaultSub: string) => {
    const match = shifts.find((sh) => sh.code === code)
    if (match) {
      const start = `${match.startHour.padStart(2, '0')}.${(match.startMinute || '00').padStart(2, '0')}`
      const end = `${match.endHour.padStart(2, '0')}.${(match.endMinute || '00').padStart(2, '0')}`
      return `${start}-${end}`
    }
    return defaultSub
  }

  const handleToggleWork = (key: keyof DayShifts) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSelectSpecial = (key: keyof DayShifts) => {
    if (selected[key]) {
      setSelected((prev) => ({ ...prev, [key]: false }))
    } else {
      const fresh = emptyDayShifts()
      fresh[key] = true
      setSelected(fresh)
    }
  }

  const handleClear = () => {
    onSelect(emptyDayShifts())
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onSelect(selected)
    onOpenChange(false)
  }

  const content = (
    <ShiftSelectorContent
      selected={selected}
      onToggleWork={handleToggleWork}
      onSelectSpecial={handleSelectSpecial}
      onClear={handleClear}
      onConfirm={handleConfirm}
      getSubLabel={getSubLabel}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] rounded-t-2xl px-4 pb-6">
          <DrawerHeader>
            <DrawerTitle className="text-lg font-bold">
              มอบหมายเวร
            </DrawerTitle>
            <p className="text-sm text-muted-foreground">
              เลือกเวรให้กับพยาบาลในวอร์ดคุณ
            </p>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-hidden rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            มอบหมายเวร
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            เลือกเวรให้กับพยาบาลในวอร์ดคุณ
          </p>
        </DialogHeader>

        <div className="mt-4 h-[65vh] flex flex-col">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
}
