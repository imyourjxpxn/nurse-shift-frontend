'use client'

import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WardSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wardName: string
  wardCode: string
  onEnterWard: () => void
}

export function WardSuccessModal({
  open,
  onOpenChange,
  wardName,
  wardCode,
  onEnterWard,
}: WardSuccessModalProps) {
  const [showCode, setShowCode] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(wardCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <div className="flex flex-col items-center pt-4 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-sky-100">
            <CheckCircle2 className="size-10 text-sky-500" />
          </div>
          <h2 className="mb-1 text-xl font-bold text-foreground">
            สร้างวอร์ดสำเร็จ!
          </h2>
          <p className="text-sm text-muted-foreground">
            วอร์ด &quot;{wardName}&quot; ถูกสร้างเรียบร้อยแล้ว
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">รหัสเชิญเข้าร่วม</span>
            <div className="flex gap-2">
              <button
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
                onClick={handleCopyCode}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-wider text-sky-500">
            {showCode ? wardCode : '••••••••'}
          </p>
        </div>

        <div className="mt-2 rounded-lg bg-sky-50 p-4">
          <p className="text-sm text-sky-700">
            <span className="font-semibold">สำคัญ:</span> แชร์รหัสผ่านนี้ให้พยาบาลที่จำเป็นต้องเข้าร่วม โดยรหัสผ่านสามารถเข้าดูได้ในหน้าวอร์ดของคุณ
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 bg-transparent"
            onClick={handleCopyCode}
          >
            <Copy className="size-4" />
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอกรหัส'}
          </Button>
          <Button
            className="flex-1 bg-sky-500 text-white hover:bg-sky-600"
            onClick={onEnterWard}
          >
            เข้าสู่วอร์ด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
