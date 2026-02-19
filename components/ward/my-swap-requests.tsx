'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  getMySwapRequests,
  cancelSwapRequest,
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

interface MySwapRequestsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wardId: string
  memberId: string
  month: number
  year: number
}

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

const statusStyles: Record<string, string> = {
  pending: 'text-blue-600',
  approved: 'text-green-600',
  rejected: 'text-red-500',
  cancelled: 'text-foreground',
}

const statusLabels: Record<string, string> = {
  pending: 'pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancel',
}

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

export function MySwapRequestsModal({
  open,
  onOpenChange,
  wardId,
  memberId,
  month,
  year,
}: MySwapRequestsModalProps) {
  const [requests, setRequests] = useState<SwapRequest[]>([])

  const loadRequests = useCallback(async () => {
    const data = await getMySwapRequests(wardId, memberId, month, year)
    // Sort latest first
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setRequests(data)
  }, [wardId, memberId, month, year])

  useEffect(() => {
    if (open) loadRequests()
  }, [open, loadRequests])

  const handleCancel = async (id: string) => {
    await cancelSwapRequest(id)
    loadRequests()
  }

  const monthLabel = `${thaiMonths[month - 1]} ${year}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0 border-b-0">
          <SheetTitle className="text-xl font-bold text-blue-600">
            My Swap request
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="text-sm font-bold text-foreground mb-4">
            {monthLabel}
          </p>

          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {'ไม่มีคำขอแลกเวร'}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map((req) => (
                <div key={req.id}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">
                      You send Swap request
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(req.createdAt)}
                    </p>
                  </div>

                  {/* Data card */}
                  <div className="rounded-lg border border-border bg-card">
                    <div className="grid grid-cols-4 gap-2 px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Your shift</p>
                        <p className="text-sm font-medium text-foreground">
                          {`${req.fromDate}/${req.month} ${req.fromShiftCode}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Send To</p>
                        <p className="text-sm font-medium text-foreground">
                          {req.toNurseName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Shift to Swap</p>
                        <p className="text-sm font-medium text-foreground">
                          {`${req.toDate}/${req.month} ${req.toShiftCode}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Approve Status</p>
                        {req.status === 'pending' ? (
                          <button
                            onClick={() => handleCancel(req.id)}
                            className={`text-sm font-medium ${statusStyles[req.status]} hover:underline`}
                          >
                            {statusLabels[req.status]}
                          </button>
                        ) : (
                          <p className={`text-sm font-medium ${statusStyles[req.status]}`}>
                            {statusLabels[req.status]}
                          </p>
                        )}
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
