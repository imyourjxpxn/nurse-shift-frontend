'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  getIncomingSwapRequests,
  approveSwapRequest,
  rejectSwapRequest,
} from '@/services/swap.service'

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

interface ApproveSwapRequestsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wardId: string
  memberId: string
  month: number
  year: number
  onScheduleUpdate?: () => void
  /** Full approve handler that also applies the swap to the schedule grid */
  onApproveSwap?: (requestId: string, fromNurseId: string, toNurseId: string, fromDate: number, toDate: number, fromShiftCode: string, toShiftCode: string) => Promise<void>
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

export function ApproveSwapRequestsModal({
  open,
  onOpenChange,
  wardId,
  memberId,
  month,
  year,
  onScheduleUpdate,
  onApproveSwap,
}: ApproveSwapRequestsModalProps) {
  const [requests, setRequests] = useState<SwapRequest[]>([])

  const loadRequests = useCallback(async () => {
    const data = await getIncomingSwapRequests(wardId, memberId, month, year)
    // Sort latest first
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setRequests(data)
  }, [wardId, memberId, month, year])

  useEffect(() => {
    if (open) loadRequests()
  }, [open, loadRequests])

  const handleApprove = async (req: SwapRequest) => {
    if (onApproveSwap) {
      await onApproveSwap(req.id, req.fromNurseId, req.toNurseId, req.fromDate, req.toDate, req.fromShiftCode, req.toShiftCode)
    } else {
      await approveSwapRequest(req.id)
    }
    onScheduleUpdate?.()
    loadRequests()
  }

  const handleReject = async (id: string) => {
    await rejectSwapRequest(id)
    loadRequests()
  }

  const monthLabel = `${thaiMonths[month - 1]} ${year}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0 border-b-0">
          <SheetTitle className="text-xl font-bold text-black">
            {'อนุมัติคำขอแลกเวร'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="text-sm font-bold text-foreground mb-4">
            {monthLabel}
          </p>

          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {'ไม่มีคำขออนุมัติ'}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map((req) => (
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
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {`${req.fromNurseName}`}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {`${req.fromDate}/${req.month} ${req.fromShiftCode}`}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">ขอแลกเวรของคุณ</p>
                        <p className="text-sm font-medium text-foreground">
                          {`${req.toDate}/${req.month} ${req.toShiftCode}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-green-500 text-green-600 hover:bg-green-50 bg-transparent px-4"
                          onClick={() => handleApprove(req)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-red-400 text-red-500 hover:bg-red-50 bg-transparent px-4"
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
