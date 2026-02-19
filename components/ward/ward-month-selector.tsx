'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WardMonthSelectorProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const months = [
  { value: '1', label: 'มกราคม' },
  { value: '2', label: 'กุมภาพันธ์' },
  { value: '3', label: 'มีนาคม' },
  { value: '4', label: 'เมษายน' },
  { value: '5', label: 'พฤษภาคม' },
  { value: '6', label: 'มิถุนายน' },
  { value: '7', label: 'กรกฎาคม' },
  { value: '8', label: 'สิงหาคม' },
  { value: '9', label: 'กันยายน' },
  { value: '10', label: 'ตุลาคม' },
  { value: '11', label: 'พฤศจิกายน' },
  { value: '12', label: 'ธันวาคม' },
]

const years = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i - 2
  return { value: String(year), label: String(year) }
})

export function WardMonthSelector({ month, year, onMonthChange, onYearChange }: WardMonthSelectorProps) {
  return (
    <div className="mb-6 flex gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-red-500">
          {'เดือน *'}
        </label>
        <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-red-500">
          {'ปี ค.ศ. *'}
        </label>
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y.value} value={y.value}>
                {y.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
