'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WardMember {
  id: string
  name: string
  role: 'head_nurse' | 'nurse'
  userId: string
}

interface DayShifts { M: boolean; A: boolean; N: boolean; E: boolean; L: boolean; O: boolean }

interface ScheduleEntry {
  date: number
  shifts: DayShifts
}

interface NurseSchedule {
  memberId: string
  entries: ScheduleEntry[]
}

interface CreateSwapRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    toNurseId: string
    toNurseName: string
    fromDate: number
    toDate: number
    fromShiftCode: string
    toShiftCode: string
    reason: string
  }) => void
  currentMemberId: string
  members: WardMember[]
  schedules: NurseSchedule[]
  month: number
  year: number
  /** Pre-filled from cell click */
  initialDate?: number | null
  initialShift?: string | null
  /** Cells locked by pending swap requests */
  lockedCells?: { memberId: string; date: number }[]
}

const shiftNames: Record<string, string> = {
  ช: 'เวรเช้า',
  บ: 'เวรบ่าย',
  ด: 'เวรดึก',
  E: 'Emergency',
  ล: 'ลา',
  O: 'Off',
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

const SLOT_TO_CODE: Partial<Record<keyof DayShifts, string>> = { M: 'ช', A: 'บ', N: 'ด' }

/** Returns the first active shift code for a member on a date (for swap compatibility) */
function getShiftForMemberOnDate(
  schedules: NurseSchedule[],
  memberId: string,
  date: number,
): string {
  const schedule = schedules.find((s) => s.memberId === memberId)
  if (!schedule) return ''
  const entry = schedule.entries.find((e) => e.date === date)
  if (!entry) return ''
  for (const key of ['M', 'A', 'N'] as (keyof DayShifts)[]) {
    if (entry.shifts[key]) return SLOT_TO_CODE[key] ?? ''
  }
  return ''
}

function parseDateInput(value: string, month: number, year: number): number | null {
  const parts = value.split('/')
  if (parts.length !== 3) return null
  const d = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const y = parseInt(parts[2], 10)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null
  if (m !== month || y !== year) return null
  const daysInMonth = getDaysInMonth(month, year)
  if (d < 1 || d > daysInMonth) return null
  return d
}

export function CreateSwapRequestModal({
  open,
  onOpenChange,
  onSubmit,
  currentMemberId,
  members,
  schedules,
  month,
  year,
  initialDate,
  initialShift,
  lockedCells = [],
}: CreateSwapRequestModalProps) {
  const padDate = (d: number) => String(d).padStart(2, '0')
  const padMonth = (m: number) => String(m).padStart(2, '0')

  const [fromDateStr, setFromDateStr] = useState('')
  const [fromDate, setFromDate] = useState<number | null>(null)
  const [fromShift, setFromShift] = useState('')
  const [toNurseId, setToNurseId] = useState('')
  const [toDateStr, setToDateStr] = useState('')
  const [toDate, setToDate] = useState<number | null>(null)
  const [toShift, setToShift] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset & pre-fill when modal opens
  useEffect(() => {
    if (open) {
      if (initialDate && initialShift) {
        const dateStr = `${padDate(initialDate)}/${padMonth(month)}/${year}`
        setFromDateStr(dateStr)
        setFromDate(initialDate)
        setFromShift(initialShift)
      } else {
        setFromDateStr('')
        setFromDate(null)
        setFromShift('')
      }
      setToNurseId('')
      setToDateStr('')
      setToDate(null)
      setToShift('')
      setReason('')
      setErrors({})
    }
  }, [open, initialDate, initialShift, month, year])

  // Auto-map own shift when fromDate changes (only if not pre-filled)
  useEffect(() => {
    if (fromDate && !initialDate) {
      const shift = getShiftForMemberOnDate(schedules, currentMemberId, fromDate)
      setFromShift(shift)
    }
  }, [fromDate, schedules, currentMemberId, initialDate])

  // Auto-map target nurse shift when toDate or toNurseId changes
  useEffect(() => {
    if (toDate && toNurseId) {
      const shift = getShiftForMemberOnDate(schedules, toNurseId, toDate)
      setToShift(shift)
    } else {
      setToShift('')
    }
  }, [toDate, toNurseId, schedules])

  const handleFromDateChange = useCallback(
    (value: string) => {
      setFromDateStr(value)
      const parsed = parseDateInput(value, month, year)
      setFromDate(parsed)
      if (value && !parsed) {
        setErrors((prev) => ({ ...prev, fromDate: 'รูปแบบวันที่ไม่ถูกต้อง (dd/mm/yyyy)' }))
      } else {
        setErrors((prev) => {
          const { fromDate: _, ...rest } = prev
          return rest
        })
      }
    },
    [month, year],
  )

  const handleToDateChange = useCallback(
    (value: string) => {
      setToDateStr(value)
      const parsed = parseDateInput(value, month, year)
      setToDate(parsed)
      if (value && !parsed) {
        setErrors((prev) => ({ ...prev, toDate: 'รูปแบบวันที่ไม่ถูกต้อง (dd/mm/yyyy)' }))
      } else {
        setErrors((prev) => {
          const { toDate: _, ...rest } = prev
          return rest
        })
      }
    },
    [month, year],
  )

  const otherNurses = members.filter((m) => m.id !== currentMemberId && m.role !== 'head_nurse')
  const selectedNurse = members.find((m) => m.id === toNurseId)

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!fromDate) newErrors.fromDate = 'กรุณากรอกวันที่'
    if (!fromShift) newErrors.fromShift = 'ไม่มีเวรในวันนี้'
    if (!toNurseId) newErrors.toNurse = 'กรุณาเลือกพยาบาล'
    if (!toDate) newErrors.toDate = 'กรุณากรอกวันที่'
    if (!toShift) newErrors.toShift = 'ไม่มีเวรในวันนี้'
    if (!reason.trim()) newErrors.reason = 'กรุณากรอกเหตุผล'

    // Check locked cells
    if (fromDate && lockedCells.some((c) => c.memberId === currentMemberId && c.date === fromDate)) {
      newErrors.fromDate = 'เวรนี้อยู่ระหว่างรอการอนุมัติแลกเวร'
    }
    if (toDate && toNurseId && lockedCells.some((c) => c.memberId === toNurseId && c.date === toDate)) {
      newErrors.toDate = 'เวรนี้อยู่ระหว่างรอการอนุมัติแลกเวร'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      toNurseId,
      toNurseName: selectedNurse?.name || '',
      fromDate: fromDate!,
      toDate: toDate!,
      fromShiftCode: fromShift,
      toShiftCode: toShift,
      reason: reason.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            Create Swap request
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Scheduling your co-worker.
          </p>
        </DialogHeader>

        <div className="border-t" />

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Section 1: Own shift (read-only when pre-filled) */}
          <div>
            <Label className="text-base font-bold text-foreground">
              {'เวรของคุณ'}
            </Label>
            <div className="mt-2 flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder={`DD/${padMonth(month)}/${year}`}
                  value={fromDateStr}
                  onChange={(e) => handleFromDateChange(e.target.value)}
                  className="rounded-lg"
                  readOnly={!!initialDate}
                />
                {errors.fromDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.fromDate}</p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  readOnly
                  value={fromShift ? `${shiftNames[fromShift] || fromShift} : ${fromShift}` : ''}
                  placeholder="เวร"
                  className="rounded-lg bg-muted"
                />
                {errors.fromShift && (
                  <p className="mt-1 text-xs text-red-500">{errors.fromShift}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Section 2: Target nurse */}
          <div>
            <Label className="text-base font-bold text-foreground">
              {'ต้องการแลกกับเวรของ'}
            </Label>
            <div className="mt-1">
              <Select value={toNurseId} onValueChange={setToNurseId}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="เลือกพยาบาล" />
                </SelectTrigger>
                <SelectContent>
                  {otherNurses.map((nurse) => (
                    <SelectItem key={nurse.id} value={nurse.id}>
                      {nurse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toNurse && (
                <p className="mt-1 text-xs text-red-500">{errors.toNurse}</p>
              )}
            </div>
            <div className="mt-2 flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="DD/MM/YYYY"
                  value={toDateStr}
                  onChange={(e) => handleToDateChange(e.target.value)}
                  className="rounded-lg"
                  disabled={!toNurseId}
                />
                {errors.toDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.toDate}</p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  readOnly
                  value={toShift ? `${shiftNames[toShift] || toShift} : ${toShift}` : ''}
                  placeholder={'เลือกเวร'}
                  className="rounded-lg bg-muted"
                />
                {errors.toShift && (
                  <p className="mt-1 text-xs text-red-500">{errors.toShift}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Section 3: Reason */}
          <div>
            <Label className="text-base font-bold text-foreground">
              {'เหตุผล'}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              className="mt-2 min-h-[80px] rounded-lg resize-none"
              placeholder="xxxx"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            className="min-w-[120px] rounded-full border-red-300 text-red-500 hover:bg-red-50 bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="min-w-[120px] rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
