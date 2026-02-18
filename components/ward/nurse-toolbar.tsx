'use client'

import { Button } from '@/components/ui/button'

interface NurseToolbarProps {
  onMySwapRequest: () => void
  onApproveSwap: () => void
  onExport: () => void
}

export function NurseToolbar({
  onMySwapRequest,
  onApproveSwap,
  onExport,
}: NurseToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="rounded-full bg-sky-500 px-5 text-white hover:bg-sky-600"
        onClick={onMySwapRequest}
      >
        {'คำขอแลกเวรของฉัน'}
      </Button>
      <Button
        variant="outline"
        className="rounded-full border-sky-300 text-sky-600 hover:bg-sky-50 bg-transparent"
        onClick={onApproveSwap}
      >
        {'อนุมัติคำขอแลกเวร'}
      </Button>
      <Button
        variant="outline"
        className="rounded-full border-green-400 text-green-600 hover:bg-green-50 bg-transparent"
        onClick={onExport}
      >
        Export
      </Button>
    </div>
  )
}
