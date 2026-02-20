'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UnsavedChangesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  onSave: () => void
}

export function UnsavedChangesModal({
  open,
  onOpenChange,
  onDiscard,
  onSave,
}: UnsavedChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก คุณต้องการบันทึกก่อนออกหรือไม่?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            className="rounded-full bg-transparent"
            onClick={onDiscard}
          >
            ไม่บันทึกและย้อนกลับ
          </Button>
          <Button
            className="rounded-full bg-sky-500 text-white hover:bg-sky-600"
            onClick={onSave}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
