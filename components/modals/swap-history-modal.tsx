'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getApprovedSwapRequests } from '@/services/swap.service'

interface SwapRequest {
  id: string
  wardId: string
  fromNurseId: string
  fromNurseName: string
  toNurseId: string
  toNurseName: string
  fromDate: number
  toDate: number
  fromShiftCode: string
  toShiftCode: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  createdAt: string
  month: number
  year: number
}

interface SwapHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wardId: string
  /** The current user's member ID -- used to show "Your shift" instead of name for the user's own requests */
  currentMemberId?: string
  month: number
  year: number
}

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export function SwapHistoryModal({
  open,
  onOpenChange,
  wardId,
  currentMemberId,
  month,
  year,
}: SwapHistoryModalProps) {
  const [requests, setRequests] = useState<SwapRequest[]>([])

  const loadRequests = useCallback(async () => {
    const data = await getApprovedSwapRequests(wardId, month, year)
    setRequests(data)
  }, [wardId, month, year])

  useEffect(() => {
    if (open) loadRequests()
  }, [open, loadRequests])

  const monthLabel = `${thaiMonths[month - 1]} ${year}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0 border-b-0">
          <SheetTitle className="text-xl font-bold text-black">
            ประวัติการแลกเวร
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="text-sm font-bold text-foreground mb-4">
            {monthLabel}
          </p>

          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {'ไม่มีประวัติการแลกเวร'}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map((req) => {
                const isOwnRequest = req.fromNurseId === currentMemberId
                const fromLabel = isOwnRequest ? 'Your shift' : `${req.fromNurseName}`

                return (
                  <div key={req.id}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-semibold">{req.fromNurseName}</span>
                        {' ส่งคำขอแลกเวร'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(req.createdAt)}
                      </p>
                    </div>

                    {/* Data card */}
                    <div className="rounded-lg border border-border bg-card">
                      <div className="grid grid-cols-4 gap-2 px-4 py-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{fromLabel}</p>
                          <p className="text-sm font-medium text-foreground">
                            {`${req.fromDate}/${req.month} ${req.fromShiftCode}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ส่งถึง</p>
                          <p className="text-sm font-medium text-foreground">
                            {req.toNurseName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">เวรที่จะแลก</p>
                          <p className="text-sm font-medium text-foreground">
                            {`${req.toDate}/${req.month} ${req.toShiftCode}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">สถานะการอนุมัติ</p>
                          <p className="text-sm font-medium text-green-600">
                            Approved
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
