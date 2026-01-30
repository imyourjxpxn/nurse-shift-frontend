'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface JoinWardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wardName: string
  onJoinWard: (code: string) => Promise<{ success: boolean; error?: string }>
}

export function JoinWardModal({
  open,
  onOpenChange,
  wardName,
  onJoinWard,
}: JoinWardModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleJoin = async () => {
    if (code.length !== 8) {
      setError('กรุณากรอกรหัส 8 หลัก')
      return
    }

    setIsLoading(true)
    setError('')

    const result = await onJoinWard(code.toUpperCase())

    if (!result.success) {
      setError(result.error || 'รหัสไม่ถูกต้อง')
    }

    setIsLoading(false)
  }

  const handleClose = () => {
    setCode('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <div className="flex items-center gap-3 pb-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-sky-100">
            <KeyRound className="size-5 text-sky-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">เข้าร่วมหอผู้ป่วย</h2>
            <p className="text-sm text-sky-500">{wardName}</p>
          </div>
        </div>

        <div className="py-4">
          <label className="mb-2 block text-sm text-muted-foreground">
            รหัสหอผู้ป่วย
          </label>
          <Input
            placeholder="กรอกรหัส 8 หลัก"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 8))
              setError('')
            }}
            className="border-sky-300 text-center text-lg tracking-wider focus-visible:ring-sky-400"
            maxLength={8}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleJoin()
            }}
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            ขอรหัสจากหัวหน้าพยาบาลของหอผู้ป่วยนี้
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button
            className="flex-1 bg-sky-500 text-white hover:bg-sky-600"
            onClick={handleJoin}
            disabled={code.length !== 8 || isLoading}
          >
            {isLoading ? 'กำลังเข้าร่วม...' : 'เข้าร่วม'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
