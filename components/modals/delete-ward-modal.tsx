'use client'

import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteWardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wardName: string
  onDelete: () => void
}

export function DeleteWardModal({
  open,
  onOpenChange,
  wardName,
  onDelete,
}: DeleteWardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="size-6 text-red-500" />
          </div>
          <DialogTitle className="text-center text-foreground">
            ยืนยันการลบวอร์ด
          </DialogTitle>
          <DialogDescription className="text-center">
            คุณต้องการลบวอร์ดผู้ป่วย &quot;{wardName}&quot; นี้หรือไม่? การกระทำนี้ไม่สามารถแก้ไขได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
          >
            ลบวอร์ด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
