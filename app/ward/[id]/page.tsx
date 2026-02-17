'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Copy, Trash2, Save } from 'lucide-react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShiftConfigCard } from '@/components/ward/shift-config-card'
import { ScheduleGrid } from '@/components/ward/schedule-grid'
import { ShiftSummary } from '@/components/ward/shift-summary'
import { ShiftSelectorModal } from '@/components/modals/shift-selector-modal'
import { DeleteWardModal } from '@/components/modals/delete-ward-modal'
import { useAuth } from '@/lib/auth-context'
import { useWard } from '@/lib/ward-context'
import type { ShiftConfig } from '@/lib/types'

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

const shiftBorderColors = [
  'border-sky-300',
  'border-orange-300',
  'border-indigo-300',
]

export default function WardPage() {
  const routeParams = useParams<{ id: string }>()
  const wardId = routeParams.id
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const {
    isHydrated,
    getWardById,
    getUserRole,
    updateShiftConfig,
    updateSchedule,
    clearSchedule,
    deleteWard,
  } = useWard()

  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shiftSelectorOpen, setShiftSelectorOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{
    memberId: string
    date: number
    currentShift: string
  } | null>(null)

  const ward = getWardById(wardId)
  const userRole = user ? getUserRole(wardId, user.id) : null
  const isHeadNurse = userRole === 'head_nurse'

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  // Wait for localStorage hydration before deciding ward is not found
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  if (!ward) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-muted-foreground">Ward not found</p>
        </main>
      </div>
    )
  }

  if (!userRole) {
    router.replace('/home')
    return null
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(ward.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShiftConfigChange = (index: number, newShift: ShiftConfig) => {
    const newShifts = [...ward.shifts]
    newShifts[index] = newShift
    updateShiftConfig(ward.id, newShifts)
  }

  const handleNursesRequiredChange = (index: number, value: string) => {
    const numValue = Number.parseInt(value) || 0
    const newShifts = [...ward.shifts]
    newShifts[index] = { ...newShifts[index], nursesRequired: numValue }
    updateShiftConfig(ward.id, newShifts)
  }

  const handleCellClick = (
    memberId: string,
    date: number,
    currentShift: string
  ) => {
    setSelectedCell({ memberId, date, currentShift })
    setShiftSelectorOpen(true)
  }

  const handleShiftSelect = (shiftCode: string) => {
    if (selectedCell) {
      updateSchedule(
        ward.id,
        selectedCell.memberId,
        selectedCell.date,
        shiftCode
      )
    }
    setSelectedCell(null)
  }

  const handleClearSchedule = () => {
    if (confirm('คุณต้องการล้างตารางเวรทั้งหมดหรือไม่?')) {
      clearSchedule(ward.id)
    }
  }

  const handleDeleteWard = () => {
    deleteWard(ward.id, user.id)
    setDeleteModalOpen(false)
    router.replace('/home')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-20">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.push('/home')}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          ย้อนกลับ
        </button>

        {/* Hospital name & Ward name with actions */}
        <div className="mb-2">
          <h1 className="text-2xl fonttext-foreground">
            {ward.hospitalName}
          </h1>
        </div>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-sky-500">
             {ward.name}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              className="rounded-full bg-orange-500 px-5 text-white hover:bg-orange-600"
              onClick={() => alert('Swap history coming soon')}
            >
              ประวัติการแลกเวร
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-red-300 text-red-500 hover:bg-red-50 bg-transparent"
              onClick={handleClearSchedule}
              disabled={!isHeadNurse}
            >
              ล้างข้อมูล
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-green-400 text-green-600 hover:bg-green-50 bg-transparent"
              onClick={() => alert('Export functionality coming soon')}
            >
              Export
            </Button>
            {isHeadNurse && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg border-red-200 text-red-500 hover:bg-red-50 bg-transparent"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Ward code */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 w-fit">
          <span className="text-sm text-muted-foreground">รหัสเข้าร่วม:</span>
          <span className="font-mono font-semibold text-foreground">
            {showCode ? ward.code : '••••••••'}
          </span>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showCode ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCopyCode}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
          {copied && (
            <span className="text-xs text-green-600">คัดลอกแล้ว!</span>
          )}
        </div>

        {/* Month & Year selectors */}
        <div className="mb-6 flex gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-red-500">
              เดือน *
            </label>
            <Select defaultValue={String(ward.month)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-red-500">
              ปี ค.ศ. *
            </label>
            <Select defaultValue={String(ward.year)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nurse count inputs */}
        <div className="mb-4 grid grid-cols-3 gap-6">
          {ward.shifts.map((shift, index) => (
            <div key={shift.code}>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                จำนวนพยาบาล{shift.name}
              </label>
              <Input
                type="number"
                value={shift.nursesRequired}
                onChange={(e) =>
                  handleNursesRequiredChange(index, e.target.value)
                }
                disabled={!isHeadNurse}
                className="bg-white"
              />
            </div>
          ))}
        </div>

        {/* Shift time config cards */}
        <div className="mb-8 grid grid-cols-3 gap-6">
          {ward.shifts.map((shift, index) => (
            <ShiftConfigCard
              key={shift.code}
              shift={shift}
              onChange={(newShift) => handleShiftConfigChange(index, newShift)}
              disabled={!isHeadNurse}
              borderColor={shiftBorderColors[index]}
            />
          ))}
        </div>

        {/* Schedule grid */}
        <ScheduleGrid
          ward={ward}
          isHeadNurse={isHeadNurse}
          onCellClick={handleCellClick}
        />

        {/* Shift summary */}
        <ShiftSummary ward={ward} />
      </main>

      <ShiftSelectorModal
        open={shiftSelectorOpen}
        onOpenChange={setShiftSelectorOpen}
        onSelect={handleShiftSelect}
        currentShift={selectedCell?.currentShift || ''}
        shifts={ward.shifts}
      />

      <DeleteWardModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        wardName={ward.name}
        onDelete={handleDeleteWard}
      />
    </div>
  )
}
